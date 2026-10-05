// Builds src/data/venues.js from the venue list in data/lebanon_venues.md:
//
//   npm run import
//
// Each venue in the list looks like
//
//   **1. GLOW KIDS**
//   - Location: 33.888314, 35.476229 ([open in Google Maps](https://...))
//   - Website: [glowkidsentertainment.com](https://...)      (or Facebook / Instagram / Online booking / "None found")
//   - Area: Ain El Tineh, Beirut
//   - Ages: 1–10                                                (or "18+")
//   - Rating: 4.9 (86 reviews) | Price: $$ | Phone: +961 ... | Saturday: 10:00 AM–7:00 PM   (each part optional)
//   - Info:
//     1. ...
//
// under a "## Birthday", "## Parties" or "## Restaurants" heading. Coordinates
// are each venue's own Google Maps pin and are used as given. The site is for
// parents of children aged 0–17, so venues marked "Ages: 18+" are left out.
//
// Photos: put image files in photos/<venue id>/ (jpg, jpeg, png or webp); they
// are shown in file-name order. The import lists each venue's id.
//
// The import fails loudly on anything it can't parse, and prints the type, town
// and ages it picked for every venue so they can be checked.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SOURCE = fileURLToPath(new URL("../data/lebanon_venues.md", import.meta.url));
const OUT = fileURLToPath(new URL("../src/data/venues.js", import.meta.url));
const PHOTOS = fileURLToPath(new URL("../photos/", import.meta.url));

// What parents are looking for, by venue type (the list's own sections are
// broader: its "Parties" section is mostly nightlife, left out as 18+).
const OCCASION_BY_TYPE = { "Beach & pool resort": "Pools & beaches" };
const OCCASION_BY_SECTION = { Birthday: "Play & parties", Parties: "Pools & beaches", Restaurants: "Family meals" };

// Town and region from the "Area" text. First match wins, so specific places
// come before the "Beirut" catch-all ("Hazmieh area, east of Beirut").
const T = (match, city, region) => ({ match, city, region });
const TOWNS = [
  T(/Hazmieh|Mar Takla/i, "Hazmieh", "Mount Lebanon"),
  T(/Aramoun/i, "Aramoun", "Mount Lebanon"),
  T(/Mkalles/i, "Mkalles", "Mount Lebanon"),
  T(/Mansourieh/i, "Mansourieh", "Mount Lebanon"),
  T(/Qortada/i, "Qortada", "Mount Lebanon"),
  T(/Jouar El Houz/i, "Jouar El Houz", "Mount Lebanon"),
  T(/Mtein/i, "Mtein", "Mount Lebanon"),
  T(/Jdeideh/i, "Jdeideh", "Mount Lebanon"),
  T(/Dora/i, "Dora", "Mount Lebanon"),
  T(/Antelias|Naccache|Mezher/i, "Antelias", "Mount Lebanon"),
  T(/Dbayeh/i, "Dbayeh", "Mount Lebanon"),
  T(/Zouk Mosbeh/i, "Zouk Mosbeh", "Mount Lebanon"),
  T(/Zouk Mikael/i, "Zouk Mikael", "Mount Lebanon"),
  T(/Kaslik|Sarba/i, "Kaslik", "Mount Lebanon"),
  T(/Jounieh/i, "Jounieh", "Mount Lebanon"),
  T(/Amchit/i, "Amchit", "Mount Lebanon"),
  T(/Byblos|Jbeil/i, "Byblos", "Mount Lebanon"),
  T(/Broum+ana/i, "Broummana", "Mount Lebanon"),
  T(/Aley/i, "Aley", "Mount Lebanon"),
  T(/Khalde/i, "Khalde", "Mount Lebanon"),
  T(/Damour/i, "Damour", "Mount Lebanon"),
  T(/Jiyeh/i, "Jiyeh", "Mount Lebanon"),
  T(/Metn/i, "Metn", "Mount Lebanon"),
  T(/Batroun/i, "Batroun", "North Lebanon"),
  T(/Tripoli/i, "Tripoli", "North Lebanon"),
  T(/Zahle/i, "Zahle", "Bekaa"),
  T(/Saida/i, "Saida", "South Lebanon"),
  T(/Tyre/i, "Tyre", "South Lebanon"),
  T(/Beirut/i, "Beirut", "Beirut"),
];

