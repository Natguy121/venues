// Google Maps version of the venue map, used when a Google Maps API key is set
// (Google's terms require its place photos to be shown with a Google map, not
// another provider's). Same interface as createVenueMap in map.js.
import { esc } from "./dom.js";
import { popupHTML } from "./map.js";
import { loadGoogleMaps } from "../google.js";
import { config } from "../config.js";

const LEBANON_CENTER = { lat: 33.95, lng: 35.75 };
const LEBANON_ZOOM = 9;
const MAX_FIT_ZOOM = 14;

const div = (className, html) => {
  const node = document.createElement("div");
  node.className = className;
  node.innerHTML = html;
  return node;
};

/**
 * @param container element to draw the map in
 * @param options { onSelect(venueId) } called when "View details" is clicked in a popup
 * @returns { update(results, origin) }, or null when Google Maps can't be used
 */
export async function createGoogleVenueMap(container, { onSelect }) {
  const maps = await loadGoogleMaps();
  if (!maps) return null;
  const [{ Map, InfoWindow }, { AdvancedMarkerElement }] = await Promise.all([
    maps.importLibrary("maps"),
    maps.importLibrary("marker"),
  ]);

  const map = new Map(container, {
    center: LEBANON_CENTER,
    zoom: LEBANON_ZOOM,
    mapId: config.googleMapId,
    // One finger scrolls the page on phones; two fingers move the map.
    gestureHandling: "cooperative",
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
  });
  const info = new InfoWindow();
  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-map-open]");
    if (button) onSelect(button.dataset.mapOpen);
  });

  const Clusterer = window.markerClusterer?.MarkerClusterer;
  const clusterer = Clusterer
    ? new Clusterer({
        map,
        markers: [],
        renderer: {
          render: ({ count, position }) =>
            new AdvancedMarkerElement({
              position,
              content: div("gmap-cluster", `<b>${count}</b>`),
              title: `${count} places`,
              zIndex: 1000 + count,
            }),
        },
      })
    : null;

  let markers = [];
  let originMarker = null;

  function update(results, origin) {
    clusterer?.clearMarkers();
    markers.forEach((marker) => (marker.map = null));
    markers = results.map((venue) => {
      const marker = new AdvancedMarkerElement({
        position: { lat: venue.lat, lng: venue.lng },
        content: div("gmap-pin", `<span aria-hidden="true"></span>`),
        title: venue.name,
      });
      marker.addListener("click", () => {
        info.setContent(popupHTML(venue));
        info.open({ map, anchor: marker });
      });
      return marker;
    });
    if (clusterer) clusterer.addMarkers(markers);
    else markers.forEach((marker) => (marker.map = map));

    if (originMarker) originMarker.map = null;
    originMarker = origin
      ? new AdvancedMarkerElement({
          map,
          position: origin,
          content: div("gmap-you", `<span class="visually-hidden">${esc("You are here")}</span>`),
          title: "You are here",
        })
      : null;

    const points = results.map((v) => ({ lat: v.lat, lng: v.lng }));
    if (origin) points.push(origin);
    if (!points.length) {
      map.setCenter(LEBANON_CENTER);
      map.setZoom(LEBANON_ZOOM);
      return;
    }
    const bounds = new maps.LatLngBounds();
    points.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, 40);
    maps.event.addListenerOnce(map, "idle", () => {
      if (map.getZoom() > MAX_FIT_ZOOM) map.setZoom(MAX_FIT_ZOOM);
    });
  }

  return { update };
}
