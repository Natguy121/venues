import { test } from "node:test";
import assert from "node:assert/strict";
import { searchVenues, estimateTotal, distinct, dataAvailable } from "../src/filters.js";
import { distanceKm } from "../src/geo.js";
import { venues as sampleVenues } from "../src/data/venues.js";

const venue = (overrides) => ({
  id: "v",
  name: "Venue",
  type: "Restaurant",
  city: "Austin",
  region: "Texas",
  area: "Downtown",
  address: "1 Main St",
  lat: 30.27,
  lng: -97.74,
  pricePerPerson: 40,
  minGuests: 5,
  maxGuests: 50,
  kidFriendly: true,
  rating: 4.5,
  availability: ["2026-10-10", "2026-10-17"],
  ...overrides,
});

const venues = [
  venue({ id: "a", name: "Alpha", city: "Austin", pricePerPerson: 30, rating: 4.2 }),
  venue({ id: "b", name: "Bravo", city: "Chicago", lat: 41.88, lng: -87.63, pricePerPerson: 60, rating: 4.9, kidFriendly: false, type: "Rooftop" }),
  venue({ id: "c", name: "Charlie", city: "Austin", pricePerPerson: 45, rating: 4.6, minGuests: 20, maxGuests: 100, availability: ["2026-10-08"] }),
  venue({ id: "d", name: "Delta", city: "Austin", availability: ["2026-09-01"] }), // only past dates
];
const opts = { today: "2026-10-05" };
const ids = (list) => list.map((v) => v.id);

test("hides venues with no upcoming availability and sorts by rating by default", () => {
  assert.deepEqual(ids(searchVenues(venues, {}, opts)), ["b", "c", "a"]);
});

test("drops past dates from upcomingDates", () => {
  const [result] = searchVenues([venue({ availability: ["2026-10-01", "2026-10-09"] })], {}, opts);
  assert.deepEqual(result.upcomingDates, ["2026-10-09"]);
});

test("filters by city", () => {
  assert.deepEqual(ids(searchVenues(venues, { city: "Austin" }, opts)), ["c", "a"]);
});

test("filters by region, and searches region names", () => {
  const regional = [...venues, venue({ id: "e", name: "Echo", city: "Dallas", region: "North Texas" })];
  assert.deepEqual(ids(searchVenues(regional, { region: "North Texas" }, opts)), ["e"]);
  assert.deepEqual(ids(searchVenues(regional, { query: "north tex" }, opts)), ["e"]);
});

test("filters by date", () => {
  assert.deepEqual(ids(searchVenues(venues, { date: "2026-10-08" }, opts)), ["c"]);
});

test("filters by guest count within capacity", () => {
  assert.deepEqual(ids(searchVenues(venues, { guests: 10 }, opts)), ["b", "a"]);
  assert.deepEqual(ids(searchVenues(venues, { guests: 80 }, opts)), ["c"]);
});

test("filters by max price, type, kid-friendliness and text query", () => {
  assert.deepEqual(ids(searchVenues(venues, { maxPrice: 45 }, opts)), ["c", "a"]);
  assert.deepEqual(ids(searchVenues(venues, { types: ["Rooftop"] }, opts)), ["b"]);
  assert.deepEqual(ids(searchVenues(venues, { kidFriendly: true }, opts)), ["c", "a"]);
  assert.deepEqual(ids(searchVenues(venues, { query: "chic" }, opts)), ["b"]);
});

test("sorts by price and by soonest date", () => {
  assert.deepEqual(ids(searchVenues(venues, { sort: "price-asc" }, opts)), ["a", "c", "b"]);
  assert.deepEqual(ids(searchVenues(venues, { sort: "price-desc" }, opts)), ["b", "c", "a"]);
  assert.equal(searchVenues(venues, { sort: "soonest" }, opts)[0].id, "c");
});

test("distance radius and sort use the origin; ignored without one", () => {
  const austin = { lat: 30.2672, lng: -97.7431 };
  const near = searchVenues(venues, { radius: 50, sort: "distance" }, { ...opts, origin: austin, unit: "mi" });
  assert.deepEqual(ids(near), ["a", "c"]);
  assert.ok(near[0].distance < 1);
  const noOrigin = searchVenues(venues, { radius: 50, sort: "distance" }, opts);
  assert.deepEqual(ids(noOrigin), ["b", "c", "a"]);
});

test("haversine distance is roughly right", () => {
  // New York to Los Angeles is ~3,936 km.
  const km = distanceKm({ lat: 40.7128, lng: -74.006 }, { lat: 34.0522, lng: -118.2437 });
  assert.ok(Math.abs(km - 3936) < 20, `got ${km}`);
});

