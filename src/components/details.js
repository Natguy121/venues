import { esc } from "./dom.js";
import { galleryHTML, enhanceGalleries } from "./gallery.js";
import { renderCalendar } from "./calendar.js";
import { formatMoney, formatLongDate, formatDistance } from "../format.js";
import { billableGuests, estimateTotal } from "../filters.js";
import { config } from "../config.js";

const mapsLink = (venue) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address}, Lebanon`)}`;

/**
 * Fill the venue <dialog> and open it. Sections for details the venue doesn't
 * list (photos, description, prices, dates) are left out.
 * @param dialog   the <dialog> element
 * @param venue    a search result (with upcomingDates / distance)
 * @param context  { today, date, guests }
 */
export function showVenueDetails(dialog, venue, { today, date, guests }) {
  const hasPrice = venue.pricePerPerson != null;
  const hasCapacity = venue.minGuests != null && venue.maxGuests != null;
  const hasDates = venue.upcomingDates !== null;
  let selectedDate = hasDates && venue.upcomingDates.includes(date) ? date : "";
  let guestCount = hasCapacity
    ? Math.min(Math.max(guests || venue.minGuests, venue.minGuests), venue.maxGuests)
    : guests || 10;
  const missing = [!hasPrice && "prices", !hasCapacity && "group sizes", !hasDates && "available dates"].filter(Boolean);

  dialog.innerHTML = `
    <article class="details">
      <button type="button" class="details__close" aria-label="Close">×</button>
      ${venue.images?.length ? galleryHTML(venue, { size: "large" }) : ""}
      <div class="details__body${venue.images?.length ? "" : " details__body--plain"}">
        <div class="details__main">
          <div class="card__meta">
            <span class="badge">${esc(venue.type)}</span>
            ${venue.rating != null ? `<span class="rating">★ ${venue.rating.toFixed(1)}</span>` : ""}
            ${venue.kidFriendly ? `<span class="badge badge--soft">👶 Kid-friendly</span>` : ""}
          </div>
          <h2 id="details-title">${esc(venue.name)}</h2>
          <p class="card__location">📍 ${esc(venue.address)}${
            venue.distance != null ? ` · about ${esc(formatDistance(venue.distance))} away` : ""
          }</p>
          <p><a class="btn btn--ghost btn--small" href="${esc(mapsLink(venue))}" target="_blank" rel="noopener">Find it on Google Maps ↗</a></p>
          ${venue.description ? `<p>${esc(venue.description)}</p>` : ""}
          ${venue.includes?.length ? `<h3>What's included</h3>
          <ul class="includes">${venue.includes.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>` : ""}
          ${hasCapacity && hasPrice ? `<p class="muted">Groups of ${venue.minGuests}–${venue.maxGuests}. Smaller groups are charged the ${venue.minGuests}-guest minimum.</p>` : ""}
          ${missing.length ? `<p class="notice">This venue hasn't listed its ${missing.join(", ").replace(/, ([^,]*)$/, " or $1")} yet. Contact the venue directly to plan your party.</p>` : ""}
          <p class="muted small">Map location is approximate (neighbourhood level).</p>
        </div>
        <aside class="details__side">
          ${hasDates ? `<h3>Available dates</h3><div class="details__calendar"></div>` : ""}
          <div class="quote">
            ${hasPrice ? `<label class="field">
              <span>Guests</span>
              <input type="number" class="quote__guests" min="${hasCapacity ? venue.minGuests : 1}" ${hasCapacity ? `max="${venue.maxGuests}"` : ""} value="${guestCount}">
            </label>
            <div class="quote__summary" aria-live="polite"></div>` : ""}
            <button type="button" class="btn btn--primary quote__book" ${config.bookingEnabled ? "" : "disabled"}>
              ${config.bookingEnabled ? "Book this date" : "Online booking — coming soon"}
            </button>
          </div>
        </aside>
      </div>
    </article>`;
  dialog.setAttribute("aria-labelledby", "details-title");

  const summary = dialog.querySelector(".quote__summary");
  const updateSummary = () => {
    if (!summary) return;
    const billed = hasCapacity ? billableGuests(venue, guestCount) : guestCount;
    summary.innerHTML = `
      ${hasDates ? `<div class="quote__row"><span>Date</span><strong>${selectedDate ? esc(formatLongDate(selectedDate)) : "Pick a date above"}</strong></div>` : ""}
      <div class="quote__row"><span>${esc(formatMoney(venue.pricePerPerson))} × ${billed} guests</span>
        <strong>${esc(formatMoney(hasCapacity ? estimateTotal(venue, guestCount) : venue.pricePerPerson * guestCount))}</strong></div>`;
  };

  if (hasDates) {
    renderCalendar(dialog.querySelector(".details__calendar"), {
      available: venue.upcomingDates,
      today,
      selected: selectedDate,
      onSelect: (iso) => {
        selectedDate = iso;
        updateSummary();
      },
    });
  }

  dialog.querySelector(".quote__guests")?.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    if (Number.isFinite(value) && value > 0) guestCount = hasCapacity ? Math.min(value, venue.maxGuests) : value;
    updateSummary();
  });
  dialog.querySelector(".details__close").addEventListener("click", () => dialog.close());

  updateSummary();
  enhanceGalleries(dialog);
  dialog.showModal();
  dialog.scrollTop = 0;
}
