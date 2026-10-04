import { esc } from "./dom.js";

// Swipeable photo strip with prev/next buttons and dots. Uses CSS scroll-snap,
// so touch swiping works without any JS gesture handling.

/** Local SVG used when a remote photo fails to load. */
function placeholder(label, index) {
  const hues = [12, 330, 265, 200, 160, 40];
  const hue = hues[(label.length + index) % hues.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 70% 62%)"/><stop offset="1" stop-color="hsl(${hue + 40} 65% 45%)"/>
    </linearGradient></defs>
    <rect width="400" height="260" fill="url(#g)"/>
    <text x="200" y="125" font-size="56" text-anchor="middle">🎉</text>
    <text x="200" y="175" font-family="system-ui,sans-serif" font-size="20" fill="#fff" text-anchor="middle">${esc(label)}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function galleryHTML(venue, { size = "card", eager = size !== "card" } = {}) {
  const slides = venue.images
    .map(
      (src, i) => `<img class="gallery__img" src="${esc(src)}" alt="${esc(venue.name)} photo ${i + 1} of ${venue.images.length}"
        loading="${i === 0 && eager ? "eager" : "lazy"}" data-index="${i}" draggable="false">`,
    )
    .join("");
  const dots = venue.images.map((_, i) => `<span class="gallery__dot${i === 0 ? " is-active" : ""}"></span>`).join("");
  const controls =
    venue.images.length > 1
      ? `<button type="button" class="gallery__nav gallery__nav--prev" aria-label="Previous photo">‹</button>
         <button type="button" class="gallery__nav gallery__nav--next" aria-label="Next photo">›</button>
         <div class="gallery__dots" aria-hidden="true">${dots}</div>`
      : "";
  return `<div class="gallery gallery--${size}" data-label="${esc(venue.name)}">
    <div class="gallery__track">${slides}</div>${controls}
  </div>`;
}

/** Wire up behaviour for every gallery inside `root`. */
export function enhanceGalleries(root) {
  root.querySelectorAll(".gallery:not([data-ready])").forEach((gallery) => {
    gallery.dataset.ready = "";
    const track = gallery.querySelector(".gallery__track");
    const dots = gallery.querySelectorAll(".gallery__dot");

    gallery.querySelectorAll(".gallery__img").forEach((img) => {
      img.addEventListener("error", () => (img.src = placeholder(gallery.dataset.label, Number(img.dataset.index))), {
        once: true,
      });
    });

    const current = () => Math.round(track.scrollLeft / track.clientWidth);
    const go = (delta, event) => {
      event.stopPropagation();
      const count = dots.length;
      const next = (current() + delta + count) % count;
      track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
    };
    gallery.querySelector(".gallery__nav--prev")?.addEventListener("click", (e) => go(-1, e));
    gallery.querySelector(".gallery__nav--next")?.addEventListener("click", (e) => go(1, e));
    track.addEventListener(
      "scroll",
      () => dots.forEach((dot, i) => dot.classList.toggle("is-active", i === current())),
      { passive: true },
    );
  });
}
