import { esc } from "./dom.js";
import { formatMoney } from "../format.js";
import { placeLabel } from "./card.js";

// Overview map of the current results, built on Leaflet (vendor/leaflet,
// loaded as a classic script that defines the global `L`). Nearby venues are
// grouped with Leaflet.markercluster when it is loaded.

const LEBANON_CENTER = [33.95, 35.75];
const LEBANON_ZOOM = 9;

/**
 * @param container element to draw the map in
 * @param options { onSelect(venueId) } called when "View details" is clicked in a popup
 * @returns { update(results, origin) } or null if Leaflet is unavailable
 */
export function createVenueMap(container, { onSelect }) {
  const L = window.L;
  if (!L) {
    container.hidden = true;
    return null;
  }

  const map = L.map(container, { scrollWheelZoom: false }).setView(LEBANON_CENTER, LEBANON_ZOOM);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  // Only zoom with the scroll wheel once the user has clicked into the map.
  map.on("focus", () => map.scrollWheelZoom.enable());
  map.on("blur", () => map.scrollWheelZoom.disable());

  const markers = (
    L.markerClusterGroup
      ? L.markerClusterGroup({
          showCoverageOnHover: false,
          maxClusterRadius: 35,
          iconCreateFunction: (cluster) => {
            const count = cluster.getChildCount();
            const prices = cluster.getAllChildMarkers().map((m) => m.options.price).filter((p) => p != null);
            const from = prices.length ? formatMoney(Math.min(...prices)) : null;
            return L.divIcon({
              className: "map-cluster",
              html: from
                ? `<span title="${count} venues from ${esc(from)} per person"><b>${count}</b> · ${esc(from)}+</span>`
                : `<span title="${count} venues"><b>${count}</b></span>`,
              iconSize: null,
            });
          },
        })
      : L.layerGroup()
  ).addTo(map);
  let originMarker = null;

  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-map-open]");
    if (button) onSelect(button.dataset.mapOpen);
  });

  function popupHTML(venue) {
    return `<div class="map-popup">
      ${venue.images?.length ? `<img src="${esc(venue.images[0])}" alt="" onerror="this.remove()">` : ""}
      <strong>${esc(venue.name)}</strong>
      <span>${esc(venue.type)} · ${esc(placeLabel(venue))}</span>
      ${venue.pricePerPerson != null ? `<span><b>${esc(formatMoney(venue.pricePerPerson))}</b> per person</span>` : ""}
      <button type="button" class="btn btn--primary btn--small" data-map-open="${esc(venue.id)}">View details</button>
    </div>`;
  }

  function update(results, origin) {
    markers.clearLayers();
    for (const venue of results) {
      // A price tag when the price is known, otherwise a plain dot.
      const priced = venue.pricePerPerson != null;
      const icon = L.divIcon({
        className: priced ? "map-pin" : "map-pin map-pin--dot",
        html: priced ? `<span>${esc(formatMoney(venue.pricePerPerson))}</span>` : "<span></span>",
        iconSize: null,
        iconAnchor: [0, 0],
        popupAnchor: [0, priced ? -28 : -12],
      });
      L.marker([venue.lat, venue.lng], { icon, title: venue.name, alt: venue.name, price: venue.pricePerPerson })
        .bindPopup(popupHTML(venue), { minWidth: 200 })
        .addTo(markers);
    }

    originMarker?.remove();
    originMarker = origin
      ? L.circleMarker([origin.lat, origin.lng], { radius: 8, color: "#fff", weight: 3, fillColor: "#2f6fec", fillOpacity: 1 })
          .bindTooltip("You are here")
          .addTo(map)
      : null;

    const points = results.map((v) => [v.lat, v.lng]);
    if (origin) points.push([origin.lat, origin.lng]);
    if (points.length) map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
    else map.setView(LEBANON_CENTER, LEBANON_ZOOM);
  }

  return { update, invalidate: () => map.invalidateSize() };
}