// Venue type within each section, from the name and the first info point.
// Each rule: [field to test ("name", "info" or "any"), pattern, type].
const TYPE_RULES = {
  Birthday: [
    ["any", /karting/i, "Karting"],
    ["any", /escape/i, "Escape room"],
    ["any", /paintball|laser tag/i, "Paintball & laser tag"],
    ["any", /amusement park/i, "Amusement park"],
    ["any", /trampoline|jump/i, "Trampoline park"],
    ["any", /playground|play area|play zone|soft play|activity venue/i, "Kids' play area"],
    ["any", /./, "Party venue"],
  ],
  Parties: [
    ["name", /beach|resort/i, "Beach & pool resort"],
    ["name", /\bbar\b|pub/i, "Bar & pub"],
    ["info", /rooftop/i, "Rooftop"],
    ["info", /beach|resort/i, "Beach & pool resort"],
    ["info", /live (acts|shows)|cabaret/i, "Live music & shows"],
    ["any", /club|nightclub|DJ|techno/i, "Nightclub"],
    ["any", /./, "Bar & pub"],
  ],
  Restaurants: [
    ["any", /seafood|fish/i, "Seafood restaurant"],
    ["info", /\bcafe\b/i, "Café"],
    ["info", /Lebanese (mezze|food|restaurant|cuisine|cooking)|take on Lebanese|^Lebanese/i, "Lebanese restaurant"],
    ["any", /./, "Restaurant"],
  ],
};

const LINK_LABELS = { Website: "Website", Facebook: "Facebook", Instagram: "Instagram", "Online booking": "Book online" };

const slug = (text) =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function fail(entry, message) {
  throw new Error(`#${entry?.number ?? "?"} ${entry?.name ?? ""}: ${message}`);
}

function parse(markdown) {
  const entries = [];
  let category = null;
  let entry = null;
  let inInfo = false;

  for (const raw of markdown.split("\n")) {
    const line = raw.trimEnd();
    let m;
    if ((m = line.match(/^## (.+)$/))) {
      category = m[1].trim();
      if (!TYPE_RULES[category]) throw new Error(`Unknown section "${category}"`);
      entry = null;
    } else if ((m = line.match(/^\*\*(\d+)\.\s+(.+?)\*\*$/))) {
      entry = { number: Number(m[1]), name: m[2].trim(), category, links: [], highlights: [] };
      entries.push(entry);
      inInfo = false;
    } else if (!entry) {
      continue;
    } else if ((m = line.match(/^- Location:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\s*\(\[[^\]]*\]\(([^)]+)\)\)$/))) {
      [entry.lat, entry.lng, entry.mapsUrl] = [Number(m[1]), Number(m[2]), m[3]];
    } else if ((m = line.match(/^- (Website|Facebook|Instagram|Online booking):\s*(.+)$/))) {
      if (/^None found$/i.test(m[2].trim())) continue;
      const link = m[2].match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (!link) fail(entry, `can't read link "${m[2]}"`);
      entry.links.push({ label: LINK_LABELS[m[1]], text: link[1], url: link[2] });
    } else if ((m = line.match(/^- For:\s*(.+)$/))) {
      const g = m[1].trim().toLowerCase();
      if (!["boys", "girls", "both"].includes(g)) fail(entry, `"For" must be Boys, Girls or Both, not "${m[1]}"`);
      entry.gender = g;
    } else if ((m = line.match(/^- Ages:\s*(.+)$/))) {
      const ages = m[1].trim().match(/^(\d+)\s*[–-]\s*(\d+)$/);
      if (/^18\+$/.test(m[1].trim())) entry.adultsOnly = true;
      else if (ages && Number(ages[1]) <= Number(ages[2]) && Number(ages[2]) <= 17) [entry.minAge, entry.maxAge] = [Number(ages[1]), Number(ages[2])];
      else fail(entry, `can't read ages "${m[1]}" (use e.g. "4–12" up to 17, or "18+")`);
    } else if ((m = line.match(/^- Area:\s*(.+)$/))) {
      entry.address = m[1].trim();
    } else if ((m = line.match(/^- Rating:\s*(.+)$/))) {
      for (const part of m[1].split("|").map((p) => p.trim())) {
        let p;
        if ((p = part.match(/^(\d(?:\.\d)?) \((\d+) reviews?\)$/))) [entry.rating, entry.reviews] = [Number(p[1]), Number(p[2])];
        else if ((p = part.match(/^Price:\s*(\$+)$/))) entry.priceLevel = p[1].length;
        else if ((p = part.match(/^Phone:\s*(\+[\d ]+)$/))) entry.phone = p[1];
        else if ((p = part.match(/^Saturday:\s*(.+)$/))) entry.saturdayHours = p[1];
        else fail(entry, `can't read "${part}"`);
      }
    } else if (/^- Info:\s*$/.test(line)) {
      inInfo = true;
    } else if (inInfo && (m = line.match(/^\s+\d+\.\s+(.+)$/))) {
      entry.highlights.push(m[1].trim());
    } else if (line.trim() && !line.startsWith("#")) {
      fail(entry, `unexpected line "${line}"`);
    }
  }
  return entries;
}

