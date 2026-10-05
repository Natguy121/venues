// Google Maps Platform: loading the Maps JavaScript API and fetching each
// venue's photos through the Places API (by the place ID in the venue list).
// Everything here is optional: callers fall back to OpenStreetMap and no
// Google photos when there's no key or Google can't be reached.
import { config } from "./config.js";

let loading = null;
let failed = false;
const failureListeners = new Set();

/** Called when Google rejects the key (wrong key, not allowed for this site, billing off). */
export const onGoogleFailure = (listener) => failureListeners.add(listener);

function fail(reason) {
  if (failed) return;
  failed = true;
  console.warn(`Google Maps unavailable: ${reason}. Using OpenStreetMap and no Google photos.`);
  failureListeners.forEach((listener) => listener(reason));
}

export const googleEnabled = () => Boolean(config.googleMapsApiKey) && !failed;

/** Loads the Maps JavaScript API once. Resolves to google.maps, or null if unavailable. */
export function loadGoogleMaps({ timeoutMs = 10000 } = {}) {
  if (!config.googleMapsApiKey) return Promise.resolve(null);
  if (loading) return loading;
  loading = new Promise((resolve) => {
    if (window.google?.maps?.importLibrary) return resolve(window.google.maps);
    const callback = "__partySpotGoogleReady";
    const timer = setTimeout(() => {
      fail("timed out loading");
      resolve(null);
    }, timeoutMs);
    window[callback] = () => {
      clearTimeout(timer);
      resolve(window.google.maps);
    };
    // Google calls this global when the key is rejected.
    window.gm_authFailure = () => fail("the API key was rejected");
    const script = document.createElement("script");
    const params = new URLSearchParams({ key: config.googleMapsApiKey, v: "weekly", loading: "async", callback });
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    script.onerror = () => {
      clearTimeout(timer);
      fail("couldn't load the script (offline?)");
      resolve(null);
    };
    document.head.append(script);
  }).then((maps) => (failed ? null : maps));
  return loading;
}

// Photos are kept in memory for this visit only; Google's terms don't allow
// storing them, so nothing is written to disk or browser storage.
const photoCache = new Map();

/**
 * The venue's Google photos: [{ src, width, height, credits: [{ name, url }] }],
 * or [] when there are none or Google is unavailable.
 */
export function fetchPlacePhotos(placeId, { maxWidth = 1200 } = {}) {
  if (!placeId || !googleEnabled()) return Promise.resolve([]);
  const key = `${placeId}:${maxWidth}`;
  if (!photoCache.has(key)) {
    photoCache.set(
      key,
      (async () => {
        const maps = await loadGoogleMaps();
        if (!maps) return [];
        const { Place } = await maps.importLibrary("places");
        const place = new Place({ id: placeId });
        await place.fetchFields({ fields: ["photos"] });
        return (place.photos ?? []).slice(0, config.googlePhotosPerVenue).map((photo) => ({
          src: photo.getURI({ maxWidth }),
          width: photo.widthPx,
          height: photo.heightPx,
          credits: (photo.authorAttributions ?? []).map((a) => ({ name: a.displayName, url: a.uri })),
        }));
      })().catch((error) => {
        console.warn(`No Google photos for ${placeId}:`, error);
        photoCache.delete(key); // allow a retry later
        return [];
      }),
    );
  }
  return photoCache.get(key);
}
