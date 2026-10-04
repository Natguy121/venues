# PartySpot — birthday venue finder

A website for finding birthday party venues. Filter by location, see each venue's
available dates and price per person, and browse photos right in the results.

## Features

- **Location filtering:** pick a city, or use **📍 Near me** (browser geolocation) to
  filter by distance and sort nearest-first.
- **More filters:** date, number of guests (checked against venue capacity), max
  price per person, venue type, kid-friendly only, and free-text search.
- **Summary cards:** a swipeable photo gallery, price per person, guest range,
  rating and the next available dates.
- **Venue details:** a large gallery, what's included, a month calendar of available
  dates, and a price estimate for your date and guest count.
- **Shareable searches:** filters and the open venue are kept in the URL (your
  location never is).
- Responsive layout, light and dark themes, keyboard accessible.

## Running locally

Requires Node.js 20+. There are no dependencies to install.

```sh
npm start      # serves the site at http://localhost:8080
npm test       # unit tests for the filtering logic
```

Any static file server works too (the site is plain HTML, CSS and ES modules), so it
can be hosted on GitHub Pages, Netlify and similar hosts as-is.

## Project layout

```
index.html              page shell
styles.css              all styles
src/
  app.js                UI wiring: filters, URL state, results, geolocation
  api.js                data-access layer (the only thing that touches data)
  filters.js            pure search/filter/sort logic (unit tested)
  config.js             locale, currency, distance unit, booking feature flag
  data/venues.js        sample venue catalogue
  components/           card, gallery, calendar and details-dialog rendering
test/                   node:test unit tests
server.js               zero-dependency dev server
```

## Venue data

Each venue in `src/data/venues.js` looks like this:

| Field | Description |
| --- | --- |
| `id`, `name`, `type` | identity and category (e.g. "Rooftop", "Bowling") |
| `city`, `area`, `address`, `lat`, `lng` | location; coordinates drive the distance filter |
| `pricePerPerson`, `minGuests`, `maxGuests` | pricing and capacity |
| `availability` | sorted `YYYY-MM-DD` dates the venue can be booked; past dates are hidden automatically |
| `images` | photo URLs shown in the gallery (a generated placeholder appears if one fails to load) |
| `description`, `includes`, `rating`, `kidFriendly` | details |

The sample venues are fictional and use Unsplash stock photos. Their availability
runs from October 2026 to early March 2027.

## Roadmap: online booking

The app is built so booking can be added without reworking the UI:

1. **Backend API.** Replace the bundled data in `src/api.js` with `fetch` calls
   (`GET /venues`, `GET /venues/:id`). The rest of the app already consumes it
   asynchronously.
2. **Bookings.** Implement `createBooking({ venueId, date, guests, contact })` in
   `src/api.js`. The server must check availability atomically so two people can't
   book the same date.
3. **Enable the UI.** Set `bookingEnabled: true` in `src/config.js`. The details
   dialog already collects the date and guest count and shows the total. Add a
   contact form and a confirmation step behind the "Book this date" button.
4. **Payments and accounts** (deposits via a payment provider, booking history,
   and a venue-owner dashboard for managing dates, prices and photos).
5. **Time slots.** Extend `availability` from dates to per-date slots if venues
   host several parties a day.
