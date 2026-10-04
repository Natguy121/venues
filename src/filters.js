// Pure filtering and sorting logic, kept free of DOM code so it can be unit
// tested and reused by a future server-side search.
import { distanceIn } from "./geo.js";

export const SORTS = {
  recommended: "Top rated",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  soonest: "Soonest available",
  distance: "Nearest first",
};

export const defaultCriteria = () => ({
  query: "",
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

/** Guests used for pricing: venues charge for at least their minimum. */
export const billableGuests = (venue, guests) => Math.max(guests || 0, venue.minGuests);

export const estimateTotal = (venue, guests) => venue.pricePerPerson * billableGuests(venue, guests);

/**
 * Filter and sort venues.
 * @param venues   venue records (see src/data/venues.js)
 * @param criteria see defaultCriteria()
 * @param options  { today: "YYYY-MM-DD", origin: {lat, lng} | null, unit: "mi" | "km" }
 * @returns venues annotated with `upcomingDates` and `distance` (null without an origin)
 */
export function searchVenues(venues, criteria, { today, origin = null, unit = "mi" }) {
  const c = { ...defaultCriteria(), ...criteria };
  const query = c.query.trim().toLowerCase();

  const results = venues
    .map((venue) => ({
      ...venue,
      upcomingDates: venue.availability.filter((d) => d >= today),
      distance: origin ? distanceIn(unit, origin, venue) : null,
    }))
    .filter((v) => {
      if (query && ![v.name, v.city, v.region, v.area, v.address, v.type].some((s) => s.toLowerCase().includes(query)))
        return false;
      if (c.region && v.region !== c.region) return false;
      if (c.city && v.city !== c.city) return false;
      if (c.types.length && !c.types.includes(v.type)) return false;
      if (c.guests && (c.guests < v.minGuests || c.guests > v.maxGuests)) return false;
      if (c.date && !v.upcomingDates.includes(c.date)) return false;
      if (c.maxPrice != null && v.pricePerPerson > c.maxPrice) return false;
      if (c.kidFriendly && !v.kidFriendly) return false;
      if (c.radius && v.distance != null && v.distance > c.radius) return false;
      return v.upcomingDates.length > 0;
    });

  const sort = c.sort === "distance" && !origin ? "recommended" : c.sort;
  const firstDate = (v) => v.upcomingDates[0] ?? "9999-12-31";
  const comparators = {
    recommended: (a, b) => b.rating - a.rating,
    "price-asc": (a, b) => a.pricePerPerson - b.pricePerPerson,
    "price-desc": (a, b) => b.pricePerPerson - a.pricePerPerson,
    soonest: (a, b) => firstDate(a).localeCompare(firstDate(b)),
    distance: (a, b) => a.distance - b.distance,
  };
  return results.sort((a, b) => comparators[sort](a, b) || a.name.localeCompare(b.name));
}

/** Distinct, sorted values of a venue field — used to build filter options. */
export const distinct = (venues, key) => [...new Set(venues.map((v) => v[key]))].sort();
