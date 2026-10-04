import { esc } from "./dom.js";
import { galleryHTML } from "./gallery.js";
import { formatMoney, formatShortDate, formatDistance } from "../format.js";

const MAX_DATE_CHIPS = 4;

export function venueCardHTML(venue, criteria) {
  const { upcomingDates } = venue;
  const chips = criteria.date
    ? `<span class="chip chip--match">✓ ${esc(formatShortDate(criteria.date))}</span>`
    : upcomingDates
        .slice(0, MAX_DATE_CHIPS)
        .map((d) => `<span class="chip">${esc(formatShortDate(d))}</span>`)
        .join("");
  const more = criteria.date ? upcomingDates.length - 1 : upcomingDates.length - MAX_DATE_CHIPS;

  return `<article class="card" data-id="${esc(venue.id)}">
    ${galleryHTML(venue)}
    <div class="card__body">
      <div class="card__meta">
        <span class="badge">${esc(venue.type)}</span>
        <span class="rating" aria-label="Rated ${venue.rating} out of 5">★ ${venue.rating.toFixed(1)}</span>
      </div>
      <h3 class="card__title"><button type="button" class="card__link" data-open="${esc(venue.id)}">${esc(venue.name)}</button></h3>
      <p class="card__location">📍 ${esc(venue.area)}, ${esc(venue.city)}${
        venue.distance != null ? ` · ${esc(formatDistance(venue.distance))} away` : ""
      }</p>
      <p class="card__price"><strong>${esc(formatMoney(venue.pricePerPerson))}</strong> per person
        <span class="muted">· ${venue.minGuests}–${venue.maxGuests} guests</span></p>
      <div class="card__dates">
        <span class="card__label">${criteria.date ? "Available on" : "Next available"}</span>
        <div class="chips">${chips}${more > 0 ? `<span class="chip chip--more">+${more} more</span>` : ""}</div>
      </div>
      ${venue.kidFriendly ? `<p class="card__tag">👶 Kid-friendly</p>` : ""}
    </div>
  </article>`;
}
