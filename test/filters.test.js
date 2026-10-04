import { test } from "node:test";
import assert from "node:assert/strict";
import { searchVenues, estimateTotal, distinct } from "../src/filters.js";
import { distanceKm } from "../src/geo.js";
import { venues as sampleVenues } from "../src/data/venues.js";

const venue = (overrides) => ({
  id: "v",
  name: "Venue",
  type: "Restaurant",
  city: "Austin",
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

test("sample data is well formed", () => {
  const seen = new Set();
  for (const v of sampleVenues) {
    assert.ok(!seen.has(v.id), `duplicate id ${v.id}`);
    seen.add(v.id);
    assert.ok(v.images.length > 0, `${v.id} has no images`);
    assert.ok(v.minGuests <= v.maxGuests, `${v.id} capacity`);
    assert.ok(v.pricePerPerson > 0, `${v.id} price`);
    assert.deepEqual(v.availability, [...v.availability].sort(), `${v.id} dates sorted`);
    assert.ok(v.availability.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)), `${v.id} date format`);
  }
  assert.ok(distinct(sampleVenues, "city").length >= 3);
});
