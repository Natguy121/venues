import { esc } from "./dom.js";
import { galleryHTML } from "./gallery.js";
import { formatMoney, formatShortDate, formatDistance } from "../format.js";

const MAX_DATE_CHIPS = 4;

const TYPE_ICONS = {
  "Kids' play area": "🛝",
  "Trampoline park": "🤸",
  Karting: "🏎️",
  "Escape room": "🧩",
  "Amusement park": "🎠",
  "Paintball & laser tag": "🎯",
  "Party venue": "🎈",
  "Beach & pool resort": "🏖️",
  "Lebanese restaurant": "🥙",
  "Seafood restaurant": "🐟",
  Café: "☕",
  Restaurant: "🍽️",
};
export const typeIcon = (type) => TYPE_ICONS[type] ?? "🎉";

/** "Ages 1–10", or "All ages" for 0–17. */
export const agesLabel = (venue) =>
  venue.minAge == null ? "" : venue.minAge === 0 && venue.maxAge === 17 ? "All ages" : `Ages ${venue.minAge}–${venue.maxAge}`;

/** The venue's Google Maps page, which has its photos. */
export const photosLink = (venue) =>
  venue.mapsUrl ? `<a class="photos-link" href="${esc(venue.mapsUrl)}" target="_blank" rel="noopener">📷 See photos on Google Maps</a>` : "";

/** "Kaslik, Jounieh" — or just "Beirut" when the area is the town itself or already names it. */
export const placeLabel = (venue) =>
  venue.area === venue.city || venue.area.includes(venue.city) ? venue.area : `${venue.area}, ${venue.city}`;

/** Google's price level as $–$$$$, with the unused signs dimmed. */
export const priceLevelHTML = (level) =>
  `<span class="price-level" aria-label="Price level ${level} of 4">${"$".repeat(level)}<span aria-hidden="true">${"$".repeat(4 - level)}</span></span>`;

/** "★ 4.9 · 86 reviews" */
export const ratingHTML = (venue) =>
  venue.rating == null
    ? ""
    : `<span class="rating" aria-label="Rated ${venue.rating} out of 5${venue.reviews ? ` from ${venue.reviews} reviews` : ""}">★ ${venue.rating.toFixed(1)}${
        venue.reviews ? ` <span class="muted">(${venue.reviews.toLocaleString("en-US")})</span>` : ""
      }</span>`;

function priceHTML(venue) {
  if (venue.pricePerPerson == null) {
    return `<p class="card__price muted">${venue.priceLevel ? `${priceLevelHTML(venue.priceLevel)} · ` : ""}Price on request</p>`;
  }
  const guests = venue.minGuests != null ? ` <span class="muted">· ${venue.minGuests}–${venue.maxGuests} guests</span>` : "";
  return `<p class="card__price"><strong>${esc(formatMoney(venue.pricePerPerson))}</strong> per person${guests}</p>`;
}

function datesHTML(venue, criteria) {
  const { upcomingDates } = venue;
  if (upcomingDates === null) {
    return venue.saturdayHours
      ? `<p class="card__label">Saturday ${esc(venue.saturdayHours)} · call for dates</p>`
      : `<p class="card__label">Contact the venue for available dates</p>`;
  }
  const chips = criteria.date
    ? `<span class="chip chip--match">✓ ${esc(formatShortDate(criteria.date))}</span>`
    : upcomingDates
        .slice(0, MAX_DATE_CHIPS)
        .map((d) => `<span class="chip">${esc(formatShortDate(d))}</span>`)
        .join("");
  const more = criteria.date ? upcomingDates.length - 1 : upcomingDates.length - MAX_DATE_CHIPS;
  return `<div class="card__dates">
      <span class="card__label">${criteria.date ? "Available on" : "Next available"}</span>
      <div class="chips">${chips}${more > 0 ? `<span class="chip chip--more">+${more} more</span>` : ""}</div>
    </div>`;
}

export function venueCardHTML(venue, criteria, { eager = false } = {}) {
  return `<article class="card" data-id="${esc(venue.id)}">
    ${venue.images?.length ? galleryHTML(venue, { eager }) : `<div class="card__banner card__banner--${esc(venue.category?.split(" ")[0].toLowerCase() ?? "other")}" aria-hidden="true">${typeIcon(venue.type)}</div>`}
    <div class="card__body">
      <div class="card__meta">
        <span class="badge">${esc(venue.type)}</span>
        ${agesLabel(venue) ? `<span class="badge badge--age">${esc(agesLabel(venue))}</span>` : ""}
        ${ratingHTML(venue)}
      </div>
      <h3 class="card__title"><button type="button" class="card__link" data-open="${esc(venue.id)}">${esc(venue.name)}</button></h3>
      <p class="card__location">📍 ${esc(placeLabel(venue))}${
        venue.distance != null ? ` · ${esc(formatDistance(venue.distance))} away` : ""
      }</p>
      ${priceHTML(venue)}
      ${datesHTML(venue, criteria)}
      ${venue.images?.length ? "" : photosLink(venue)}
    </div>
  </article>`;
}
