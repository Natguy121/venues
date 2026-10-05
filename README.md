# PartySpot — kids' party and family outing finder

A website for **parents of children aged 0 to 17** in Lebanon, for finding places
for a child's birthday party or a family day out. Parents pick their child's age
group and where they are, and get a map and list of suitable places.

## Features

- **73 kid-friendly venues** from `data/lebanon_venues.md`, in three occasions:
  **Play & parties** (play areas, trampoline parks, karting, escape rooms, amusement
  parks, paintball and laser tag, party venues), **Pools & beaches** (family beach
  resorts) and **Family meals** (restaurants and cafés), from Tripoli to Tyre. The
  list's 27 nightlife venues (nightclubs, bars, adults-only beach clubs, late-night
  shows) are marked 18+ in the file and left off the site.
- **Filter by age group:** Babies & toddlers (0–3), Little kids (4–6), Kids (7–12)
  and Teens (13–17), right at the top of the page. A venue matches when its suggested
  age range overlaps the chosen groups, and every card shows its range ("Ages 7–17").
- **Filter by location:** region and town, or **📍 Near me** (browser geolocation)
  with a distance in km, also at the top of the page so they're easy to reach on
  phones.
- **Map first:** a map with a marker for every matching venue; nearby venues group
  into numbered clusters. Tap a marker for the venue's name, type, ages and rating.
- **More filters and sorting:** occasion, venue type, free-text search (names, areas,
  types and reviewer notes, so "trampoline" or "pizza" work); sort by top rated, most
  reviewed or nearest first.
- **Venue details:** suggested ages, Google rating and review count, price level,
  tap-to-call phone, Saturday hours, website or social links, four notes summarised
  from Google reviews, and a link to the venue's Google Maps page for photos and
  directions.
- **Photos:** shown as a swipeable gallery for any venue with files in
  `photos/<venue id>/` (see [photos/README.md](photos/README.md)). Venues without
  photos get a colourful icon for their type and a "See photos on Google Maps" link.
- Friendly, colourful look; responsive, light and dark themes, keyboard accessible.
  Filters are kept in the URL so parents can share a search (location never is).

### Ages

Ages come from the `- Ages:` line of each venue in `data/lebanon_venues.md`
(`4–12`, or `18+` to leave a venue off the site). They're **suggested** ranges set
from the type of venue and hints in its reviews (for example "best for toddlers",
"no kids' karts, not for under-10s", horror escape rooms for teens), and the site
says they're a guide. Ask venues for their real age rules and update the file.

### Not listed yet: prices, dates and photos

The list doesn't include prices per person, group sizes, available dates or photos,
so the site shows "Price on request" and "call for dates". The code supports all of
these per venue: filters and sorts for a detail (max price, guests, date; price and
soonest-date sorts), the availability calendar and the price estimate appear
automatically once any venue has it.

## Running locally

Requires Node.js 20+. The site itself has no dependencies; `npm install` only
fetches esbuild, used by `npm run build`.

```sh
npm start        # serves the site at http://localhost:8080
npm test         # unit tests for the filtering logic and venue data
npm run import   # rebuild src/data/venues.js from the venue list
npm run build    # rebuild dist/partyspot.html, photos included (run npm install once first)
```

### Phones and opening the file directly

Browsers won't run the site's script modules from a file opened directly
(`file://`), which is what happens on a phone or when you double-click
`index.html`: the page stays on "Loading venues…". Use
**`dist/partyspot.html`** instead: the whole site in one file, which works opened
directly, sent to a phone, or hosted anywhere. Re-run `npm run build` after
changing the code or the venue list, and commit the result.

Any static file server works too (the site is plain HTML, CSS and ES modules), so it
can be hosted on GitHub Pages, Netlify and similar hosts as-is.

## Project layout

```
index.html              page shell
styles.css              all styles
data/
  lebanon_venues.md     the venue list with suggested ages (source of truth)
photos/                 venue photos, one folder per venue id (see photos/README.md)
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
scripts/build.js        bundles everything into dist/partyspot.html
dist/partyspot.html     the single-file build (works opened directly, e.g. on phones)
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
- Ages: 1–10
- Rating: 4.9 (86 reviews) | Price: $$ | Phone: +961 3 422 423 | Saturday: 10:00 AM–7:00 PM
- Info:
  1. Indoor kids' play area that organises full birthday parties
  2. ...
```

under a `## Birthday`, `## Parties` or `## Restaurants` heading. `Ages` is required:
a range up to 17, or `18+` to leave the venue off the site. The occasion shown on
the site is Play & parties (Birthday section), Pools & beaches (beach and pool
resorts) or Family meals (Restaurants). The link line can be `Website`, `Facebook`, `Instagram` or
`Online booking`, or `None found`; `Price`, `Phone` and `Saturday` are optional.
Coordinates are used exactly as given. The import works out each venue's type from
its name and first info point, and its town and region from the area text, then
prints them all so they can be checked. It fails loudly on anything it can't parse
or an area no rule matches; add new towns to `TOWNS` in `scripts/import-venues.js`.

Each venue in `src/data/venues.js` has:

| Field | Description |
| --- | --- |
| `id`, `source`, `name`, `category`, `type` | identity; `source` is the entry's number in the list, `category` the occasion |
| `minAge`, `maxAge` | suggested ages, from the `Ages` line |
| `region`, `city`, `area`, `lat`, `lng`, `mapsUrl` | location and the venue's Google Maps pin |
| `rating`, `reviews`, `priceLevel` (1–4) | from Google Maps |
| `phone`, `saturdayHours`, `links`, `highlights` | contact details and reviewer notes, where known |

Optional fields the site already supports, for when the data exists:

| Field | Description |
| --- | --- |
| `pricePerPerson`, `minGuests`, `maxGuests` | pricing and capacity (prices in USD, see `src/config.js`) |
| `availability` | sorted `YYYY-MM-DD` dates the venue can be booked; past dates are hidden |
| `images` | photo paths, filled in from `photos/<id>/` by the import |
| `description`, `includes`, `kidFriendly` | details |

Ratings, phone numbers and hours were looked up on 5 October 2026 and will drift;
re-check and re-import them from time to time.

Map tiles come from OpenStreetMap; for heavy production traffic, switch to a tile
provider that allows it (see their tile usage policy).

## Roadmap: online booking

The app is built so booking can be added without reworking the UI:

1. **Venue partners.** Sign up venues to supply what parents need before booking:
   photos, their real age rules, party packages and prices per child, how many
   children they host, and available dates and time slots. This is also the way to
   get photos the site is allowed to use.
2. **Backend API.** Replace the bundled data in `src/api.js` with `fetch` calls
   (`GET /venues`, `GET /venues/:id`). The rest of the app already consumes it
   asynchronously.
3. **Bookings.** Implement `createBooking(...)` in `src/api.js` with what a kids'
   party booking needs: date and time slot, package, number of children and adults,
   the birthday child's name and age, allergies or special needs, and the parent's
   name, phone and email. The server must check availability atomically so two
   families can't book the same slot.
4. **Enable the UI.** Set `bookingEnabled: true` in `src/config.js`. The details
   view already shows the calendar and a price estimate for venues with prices and
   dates; add the booking form and a confirmation (SMS or WhatsApp is common in
   Lebanon).
5. **Payments and accounts:** deposits through a payment provider, parents' booking
   history, and a venue dashboard for managing dates, packages and photos.
6. **Safety and privacy:** collect only the child details a venue needs, delete them
   after the party, and show each venue's safety information (supervision, first
   aid, age rules).
