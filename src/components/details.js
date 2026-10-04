import { esc } from "./dom.js";
import { galleryHTML, enhanceGalleries } from "./gallery.js";
import { renderCalendar } from "./calendar.js";
import { formatMoney, formatLongDate, formatDistance } from "../format.js";
import { billableGuests, estimateTotal } from "../filters.js";
import { config } from "../config.js";

/**
 * Fill the venue <dialog> and open it.
 * @param dialog   the <dialog> element
 * @param venue    a search result (with upcomingDates / distance)
 * @param context  { today, date, guests }
 */
export function showVenueDetails(dialog, venue, { today, date, guests }) {
  let selectedDate = venue.upcomingDates.includes(date) ? date : "";
  let guestCount = Math.min(Math.max(guests || venue.minGuests, venue.minGuests), venue.maxGuests);

  dialog.innerHTML = `
    <article class="details">
      <button type="button" class="details__close" aria-label="Close">×</button>
      ${galleryHTML(venue, { size: "large" })}
      <div class="details__body">
        <div class="details__main">
          <div class="card__meta">
            <span class="badge">${esc(venue.type)}</span>
            <span class="rating">★ ${venue.rating.toFixed(1)}</span>
            ${venue.kidFriendly ? `<span class="badge badge--soft">👶 Kid-friendly</span>` : ""}
          </div>
          <h2 id="details-title">${esc(venue.name)}</h2>
          <p class="card__location">📍 ${esc(venue.address)}${
            venue.distance != null ? ` · ${esc(formatDistance(venue.distance))} away` : ""
          }</p>
          <p>${esc(venue.description)}</p>
          <h3>What's included</h3>
          <ul class="includes">${venue.includes.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
          <p class="muted">Groups of ${venue.minGuests}–${venue.maxGuests}. Smaller groups are charged the ${venue.minGuests}-guest minimum.</p>
        </div>
        <aside class="details__side">
          <h3>Available dates</h3>
          <div class="details__calendar"></div>
          <div class="quote">
            <label class="field">
              <span>Guests</span>
              <input type="number" class="quote__guests" min="${venue.minGuests}" max="${venue.maxGuests}" value="${guestCount}">
            </label>
            <div class="quote__summary" aria-live="polite"></div>
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
    const billed = billableGuests(venue, guestCount);
    summary.innerHTML = `
      <div class="quote__row"><span>Date</span><strong>${selectedDate ? esc(formatLongDate(selectedDate)) : "Pick a date above"}</strong></div>
      <div class="quote__row"><span>${esc(formatMoney(venue.pricePerPerson))} × ${billed} guests</span>
        <strong>${esc(formatMoney(estimateTotal(venue, guestCount)))}</strong></div>`;
  };

  renderCalendar(dialog.querySelector(".details__calendar"), {
    available: venue.upcomingDates,
    today,
    selected: selectedDate,
    onSelect: (iso) => {
      selectedDate = iso;
      updateSummary();
    },
  });

  dialog.querySelector(".quote__guests").addEventListener("input", (event) => {
    const value = Number(event.target.value);
    if (Number.isFinite(value) && value > 0) guestCount = Math.min(value, venue.maxGuests);
    updateSummary();
  });
  dialog.querySelector(".details__close").addEventListener("click", () => dialog.close());

  updateSummary();
  enhanceGalleries(dialog);
  dialog.showModal();
  dialog.scrollTop = 0;
}
