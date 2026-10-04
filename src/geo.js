const EARTH_RADIUS_KM = 6371;
const KM_PER_MILE = 1.609344;

/** Great-circle distance between two {lat, lng} points, in kilometres. */
export function distanceKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function distanceIn(unit, a, b) {
  const km = distanceKm(a, b);
  return unit === "mi" ? km / KM_PER_MILE : km;
}
