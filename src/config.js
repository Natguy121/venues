// App-wide settings. Change these to localise the site.
export const config = {
  locale: "en-US",
  currency: "USD",
  distanceUnit: "km", // "mi" or "km"
  radiusOptions: [2, 5, 10, 25, 50],
  // Booking is planned for a future version; the UI shows it as "coming soon"
  // until this is switched on and src/api.js#createBooking is implemented.
  bookingEnabled: false,
};
