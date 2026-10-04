import { listVenues } from "./api.js";
import { config } from "./config.js";
import { todayISO } from "./dates.js";
import { searchVenues, defaultCriteria, distinct, SORTS } from "./filters.js";
import { formatMoney } from "./format.js";
import { venueCardHTML } from "./components/card.js";
import { enhanceGalleries } from "./components/gallery.js";
import { showVenueDetails } from "./components/details.js";
import { esc } from "./components/dom.js";

const $ = (selector) => document.querySelector(selector);
const form = $("#filters");
const grid = $("#grid");
const dialog = $("#venue-dialog");
const today = todayISO();

let venues = [];
let results = [];
let origin = null;
let criteria = defaultCriteria();
let priceCeiling = 0;

// ---- URL <-> criteria ------------------------------------------------------
// Filters live in the query string so searches can be bookmarked and shared.
// The user's location is deliberately never written to the URL.

function readURL() {
  const p = new URLSearchParams(location.search);
  const num = (key) => (p.get(key) ? Number(p.get(key)) : null);
  return {
    ...defaultCriteria(),
    query: p.get("q") ?? "",
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

function buildForm() {
  form.city.insertAdjacentHTML(
    "beforeend",
    distinct(venues, "city").map((c) => `<option>${esc(c)}</option>`).join(""),
  );
  form.radius.insertAdjacentHTML(
    "beforeend",
    config.radiusOptions.map((r) => `<option value="${r}">Within ${r} ${config.distanceUnit}</option>`).join(""),
  );
  $("#types").innerHTML = distinct(venues, "type")
    .map((t) => `<label class="pill"><input type="checkbox" name="types" value="${esc(t)}"><span>${esc(t)}</span></label>`)
    .join("");
  form.sort.innerHTML = Object.entries(SORTS)
    .map(([value, label]) => `<option value="${value}">${esc(label)}</option>`)
    .join("");

  const prices = venues.map((v) => v.pricePerPerson);
  priceCeiling = Math.max(...prices);
  form.maxPrice.min = Math.min(...prices);
  form.maxPrice.max = priceCeiling;
  form.date.min = today;
}

function syncFormFromCriteria() {
  $("#q").value = criteria.query;
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
    city: form.city.value,
    types: [...form.querySelectorAll('[name="types"]:checked')].map((box) => box.value),
    guests: guests > 0 ? guests : null,
    date: form.date.value >= today ? form.date.value : "",
    maxPrice: maxPrice < priceCeiling ? maxPrice : null,
    kidFriendly: form.kidFriendly.checked,
    radius: origin && form.radius.value ? Number(form.radius.value) : null,
    sort: form.sort.value,
  };
}

function updateControls() {
  $("#max-price-label").textContent = formatMoney(Number(form.maxPrice.value));
  form.radius.disabled = !origin;
  form.sort.querySelector('[value="distance"]').disabled = !origin;
  const active = [
    criteria.query,
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

function render() {
  results = searchVenues(venues, criteria, { today, origin, unit: config.distanceUnit });
  const count = results.length;
  $("#results-title").textContent = `${count} ${count === 1 ? "venue" : "venues"}${
    criteria.city ? ` in ${criteria.city}` : origin && criteria.radius ? " near you" : ""
  }`;
  grid.innerHTML = results.map((v) => venueCardHTML(v, criteria)).join("");
  $("#empty").hidden = count > 0;
  enhanceGalleries(grid);
}

function update() {
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
    status.textContent = "Your browser can't share its location. Pick a city instead.";
    return;
  }
  status.textContent = "Finding your location…";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      status.textContent = "Showing distances from your location.";
      form.city.value = "";
      form.sort.value = "distance";
      if (!form.radius.value) form.radius.value = String(config.radiusOptions.at(-1));
      form.radius.disabled = false;
      update();
    },
    () => {
      status.textContent = "Couldn't get your location. Pick a city instead.";
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
  $("#q").addEventListener("input", update);
  $("#locate").addEventListener("click", locate);
  $("#clear").addEventListener("click", clearFilters);
  $("#empty-clear").addEventListener("click", clearFilters);

  const toggle = $(".filters-toggle");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    form.classList.toggle("is-open", open);
  });

  // Clicking anywhere on a card (except the photo controls) opens its details.
  grid.addEventListener("click", (event) => {
    if (event.target.closest(".gallery__nav")) return;
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

async function init() {
  venues = await listVenues();
  buildForm();
  criteria = readURL();
  syncFormFromCriteria();
  readCriteriaFromForm(); // normalise values the form rejected
  bindEvents();
  render();
  const deepLink = new URLSearchParams(location.search).get("venue");
  if (deepLink) openVenue(deepLink);
}

init();