function typeFor(entry) {
  const fields = { name: entry.name, info: entry.highlights[0] ?? "", any: `${entry.name} ${entry.highlights[0] ?? ""}` };
  return TYPE_RULES[entry.category].find(([field, re]) => re.test(fields[field]))[2];
}

const entries = parse(readFileSync(SOURCE, "utf8"));
for (const entry of entries) if (entry.minAge == null && !entry.adultsOnly) fail(entry, "missing Ages");
const adults = entries.filter((e) => e.adultsOnly);
const ids = new Set();
const photoExt = /\.(jpe?g|png|webp)$/i;
const venues = entries.filter((e) => !e.adultsOnly).map((entry) => {
  if (entry.lat == null) fail(entry, "missing Location");
  if (!entry.address) fail(entry, "missing Area");
  if (entry.rating == null) fail(entry, "missing Rating");
  if (entry.highlights.length === 0) fail(entry, "missing Info");
  const town = TOWNS.find((t) => t.match.test(entry.address));
  if (!town) fail(entry, `no town rule matches "${entry.address}"`);

  let id = slug(entry.name);
  if (ids.has(id)) id = `${id}-${slug(town.city)}`;
  if (ids.has(id)) fail(entry, `duplicate id ${id}`);
  ids.add(id);

  const type = typeFor(entry);
  const venue = {
    id,
    source: entry.number,
    name: entry.name,
    category: OCCASION_BY_TYPE[type] ?? OCCASION_BY_SECTION[entry.category],
    type,
    minAge: entry.minAge,
    gender: entry.gender ?? "both",
    maxAge: entry.maxAge,
    city: town.city,
    region: town.region,
    area: entry.address,
    address: entry.address,
    lat: entry.lat,
    lng: entry.lng,
    mapsUrl: entry.mapsUrl,
    placeId: new URL(entry.mapsUrl).searchParams.get("query_place_id") ?? undefined,
    rating: entry.rating,
    reviews: entry.reviews,
  };
  if (entry.priceLevel) venue.priceLevel = entry.priceLevel;
  if (entry.phone) venue.phone = entry.phone;
  if (entry.saturdayHours) venue.saturdayHours = entry.saturdayHours;
  if (entry.links.length) venue.links = entry.links;
  venue.highlights = entry.highlights;
  const dir = PHOTOS + id;
  if (existsSync(dir)) {
    const files = readdirSync(dir).filter((f) => photoExt.test(f)).sort();
    if (files.length) venue.images = files.map((f) => `photos/${id}/${f}`);
  }
  return venue;
});

writeFileSync(
  OUT,
  `// GENERATED by scripts/import-venues.js from data/lebanon_venues.md.
// Edit that file (or the rules in the script) and run \`npm run import\`.
//
// Ratings, review counts, phone numbers and Saturday hours were looked up on
// Google Maps on 5 October 2026. Prices per person, capacity and available
// dates aren't known yet, so those fields are left out; the site shows them as
// "not listed" until added. Optional fields the site also supports:
// pricePerPerson, minGuests, maxGuests, availability (sorted "YYYY-MM-DD"
// dates), description, includes. Photos come from photos/<id>/.
export const venues = ${JSON.stringify(venues, null, 2)};
`,
);

console.log(`Imported ${venues.length} venues; left out ${adults.length} marked 18+.\n`);
for (const v of venues) {
  const photos = v.images ? ` (${v.images.length} photos)` : "";
  console.log(`${String(v.source).padStart(3)}  ${`${v.minAge}–${v.maxAge}`.padEnd(6)} ${v.type.padEnd(20)} ${v.city.padEnd(13)} ${v.name} [${v.id}]${photos}`);
}
console.log(`\nLeft out (18+): ${adults.map((e) => `#${e.number} ${e.name}`).join(", ")}`);
