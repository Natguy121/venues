import { listVenues } from "./api.js";
import { config } from "./config.js";
import { todayISO } from "./dates.js";
import { searchVenues, defaultCriteria, distinct, dataAvailable, SORTS, AGE_GROUPS, GENDERS } from "./filters.js";
import { formatMoney } from "./format.js";
import { venueCardHTML } from "./components/card.js";
import { enhanceGalleries } from "./components/gallery.js";
import { showVenueDetails } from "./components/details.js";
import { createVenueMap } from "./components/map.js";
import { createGoogleVenueMap } from "./components/google-map.js";
import { loadVenuePhotos } from "./components/photos.js";
import { onGoogleFailure } from "./google.js";
import { esc } from "./components/dom.js";

const $ = (selector) => document.querySelector(selector);
const form = $("#filters");
const grid = $("#grid");
const dialog = $("#venue-dialog");
const today = todayISO();
const PAGE_SIZE = 24;

let venues = [];
let info = {}; // which optional details the venues have; see dataAvailable()
let results = [];
let origin = null;
let criteria = defaultCriteria();
let priceCeiling = 0;
let venueMap = null;
let venueById = new Map();
let shown = PAGE_SIZE;

// ---- URL <-> criteria ------------------------------------------------------
// Filters live in the query string so searches can be bookmarked and shared.
// The user's location is deliberately never written to the URL.

function readURL() {
  const p = new URLSearchParams(location.search);
  const num = (key) => (p.get(key) ? Number(p.get(key)) : null);
  return {
    ...defaultCriteria(),
    query: p.get("q") ?? "",
    gender: GENDERS.some((g) => g.id && g.id === p.get("for")) ? p.get("for") : "",
    ages: (p.get("ages") ?? "").split(",").filter((id) => AGE_GROUPS.some((g) => g.id === id)),
    category: p.get("occasion") ?? "",
    region: p.get("region") ?? "",
    city: p.get("city") ?? "",
    types: p.get("types") ? p.get("types").split(",") : [],
    guests: num("guests"),
    date: p.get("date") && p.get("date") >= today ? p.get("date") : "",
    maxPrice: num("maxPrice"),
    kidFriendly: p.get("kids") === "1",
    radius: num("radius"),
    sort: SORTS[p.get("sort")] ? p.get("sort") : "recommended",
  };
}

function writeURL() {
  const p = new URLSearchParams();
  if (criteria.query) p.set("q", criteria.query);
  if (criteria.gender) p.set("for", criteria.gender);
  if (criteria.ages.length) p.set("ages", criteria.ages.join(","));
  if (criteria.category) p.set("occasion", criteria.category);
  if (criteria.region) p.set("region", criteria.region);
  if (criteria.city) p.set("city", criteria.city);
  if (criteria.types.length) p.set("types", criteria.types.join(","));
  if (criteria.guests) p.set("guests", criteria.guests);
  if (criteria.date) p.set("date", criteria.date);
  if (criteria.maxPrice != null && criteria.maxPrice < priceCeiling) p.set("maxPrice", criteria.maxPrice);
  if (criteria.kidFriendly) p.set("kids", "1");
  if (criteria.radius) p.set("radius", criteria.radius);
  if (criteria.sort !== "recommended") p.set("sort", criteria.sort);
  if (dialog.open && dialog.dataset.venue) p.set("venue", dialog.dataset.venue);
  const query = p.toString();
  history.replaceState(null, "", query ? `?${query}` : location.pathname);
}

// ---- Form <-> criteria -----------------------------------------------------

/** Town options, limited to the chosen region. */
function fillTowns(region) {
  const towns = distinct(region ? venues.filter((v) => v.region === region) : venues, "city");
  const current = form.city.value;
  form.city.innerHTML = `<option value="">${region ? `All of ${esc(region)}` : "All towns"}</option>` +
    towns.map((c) => `<option>${esc(c)}</option>`).join("");
  form.city.value = towns.includes(current) ? current : "";
}

/** Venue-type pills, limited to the chosen occasion. Keeps checked types that remain. */
function fillTypes(category) {
  const checked = new Set([...form.querySelectorAll('[name="types"]:checked')].map((box) => box.value));
  $("#types").innerHTML = distinct(category ? venues.filter((v) => v.category === category) : venues, "type")
    .map((t) => `<label class="pill"><input type="checkbox" name="types" value="${esc(t)}"${checked.has(t) ? " checked" : ""}><span>${esc(t)}</span></label>`)
    .join("");
}

// The age chips and location controls live in the hero, outside the <form>
// element (the selects join it via their form="filters" attribute).
const ageBoxes = () => [...document.querySelectorAll('#age-chips [name="ages"]')];

