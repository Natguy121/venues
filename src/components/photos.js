// Swaps a venue's icon banner for its real Google photos once the banner
// scrolls into view, so photos load only for venues the parent actually sees.
import { fetchPlacePhotos, googleEnabled } from "../google.js";
import { galleryHTML, enhanceGalleries } from "./gallery.js";
import { el } from "./dom.js";

let observer = null;

async function fill(banner, venue) {
  const size = banner.dataset.photoSize;
  const photos = await fetchPlacePhotos(venue.placeId, { maxWidth: size === "large" ? 1600 : 800 });
  if (!photos.length || !banner.isConnected) return;
  const gallery = el(galleryHTML(venue, { size, eager: true, photos: photos.map((p) => ({ ...p, source: "Google Maps" })) }));
  banner.replaceWith(gallery);
  enhanceGalleries(gallery.parentElement);
  gallery.closest(".card")?.querySelector(".photos-link")?.remove();
}

/**
 * Load Google photos for every pending banner inside `root`.
 * @param root      element containing banners with data-photos="<venue id>"
 * @param venueById Map of venue id → venue
 */
export function loadVenuePhotos(root, venueById) {
  if (!googleEnabled()) return;
  const banners = root.querySelectorAll("[data-photos]:not([data-photos-pending])");
  const start = (banner) => {
    const venue = venueById.get(banner.dataset.photos);
    if (venue?.placeId) fill(banner, venue);
  };
  if (!("IntersectionObserver" in window)) return banners.forEach(start);
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        start(entry.target);
      }
    },
    { rootMargin: "300px" },
  );
  banners.forEach((banner) => {
    banner.dataset.photosPending = "";
    // Banners in the (top-layer) details dialog are visible straight away.
    if (banner.closest("dialog")) start(banner);
    else observer.observe(banner);
  });
}