test("estimated total charges at least the venue minimum", () => {
  const v = venue({ pricePerPerson: 40, minGuests: 10 });
  assert.equal(estimateTotal(v, 4), 400);
  assert.equal(estimateTotal(v, 12), 480);
});

// A venue from the real list: no price, capacity, dates, rating or photos.
const bare = (overrides) => {
  const v = venue(overrides);
  for (const key of ["pricePerPerson", "minGuests", "maxGuests", "availability", "rating", "reviews", "kidFriendly"]) delete v[key];
  return v;
};

test("venues without listed dates are shown, with upcomingDates null", () => {
  const [result] = searchVenues([bare({ id: "x" })], {}, opts);
  assert.equal(result.upcomingDates, null);
});

test("active filters only match venues whose value is known", () => {
  const mixed = [...venues, bare({ id: "x", name: "Xray" })];
  assert.ok(ids(searchVenues(mixed, {}, opts)).includes("x"));
  for (const criteria of [{ maxPrice: 100 }, { guests: 10 }, { date: "2026-10-10" }, { kidFriendly: true }]) {
    assert.ok(!ids(searchVenues(mixed, criteria, opts)).includes("x"), JSON.stringify(criteria));
  }
});

test("venues missing the sorted-on value sort last", () => {
  const mixed = [bare({ id: "x", name: "Aardvark" }), ...venues];
  for (const sort of ["recommended", "price-asc", "price-desc", "soonest"]) {
    assert.equal(searchVenues(mixed, { sort }, opts).at(-1).id, "x", sort);
  }
  const names = ids(searchVenues([bare({ id: "z", name: "Zed" }), bare({ id: "y", name: "Yak" })], {}, opts));
  assert.deepEqual(names, ["y", "z"], "falls back to A–Z by name");
});

test("dataAvailable reports which optional details exist", () => {
  const none = { price: false, capacity: false, dates: false, kidFriendly: false, rating: false, reviews: false };
  assert.deepEqual(dataAvailable([bare({})]), none);
  assert.deepEqual(dataAvailable([bare({}), venue({ reviews: 10 })]), Object.fromEntries(Object.keys(none).map((k) => [k, true])));
});

test("filters by occasion, sorts by review count, searches reviewer notes", () => {
  const list = [
    venue({ id: "p", name: "Park", category: "Birthday", reviews: 50, highlights: ["Trampolines and slides"] }),
    venue({ id: "q", name: "Quay", category: "Restaurants", reviews: 900, highlights: ["Fresh fish"] }),
    venue({ id: "r", name: "Roof", category: "Parties" }),
  ];
  assert.deepEqual(ids(searchVenues(list, { category: "Birthday" }, opts)), ["p"]);
  assert.deepEqual(ids(searchVenues(list, { sort: "reviews" }, opts)), ["q", "p", "r"]);
  assert.deepEqual(ids(searchVenues(list, { query: "trampoline" }, opts)), ["p"]);
  const tied = [venue({ id: "few", rating: 5, reviews: 3 }), venue({ id: "many", rating: 5, reviews: 30 })];
  assert.deepEqual(ids(searchVenues(tied, {}, opts)), ["many", "few"], "equal ratings: more reviews first");
});

test("venue list is well formed", () => {
  const seen = new Set();
  for (const v of sampleVenues) {
    assert.ok(!seen.has(v.id), `duplicate id ${v.id}`);
    seen.add(v.id);
    assert.ok(v.name && v.type && v.category && v.region && v.city && v.area, `${v.id} fields`);
    assert.ok(!v.images, `${v.id} should have no photos`);
    assert.ok(v.rating >= 1 && v.rating <= 5 && v.reviews > 0, `${v.id} rating`);
    assert.match(v.mapsUrl, /^https:\/\/www\.google\.com\/maps\/.*query_place_id=/, `${v.id} maps link`);
    assert.equal(v.highlights.length, 4, `${v.id} highlights`);
    for (const link of v.links ?? []) assert.match(link.url, /^https?:\/\//, `${v.id} link`);
    // Roughly Lebanon's bounding box.
    assert.ok(v.lat > 33.0 && v.lat < 34.7 && v.lng > 35.0 && v.lng < 36.7, `${v.id} coordinates`);
  }
  assert.equal(sampleVenues.length, 100);
  assert.deepEqual(distinct(sampleVenues, "category"), ["Birthday", "Parties", "Restaurants"]);
  assert.deepEqual(sampleVenues.map((v) => v.source), Array.from({ length: 100 }, (_, i) => i + 1), "entries 1–100 in order");
});
