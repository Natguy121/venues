const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escape text for safe interpolation into HTML strings. */
export const esc = (value) => String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);

export function el(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}