function buildForm() {
  $("#age-chips").innerHTML = AGE_GROUPS.map(
    (g) => `<label class="age-chip"><input type="checkbox" name="ages" value="${g.id}">
      <span><b aria-hidden="true">${g.icon}</b> ${esc(g.label)} <small>${g.ages}</small></span></label>`,
  ).join("");
  $("#gender-chips").innerHTML = GENDERS.map(
    (g) => `<label class="age-chip"><input type="radio" name="gender" value="${g.id}"${g.id ? "" : " checked"}>
      <span><b aria-hidden="true">${g.icon}</b> ${esc(g.label)}</span></label>`,
  ).join("");
  if (!info.ages) $("#age-chips").closest("fieldset").hidden = true;
  const categories = distinct(venues, "category");
  $("#categories").innerHTML = ["", ...categories]
    .map((c) => `<label class="segmented__option"><input type="radio" name="category" value="${esc(c)}"${c ? "" : " checked"}><span>${c ? esc(c) : "All"}</span></label>`)
    .join("");
  if (categories.length < 2) $("#categories").closest("fieldset").hidden = true;
  form.region.insertAdjacentHTML(
    "beforeend",
    distinct(venues, "region").map((r) => `<option>${esc(r)}</option>`).join(""),
  );
  fillTowns("");
  form.radius.insertAdjacentHTML(
    "beforeend",
    config.radiusOptions.map((r) => `<option value="${r}">Within ${r} ${config.distanceUnit}</option>`).join(""),
  );
  fillTypes("");
  // Hide filters and sorts for details no venue lists yet.
  form.querySelectorAll("[data-needs]").forEach((el) => (el.hidden = !info[el.dataset.needs]));
  form.querySelectorAll("fieldset").forEach((set) => {
    const fields = [...set.children].filter((el) => el.tagName !== "LEGEND");
    if (fields.every((el) => el.hidden)) set.hidden = true;
  });
  const sortNeeds = { "price-asc": "price", "price-desc": "price", soonest: "dates", reviews: "reviews" };
  form.sort.innerHTML = Object.entries(SORTS)
    .filter(([value]) => !sortNeeds[value] || info[sortNeeds[value]])
    .map(([value, label]) => `<option value="${value}">${esc(value === "recommended" && !info.rating ? "Name A–Z" : label)}</option>`)
    .join("");

  const prices = venues.map((v) => v.pricePerPerson).filter((p) => p != null);
  if (prices.length) {
    priceCeiling = Math.max(...prices);
    form.maxPrice.min = Math.min(...prices);
    form.maxPrice.max = priceCeiling;
  }
  form.date.min = today;
}

function syncFormFromCriteria() {
  $("#q").value = criteria.query;
  ageBoxes().forEach((box) => (box.checked = criteria.ages.includes(box.value)));
  document.querySelectorAll('#gender-chips [name="gender"]').forEach((r) => (r.checked = r.value === criteria.gender));
  const radio = form.querySelector(`[name="category"][value="${CSS.escape(criteria.category)}"]`);
  (radio ?? form.querySelector('[name="category"][value=""]')).checked = true;
  fillTypes(radio ? criteria.category : "");
  form.region.value = criteria.region;
  fillTowns(form.region.value);
  form.city.value = criteria.city;
  form.radius.value = criteria.radius ?? "";
  form.date.value = criteria.date;
  form.guests.value = criteria.guests ?? "";
  form.kidFriendly.checked = criteria.kidFriendly;
  form.maxPrice.value = criteria.maxPrice ?? priceCeiling;
  form.sort.value = criteria.sort;
  form.querySelectorAll('[name="types"]').forEach((box) => (box.checked = criteria.types.includes(box.value)));
  updateControls();
}

function readCriteriaFromForm() {
  const maxPrice = Number(form.maxPrice.value);
  const guests = Number(form.guests.value);
  criteria = {
    query: $("#q").value,
    gender: document.querySelector('#gender-chips [name="gender"]:checked')?.value ?? "",
    ages: ageBoxes().filter((box) => box.checked).map((box) => box.value),
    category: form.querySelector('[name="category"]:checked')?.value ?? "",
    region: form.region.value,
    city: form.city.value,
    types: [...form.querySelectorAll('[name="types"]:checked')].map((box) => box.value),
    guests: info.capacity && guests > 0 ? guests : null,
    date: info.dates && form.date.value >= today ? form.date.value : "",
    maxPrice: info.price && maxPrice < priceCeiling ? maxPrice : null,
    kidFriendly: info.kidFriendly && form.kidFriendly.checked,
    radius: origin && form.radius.value ? Number(form.radius.value) : null,
    sort: form.sort.value || "recommended",
  };
}

function updateControls() {
  if (info.price) $("#max-price-label").textContent = formatMoney(Number(form.maxPrice.value));
  form.radius.hidden = !origin;
  form.sort.querySelector('[value="distance"]').disabled = !origin;
  const active = [
    criteria.query,
    criteria.ages.length,
    criteria.category,
    criteria.region,
    criteria.city,
    criteria.types.length,
    criteria.guests,
    criteria.date,
    criteria.maxPrice != null,
    criteria.kidFriendly,
    criteria.radius,
  ].filter(Boolean).length;
  $(".filters-toggle__count").textContent = active ? `(${active})` : "";
}

// ---- Rendering -------------------------------------------------------------

const NOUNS = {
  "Play & parties": ["place to play", "places to play"],
  "Pools & beaches": ["pool or beach", "pools and beaches"],
  "Family meals": ["family restaurant", "family restaurants"],
};

