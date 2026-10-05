# PartySpot — birthday venue finder

A website for finding birthday party venues in Lebanon. It opens on a map of the
venues and lets you filter them by region, town, venue type and distance from you.

## Features

- **99 real venues** from `data/lebanon_100_venues_coordinates.md`: restaurants,
  cafés, bars, nightclubs, beach clubs and hotels in Beirut, Jounieh/Kaslik, Batroun,
  Byblos, the Metn mountains and Saida.
- **Map first:** the page opens on a map with a marker for every venue that matches
  your filters. Nearby venues group into numbered clusters; tap one to zoom in, or tap
  a marker for the venue's name, type and area and a link to its details.
- **Location filtering:** pick a region (Beirut, Mount Lebanon, North, South) and
  then a town, or use **📍 Near me** (browser geolocation) to filter by distance in km
  and sort nearest-first.
- **Venue type filter and free-text search** across names, areas and types.
- **Summary cards** (24 at a time, with "Show more") and a **details view** with the
  address and a "Find it on Google Maps" link.
- **Shareable searches:** filters and the open venue are kept in the URL (your
  location never is).
- Responsive layout, light and dark themes, keyboard accessible.

### Not listed yet: prices, dates and photos

The venue list doesn't include prices, group sizes, available dates or photos, so
the site shows "Price on request" and "Contact the venue for available dates", and
has no photos. The code still supports all of these per venue (see the optional
fields below). Filters and sorts for a detail appear automatically once any venue
has it: max price, guests, date and kid-friendly filters; price and soonest-date
sorts; the availability calendar and price estimate in the details view; and photo
galleries.

## Running locally

Requires Node.js 20+. There are no dependencies to install.

```sh
npm start        # serves the site at http://localhost:8080
npm test         # unit tests for the filtering logic and venue data
npm run import   # rebuild src/data/venues.js from the venue list
```

Any static file server works too (the site is plain HTML, CSS and ES modules), so it
can be hosted on GitHub Pages, Netlify and similar hosts as-is.

## Project layout

```
index.html              page shell
styles.css              all styles
data/
  lebanon_100_venues_coordinates.md   the venue list (source of truth)
scripts/
  import-venues.js      turns the venue list into src/data/venues.js
src/
  app.js                UI wiring: filters, URL state, results, geolocation
  api.js                data-access layer (the only thing that touches data)
  filters.js            pure search/filter/sort logic (unit tested)
  config.js             locale, currency, distance unit, booking feature flag
  data/venues.js        generated venue data (don't edit by hand)
  components/           card, gallery, calendar, map and details-dialog rendering
test/                   node:test unit tests
server.js               zero-dependency dev server
vendor/                 Leaflet 1.9.4 (BSD-2) and Leaflet.markercluster 1.5.3 (MIT)
```

## Venue data

Edit `data/lebanon_100_venues_coordinates.md`, then run `npm run import`. Each
numbered line is one venue:

```
12. **Balthus** | Downtown Beirut | 33.8712, 35.4794
```

The `##`/`###` heading above a line sets the venue type (a few names override it:
"Beach Club", "Hotel", "Resort"). The import fails loudly if a line can't be
parsed or its location isn't recognised. To support a new area, add it to `PLACES`
in `scripts/import-venues.js`.

**Coordinate checks.** For locations naming a known neighbourhood or town, the
import compares the given point with that place's centre. If it's more than 1.2 km
away, the venue is moved to the centre and the import prints the change. Locations
that only say "Beirut", and places without a known centre (Hbous, Debbas, Grand
Factory, Rue 78), keep the given coordinates. Venues listed twice are merged. Map
positions are therefore approximate (neighbourhood level), as the details view says.

Each venue in `src/data/venues.js` has:

| Field | Description |
| --- | --- |
| `id`, `source`, `name`, `type` | identity; `source` is the entry's number in the list |
| `region`, `city`, `area`, `address`, `lat`, `lng` | location; `address` is the list's location text |

Optional fields the site already supports, for when the data exists:

| Field | Description |
| --- | --- |
| `pricePerPerson`, `minGuests`, `maxGuests` | pricing and capacity (prices in USD, see `src/config.js`) |
| `availability` | sorted `YYYY-MM-DD` dates the venue can be booked; past dates are hidden |
| `images` | photo URLs for the gallery |
| `description`, `includes`, `rating`, `kidFriendly` | details |

Map tiles come from OpenStreetMap; for heavy production traffic, switch to a tile
provider that allows it (see their tile usage policy).

## Roadmap: online booking

The app is built so booking can be added without reworking the UI:

1. **Venue details.** Collect prices, group sizes, dates and photos from venues
   (for example through a venue-owner sign-up form) and add them to the data.
2. **Backend API.** Replace the bundled data in `src/api.js` with `fetch` calls
   (`GET /venues`, `GET /venues/:id`). The rest of the app already consumes it
   asynchronously.
3. **Bookings.** Implement `createBooking({ venueId, date, guests, contact })` in
   `src/api.js`. The server must check availability atomically so two people can't
   book the same date.
4. **Enable the UI.** Set `bookingEnabled: true` in `src/config.js`. The details
   view already collects the date and guest count and shows the total for venues
   with prices and dates. Add a contact form and a confirmation step behind the
   "Book this date" button.
5. **Payments and accounts** (deposits via a payment provider, booking history,
   and a venue-owner dashboard for managing dates, prices and photos).
