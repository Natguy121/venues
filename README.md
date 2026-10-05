# PartySpot — birthday venue finder

A website for finding places in Lebanon for birthdays, parties and restaurants. It
opens on a map of the venues and lets you filter them by occasion, region, town,
venue type and distance from you.

## Features

- **100 real venues** from `data/lebanon_venues.md`, in three occasions: Birthday
  (play areas, trampoline parks, karting, escape rooms, amusement parks, party
  venues), Parties (nightclubs, rooftops, bars, beach clubs, live shows) and
  Restaurants, from Tripoli to Tyre. Each has its own Google Maps pin, Google rating
  and review count, and where known the price level, phone, Saturday hours, website
  or social page, and four notes summarised from its reviews.
- **Map first:** the page opens on a map with a marker for every venue that matches
  your filters. Nearby venues group into numbered clusters; tap one to zoom in, or tap
  a marker for the venue's name, type, area and rating and a link to its details.
- **Filters:** occasion, venue type (limited to the chosen occasion), region and town,
  or **📍 Near me** (browser geolocation) to filter by distance in km. Free-text search
  covers names, areas, types and reviewer notes, so "trampoline" or "octopus" work.
- **Sorting:** top rated (ties broken by review count), most reviewed, nearest first.
- **Summary cards** (24 at a time, with "Show more") and a **details view** with the
  rating, price level, tap-to-call phone, Saturday hours, links, reviewer notes and
  an "Open in Google Maps" button for the venue's pin.
- **Shareable searches:** filters and the open venue are kept in the URL (your
  location never is).
- Responsive layout, light and dark themes, keyboard accessible.

### Not listed yet: prices, dates and photos

The venue list doesn't include prices per person, group sizes, available dates or
photos, so the site shows "Price on request" and "call for dates", and has no photos. The code still supports all of these per venue (see the optional
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
  lebanon_venues.md     the venue list (source of truth)
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

Edit `data/lebanon_venues.md`, then run `npm run import`. Each venue is a block like:

```
**1. GLOW KIDS**
- Location: 33.888314, 35.476229 ([open in Google Maps](https://www.google.com/maps/search/?api=1&query=...&query_place_id=...))
- Website: [glowkidsentertainment.com](https://www.glowkidsentertainment.com/)
- Area: Ain El Tineh, Beirut
- Rating: 4.9 (86 reviews) | Price: $$ | Phone: +961 3 422 423 | Saturday: 10:00 AM–7:00 PM
- Info:
  1. Indoor kids' play area that organises full birthday parties
  2. ...
```

under a `## Birthday`, `## Parties` or `## Restaurants` heading, which becomes the
venue's occasion. The link line can be `Website`, `Facebook`, `Instagram` or
`Online booking`, or `None found`; `Price`, `Phone` and `Saturday` are optional.
Coordinates are used exactly as given. The import works out each venue's type from
its name and first info point, and its town and region from the area text, then
prints them all so they can be checked. It fails loudly on anything it can't parse
or an area no rule matches; add new towns to `TOWNS` in `scripts/import-venues.js`.

Each venue in `src/data/venues.js` has:

| Field | Description |
| --- | --- |
| `id`, `source`, `name`, `category`, `type` | identity; `source` is the entry's number in the list |
| `region`, `city`, `area`, `lat`, `lng`, `mapsUrl` | location and the venue's Google Maps pin |
| `rating`, `reviews`, `priceLevel` (1–4) | from Google Maps |
| `phone`, `saturdayHours`, `links`, `highlights` | contact details and reviewer notes, where known |

Optional fields the site already supports, for when the data exists:

| Field | Description |
| --- | --- |
| `pricePerPerson`, `minGuests`, `maxGuests` | pricing and capacity (prices in USD, see `src/config.js`) |
| `availability` | sorted `YYYY-MM-DD` dates the venue can be booked; past dates are hidden |
| `images` | photo URLs for the gallery |
| `description`, `includes`, `kidFriendly` | details |

Ratings, phone numbers and hours were looked up on 5 October 2026 and will drift;
re-check and re-import them from time to time.

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