function render() {
  results = searchVenues(venues, criteria, { today, origin, unit: config.distanceUnit });
  const count = results.length;
  const place = criteria.city || criteria.region;
  const [one, many] = NOUNS[criteria.category] ?? ["place", "places"];
  $("#results-title").textContent = `${count} ${count === 1 ? one : many}${
    place ? ` in ${place}` : origin && criteria.radius ? " near you" : ""
  }`;
  $("#empty").hidden = count > 0;
  renderCards();
  venueMap?.update(results, origin);
}

/** Cards are rendered a page at a time; the map always shows every result. */
function renderCards() {
  const visible = results.slice(0, shown);
  grid.innerHTML = visible.map((v, i) => venueCardHTML(v, criteria, { eager: i < 6 })).join("");
  enhanceGalleries(grid);
  loadVenuePhotos(grid, venueById);
  const left = results.length - visible.length;
  $("#more").hidden = left <= 0;
  $("#show-more").textContent = `Show ${Math.min(left, PAGE_SIZE)} more (${left} left)`;
}

function showMore() {
  const before = grid.children.length;
  shown += PAGE_SIZE;
  renderCards();
  grid.children[before]?.querySelector(".card__link")?.focus({ preventScroll: true });
}

function update(event) {
  if (event?.target === form.region) fillTowns(form.region.value);
  if (event?.target.name === "category") fillTypes(event.target.value);
  shown = PAGE_SIZE;
  readCriteriaFromForm();
  updateControls();
  render();
  writeURL();
}

function openVenue(id) {
  const venue = results.find((v) => v.id === id) ??
    searchVenues(venues, {}, { today, origin, unit: config.distanceUnit }).find((v) => v.id === id);
  if (!venue) return;
  dialog.dataset.venue = id;
  showVenueDetails(dialog, venue, { today, date: criteria.date, guests: criteria.guests });
  writeURL();
}

function clearFilters() {
  criteria = { ...defaultCriteria(), sort: criteria.sort === "distance" && !origin ? "recommended" : criteria.sort };
  syncFormFromCriteria();
  update();
}

// ---- Location --------------------------------------------------------------

function locate() {
  const status = $("#location-status");
  if (!navigator.geolocation) {
    status.textContent = "Your browser can't share its location. Pick a town instead.";
    return;
  }
  status.textContent = "Finding your location…";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      status.textContent = "Showing distances from your location.";
      form.region.value = "";
      fillTowns("");
      form.sort.value = "distance";
      if (!form.radius.value) form.radius.value = String(config.radiusOptions.at(-1));
      form.radius.hidden = false;
      update();
    },
    () => {
      status.textContent = "Couldn't get your location. Pick a town instead.";
    },
    { timeout: 10000, maximumAge: 300000 },
  );
}

// ---- Events ----------------------------------------------------------------

function bindEvents() {
  form.addEventListener("input", update);
  form.sort.addEventListener("input", update); // lives outside the <form> element
  form.addEventListener("submit", (e) => e.preventDefault());
  $("#quick-search").addEventListener("submit", (e) => e.preventDefault());
  $("#hero").addEventListener("input", update); // age chips, location, search
  $("#locate").addEventListener("click", locate);
  $("#clear").addEventListener("click", clearFilters);
  $("#empty-clear").addEventListener("click", clearFilters);
  $("#show-more").addEventListener("click", showMore);

  const toggle = $(".filters-toggle");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    form.classList.toggle("is-open", open);
  });

  // Clicking anywhere on a card (except the photo controls) opens its details.
  grid.addEventListener("click", (event) => {
    if (event.target.closest(".gallery__nav, a")) return;
    const card = event.target.closest(".card");
    if (card) openVenue(card.dataset.id);
  });

  dialog.addEventListener("close", () => {
    delete dialog.dataset.venue;
    writeURL();
  });
  // Close when clicking the backdrop.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

/**
 * Google Maps when a key is set (required alongside Google's place photos),
 * otherwise, or if Google fails, the OpenStreetMap map.
 */
async function setUpMap() {
  const options = { onSelect: openVenue };
  let switched = false;
  const useOpenStreetMap = () => {
    if (switched) return;
    switched = true;
    const fresh = document.createElement("div"); // clear anything Google drew
    fresh.className = "venue-map";
    fresh.id = "map";
    $("#map").replaceWith(fresh);
    venueMap = createVenueMap(fresh, options);
    venueMap?.update(results, origin);
  };
  onGoogleFailure(useOpenStreetMap);
  venueMap = await createGoogleVenueMap($("#map"), options);
  if (venueMap) venueMap.update(results, origin);
  else useOpenStreetMap();
}

async function init() {
  venues = await listVenues();
  venueById = new Map(venues.map((v) => [v.id, v]));
  info = dataAvailable(venues);
  buildForm();
  criteria = readURL();
  syncFormFromCriteria();
  readCriteriaFromForm(); // normalise values the form rejected
  bindEvents();
  render();
  setUpMap();
  writeURL(); // drop parameters the form rejected
  const deepLink = new URLSearchParams(location.search).get("venue");
  if (deepLink) openVenue(deepLink);
}

init();
