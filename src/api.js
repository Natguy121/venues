// Data-access layer. Everything the UI needs from "the server" goes through
// here, so swapping the bundled sample data for a real API (and adding
// bookings) only means changing this file.
import { venues } from "./data/venues.js";
import { config } from "./config.js";

export async function listVenues() {
  return venues;
}

export async function getVenue(id) {
  return venues.find((v) => v.id === id) ?? null;
}

/**
 * Planned for a future version: reserve a venue for a date.
 * Expected payload: { venueId, date: "YYYY-MM-DD", guests, contact: { name, email, phone } }
 */
export async function createBooking(_request) {
  if (!config.bookingEnabled) {
    throw new Error("Online booking is not available yet.");
  }
  throw new Error("createBooking is not implemented.");
}
