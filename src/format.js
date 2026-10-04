import { config } from "./config.js";
import { parseISODate } from "./dates.js";

const money = new Intl.NumberFormat(config.locale, {
  style: "currency",
  currency: config.currency,
  maximumFractionDigits: 0,
});
const shortDate = new Intl.DateTimeFormat(config.locale, {
  weekday: "short",
  month: "short",
  day: "numeric",
});
const longDate = new Intl.DateTimeFormat(config.locale, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});
const monthTitle = new Intl.DateTimeFormat(config.locale, { month: "long", year: "numeric" });

export const formatMoney = (amount) => money.format(amount);
export const formatShortDate = (iso) => shortDate.format(parseISODate(iso));
export const formatLongDate = (iso) => longDate.format(parseISODate(iso));
export const formatMonth = (date) => monthTitle.format(date);

export function formatDistance(value) {
  const rounded = value < 10 ? value.toFixed(1) : Math.round(value);
  return `${rounded} ${config.distanceUnit}`;
}
