import { esc } from "./dom.js";
import { toISODate, parseISODate } from "../dates.js";
import { formatMonth, formatLongDate } from "../format.js";
import { config } from "../config.js";

const weekdayNames = (() => {
  const fmt = new Intl.DateTimeFormat(config.locale, { weekday: "narrow" });
  // 2026-10-04 is a Sunday.
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2026, 9, 4 + i)));
})();

/**
 * Month-view availability calendar.
 * @param container element to render into
 * @param options { available: string[], today, selected, onSelect(iso) }
 */
export function renderCalendar(container, { available, today, selected = "", onSelect }) {
  const availableSet = new Set(available);
  const first = parseISODate(selected || available[0] || today);
  let month = new Date(first.getFullYear(), first.getMonth(), 1);
  const minMonth = new Date(parseISODate(today).getFullYear(), parseISODate(today).getMonth(), 1);
  const last = available.length ? parseISODate(available[available.length - 1]) : minMonth;
  const maxMonth = new Date(last.getFullYear(), last.getMonth(), 1);

  function draw() {
    const year = month.getFullYear();
    const m = month.getMonth();
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < month.getDay(); i++) cells.push(`<span class="cal__cell"></span>`);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = toISODate(new Date(year, m, d));
      const open = availableSet.has(iso) && iso >= today;
      const isSelected = iso === selected;
      cells.push(
        open
          ? `<button type="button" class="cal__cell cal__day is-open${isSelected ? " is-selected" : ""}"
               data-date="${iso}" aria-pressed="${isSelected}" aria-label="${esc(formatLongDate(iso))}, available">${d}</button>`
          : `<span class="cal__cell cal__day" aria-label="${esc(formatLongDate(iso))}, unavailable">${d}</span>`,
      );
    }
    container.innerHTML = `
      <div class="cal">
        <div class="cal__head">
          <button type="button" class="cal__nav" data-step="-1" aria-label="Previous month" ${month <= minMonth ? "disabled" : ""}>‹</button>
          <strong class="cal__title" aria-live="polite">${esc(formatMonth(month))}</strong>
          <button type="button" class="cal__nav" data-step="1" aria-label="Next month" ${month >= maxMonth ? "disabled" : ""}>›</button>
        </div>
        <div class="cal__grid cal__weekdays" aria-hidden="true">${weekdayNames.map((w) => `<span>${w}</span>`).join("")}</div>
        <div class="cal__grid">${cells.join("")}</div>
        <div class="cal__legend"><span class="cal__swatch is-open"></span> Available <span class="cal__swatch"></span> Booked / closed</div>
      </div>`;
  }

  container.onclick = (event) => {
    const nav = event.target.closest(".cal__nav");
    if (nav) {
      month = new Date(month.getFullYear(), month.getMonth() + Number(nav.dataset.step), 1);
      draw();
      return;
    }
    const day = event.target.closest(".cal__day.is-open");
    if (day) {
      selected = day.dataset.date;
      draw();
      onSelect?.(selected);
    }
  };
  draw();
}
