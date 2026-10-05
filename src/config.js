// App-wide settings. Change these to localise the site.
export const config = {
  locale: "en-US",
  currency: "USD",
  distanceUnit: "km", // "mi" or "km"
  radiusOptions: [2, 5, 10, 25, 50],
  // Booking is planned for a future version; the UI shows it as "coming soon"
  // until this is switched on and src/api.js#createBooking is implemented.
  bookingEnabled: false,

  // Google Maps Platform API key. When set, venues show their real photos from
  // Google (with photographer credits) and the map uses Google Maps, as Google's
  // terms require for showing its place photos. Leave empty to use the
  // OpenStreetMap map and no Google photos. See "Real venue photos" in README.md
  // for creating and restricting a key.
  googleMapsApiKey: "",
  // Map ID for Google Maps' advanced markers. "DEMO_MAP_ID" works for trying it
  // out; create your own in the Google Cloud console for production.
  googleMapId: "DEMO_MAP_ID",
  // Photos fetched per venue (the details view shows them all, cards the first).
  googlePhotosPerVenue: 6,
};
