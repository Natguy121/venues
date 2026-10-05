// Pure filtering and sorting logic, kept free of DOM code so it can be unit
// tested and reused by a future server-side search.
import { distanceIn } from "./geo.js";

// "recommended" is by rating when venues have one, otherwise A–Z by name.
export const SORTS = {
  recommended: "Top rated",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  soonest: "Soonest available",
  reviews: "Most reviewed",
  distance: "Nearest first",
};

export const defaultCriteria = () => ({
  query: "",
  category: "",
  region: "",
  city: "",
  types: [],
  guests: null,
  date: "",
  maxPrice: null,
  kidFriendly: false,
  radius: null, // only applied when an origin is known
  sort: "recommended",
});

/**
 * Which optional venue details the catalogue actually has. Prices, capacity,
 * dates, ratings and kid-friendliness are all optional per venue; the UI hides
 * filters and sorts for details no venue has.
 */
export function dataAvailable(venues) {
  return {
    price: venues.some((v) => v.pricePerPerson != null),
    capacity: venues.some((v) => v.minGuests != null && v.maxGuests != null),
    dates: venues.some((v) => Array.isArray(v.availability)),
    kidFriendly: venues.some((v) => v.kidFriendly != null),
    rating: venues.some((v) => v.rating != null),
    reviews: venues.some((v) => v.reviews != null),
  };
}

/** Guests used for pricing: venues charge for at least their minimum. */
export const billableGuests = (venue, guests) => Math.max(guests || 0, venue.minGuests);

export const estimateTotal = (venue, guests) => venue.pricePerPerson * billableGuests(venue, guests);

/**
 * Filter and sort venues.
 * @param venues   venue records (see src/data/venues.js)
 * @param criteria see defaultCriteria()
 * @param options  { today: "YYYY-MM-DD", origin: {lat, lng} | null, unit: "mi" | "km" }
 * @returns venues annotated with `upcomingDates` (null when the venue lists no
 *          dates) and `distance` (null without an origin). An active filter only
 *          matches venues whose value for it is known.
 */
export function searchVenues(venues, criteria, { today, origin = null, unit = "mi" }) {
  const c = { ...defaultCriteria(), ...criteria };
  const query = c.query.trim().toLowerCase();

  const results = venues
    .map((venue) => ({
      ...venue,
      upcomingDates: Array.isArray(venue.availability) ? venue.availability.filter((d) => d >= today) : null,
      distance: origin ? distanceIn(unit, origin, venue) : null,
    }))
    .filter((v) => {
      if (query && ![v.name, v.city, v.region, v.area, v.address, v.type, v.category, ...(v.highlights ?? [])]
        .some((s) => s?.toLowerCase().includes(query)))
        return false;
      if (c.category && v.category !== c.category) return false;
      if (c.region && v.region !== c.region) return false;
      if (c.city && v.city !== c.city) return false;
      if (c.types.length && !c.types.includes(v.type)) return false;
      if (c.guests && !(v.minGuests != null && c.guests >= v.minGuests && c.guests <= v.maxGuests)) return false;
      if (c.date && !v.upcomingDates?.includes(c.date)) return false;
      if (c.maxPrice != null && !(v.pricePerPerson != null && v.pricePerPerson <= c.maxPrice)) return false;
      if (c.kidFriendly && v.kidFriendly !== true) return false;
      if (c.radius && v.distance != null && v.distance > c.radius) return false;
      // Venues that list dates but have none left are fully booked.
      return v.upcomingDates === null || v.upcomingDates.length > 0;
    });

  const sort = c.sort === "distance" && !origin ? "recommended" : c.sort;
  // Venues missing the sorted-on value go last.
  const by = (get, compare) => (a, b) => {
    const [x, y] = [get(a), get(b)];
    if (x == null || y == null) return (x == null) - (y == null);
    return compare(x, y);
  };
  const comparators = {
    // Equal ratings: more reviews first.
    recommended: (a, b) => by((v) => v.rating, (x, y) => y - x)(a, b) || (b.reviews ?? 0) - (a.reviews ?? 0),
    "price-asc": by((v) => v.pricePerPerson, (x, y) => x - y),
    "price-desc": by((v) => v.pricePerPerson, (x, y) => y - x),
    soonest: by((v) => v.upcomingDates?.[0], (x, y) => x.localeCompare(y)),
    reviews: by((v) => v.reviews, (x, y) => y - x),
    distance: by((v) => v.distance, (x, y) => x - y),
  };
  return results.sort((a, b) => comparators[sort](a, b) || a.name.localeCompare(b.name));
}

/** Distinct, sorted values of a venue field — used to build filter options. */
export const distinct = (venues, key) => [...new Set(venues.map((v) => v[key]))].sort();
