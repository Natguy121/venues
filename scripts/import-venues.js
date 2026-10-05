// Builds src/data/venues.js from the venue list in
// data/lebanon_100_venues_coordinates.md:
//
//   npm run import
//
// Each numbered line in the list looks like
//   12. **Balthus** | Downtown Beirut | 33.8712, 35.4794
// and the "##"/"###" heading above it becomes the venue type.
//
// Coordinates in the list are approximate and some don't match the stated
// neighbourhood (a few are in the sea). When a venue's location names a
// neighbourhood listed in PLACES below and the given point is more than
// MAX_OFFSET_KM from that neighbourhood's centre, the centre is used instead and
// the change is reported. Places without a centre keep the given coordinates.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { distanceKm } from "../src/geo.js";

const SOURCE = fileURLToPath(new URL("../data/lebanon_100_venues_coordinates.md", import.meta.url));
const OUT = fileURLToPath(new URL("../src/data/venues.js", import.meta.url));
const MAX_OFFSET_KM = 1.2;

// First match wins, so more specific patterns come first.
// center: approximate neighbourhood centre [lat, lng], or null to keep the given point.
const P = (match, area, city, region, center = null) => ({ match, area, city, region, center });
const PLACES = [
  // Beirut
  P(/Pharoun|Mar Mikhael/i, "Mar Mikhael", "Beirut", "Beirut", [33.8975, 35.524]),
  P(/Gemmayze/i, "Gemmayzeh", "Beirut", "Beirut", [33.8955, 35.514]),
  P(/Hamra/i, "Hamra", "Beirut", "Beirut", [33.8963, 35.4826]),
  P(/Ras Beirut/i, "Ras Beirut", "Beirut", "Beirut", [33.899, 35.479]),
  P(/Phoenicia/i, "Downtown", "Beirut", "Beirut", [33.9007, 35.4968]),
  P(/Zaitouna/i, "Zaitunay Bay", "Beirut", "Beirut", [33.9013, 35.4963]),
  P(/Bloc Market|Beirut Waterfront/i, "Beirut Waterfront", "Beirut", "Beirut", [33.904, 35.5085]),
  P(/BIEL/i, "BIEL", "Beirut", "Beirut", [33.903, 35.5065]),
  P(/Beirut Souks/i, "Beirut Souks", "Beirut", "Beirut", [33.8995, 35.503]),
  P(/Downtown/i, "Downtown", "Beirut", "Beirut", [33.8955, 35.5055]),
  P(/Starco|Omar Daouk/i, "Minet El Hosn", "Beirut", "Beirut", [33.899, 35.4985]),
  P(/Kantary/i, "Kantari", "Beirut", "Beirut", [33.8945, 35.496]),
  P(/Damascus Rd/i, "Damascus Road", "Beirut", "Beirut", [33.885, 35.509]),
  P(/Achrafieh/i, "Achrafieh", "Beirut", "Beirut", [33.887, 35.521]),
  P(/Monot/i, "Monot", "Beirut", "Beirut", [33.8925, 35.512]),
  P(/Badaro/i, "Badaro", "Beirut", "Beirut", [33.8745, 35.5135]),
  P(/Karantina/i, "Karantina", "Beirut", "Beirut", [33.9025, 35.532]),
  P(/Raouche/i, "Raouche", "Beirut", "Beirut", [33.889, 35.472]),
  P(/Grand Factory/i, "Grand Factory", "Beirut", "Beirut"),
  P(/Debbas/i, "Debbas", "Beirut", "Beirut"),
  // Keserwan, Jbeil and Metn (Mount Lebanon)
  P(/Kaslik/i, "Kaslik", "Jounieh", "Mount Lebanon", [33.979, 35.6195]),
  P(/ATCL/i, "ATCL", "Jounieh", "Mount Lebanon", [33.9765, 35.6205]),
  P(/Sahel Alma/i, "Sahel Alma", "Jounieh", "Mount Lebanon", [33.969, 35.63]),
  P(/Sarba/i, "Sarba", "Jounieh", "Mount Lebanon", [33.972, 35.625]),
  P(/Old Souk Street, Jounieh/i, "Old Souk", "Jounieh", "Mount Lebanon", [33.983, 35.6165]),
  P(/Maamelteine|Casino Du Liban/i, "Maameltein", "Jounieh", "Mount Lebanon", [33.9995, 35.625]),
  P(/Ghosta/i, "Ghosta", "Ghosta", "Mount Lebanon", [34.007, 35.662]),
  P(/Ghazir/i, "Ghazir", "Ghazir", "Mount Lebanon", [34.014, 35.638]),
  P(/Aamchit/i, "Amchit", "Amchit", "Mount Lebanon", [34.149, 35.646]),
  P(/Jounieh Seaside/i, "Seaside", "Jounieh", "Mount Lebanon", [33.98, 35.616]),
  P(/Amwaj/i, "Amwaj", "Jounieh", "Mount Lebanon", [33.981, 35.618]),
  P(/Jounieh/i, "Jounieh", "Jounieh", "Mount Lebanon", [33.981, 35.618]),
  P(/Dbayeh/i, "Dbayeh", "Dbayeh", "Mount Lebanon", [33.937, 35.59]),
  P(/Byblos/i, "Byblos", "Byblos", "Mount Lebanon", [34.1219, 35.6491]),
  P(/Broumana/i, "Broummana", "Broummana", "Mount Lebanon", [33.883, 35.621]),
  P(/Beit Meri/i, "Beit Mery", "Beit Mery", "Mount Lebanon", [33.857, 35.597]),
  P(/Bikfaya/i, "Bikfaya", "Bikfaya", "Mount Lebanon", [33.925, 35.678]),
  P(/Bharsaf/i, "Bharsaf", "Bharsaf", "Mount Lebanon", [33.909, 35.664]),
  P(/Faytroun/i, "Faytroun", "Faytroun", "Mount Lebanon", [33.99, 35.713]),
  P(/Hbous/i, "Hbous", "Hbous", "Mount Lebanon"),
  // North and South
  P(/Kfarabida/i, "Kfarabida", "Kfarabida", "North Lebanon", [34.238, 35.656]),
  P(/Smarjbeil/i, "Smar Jbeil", "Smar Jbeil", "North Lebanon", [34.27, 35.674]),
  P(/Batroun/i, "Batroun", "Batroun", "North Lebanon", [34.256, 35.66]),
  P(/Anfeh/i, "Anfeh", "Anfeh", "North Lebanon", [34.353, 35.73]),
  P(/Koura|Dahr El Ain/i, "Dahr El Ain, Koura", "Dahr El Ain", "North Lebanon", [34.372, 35.853]),
  P(/Saida/i, "Saida", "Saida", "South Lebanon", [33.5633, 35.375]),
  // Only "Beirut": no neighbourhood to check against.
  P(/Beirut/i, "Beirut", "Beirut", "Beirut"),
];

// Entries whose given point can't be right and whose location names no
// neighbourhood: placed at central Beirut.
const OVERRIDES = {
  26: { lat: 33.8938, lng: 35.5018, reason: "given coordinates are in the sea; placed in central Beirut" },
};

// Type comes from the nearest heading; a few names say more than their heading.
const TYPE_BY_HEADING = [
  [/Lebanese Cuisine/i, "Lebanese restaurant"],
  [/International & Fine Dining/i, "International & fine dining"],
  [/Seafood & Casual/i, "Seafood & casual"],
  [/Caf(é|e)s & Bakeries/i, "Café & bakery"],
  [/Nightlife & Party/i, "Nightlife & party"],
  [/Armenian & Specialty/i, "Armenian & specialty"],
  [/Nightclubs/i, "Nightclub"],
  [/Bars, Lounges/i, "Bar & lounge"],
  [/.*/, "Restaurant"],
];
const TYPE_BY_NAME = [
  [/Beach Club/i, "Beach club"],
  [/Hotel/i, "Hotel"],
  [/Resort/i, "Resort"],
];

const slug = (text) =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function parse(markdown) {
  const entries = [];
  let section = "";
  let subsection = "";
  for (const line of markdown.split("\n")) {
    if (/^## COORDINATES BY AREA/i.test(line)) break;
    if (line.startsWith("### ")) subsection = line.slice(4).trim();
    else if (line.startsWith("## ")) [section, subsection] = [line.slice(3).trim(), ""];
    const m = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (m) {
      const [, number, name, location, lat, lng] = m;
      entries.push({ number: Number(number), name: name.trim(), location, lat: Number(lat), lng: Number(lng), heading: subsection || section });
    } else if (/^\d+\.\s/.test(line)) {
      throw new Error(`Couldn't parse line: ${line}`);
    }
  }
  return entries;
}

const entries = parse(readFileSync(SOURCE, "utf8"));
const report = { moved: [], merged: [] };
const venues = [];
const byName = new Map();

for (const entry of entries) {
  const place = PLACES.find((p) => p.match.test(entry.location));
  if (!place) throw new Error(`No place rule matches #${entry.number} "${entry.location}"`);

  // The same venue listed twice: the later entry replaces the earlier one.
  const key = entry.name.toLowerCase();
  if (byName.has(key)) {
    const existing = byName.get(key);
    report.merged.push(`#${entry.number} ${entry.name} duplicates #${existing.source}; kept #${entry.number} ("${entry.location}")`);
    venues.splice(venues.indexOf(existing), 1);
  }

  let { lat, lng } = entry;
  const override = OVERRIDES[entry.number];
  if (override) {
    ({ lat, lng } = override);
    report.moved.push(`#${entry.number} ${entry.name}: ${override.reason}`);
  } else if (place.center) {
    const center = { lat: place.center[0], lng: place.center[1] };
    const offset = distanceKm(entry, center);
    if (offset > MAX_OFFSET_KM) {
      ({ lat, lng } = center);
      report.moved.push(`#${entry.number} ${entry.name} (${entry.location}): ${offset.toFixed(1)} km from ${place.area}, moved to its centre`);
    }
  }

  const venue = {
    id: slug(entry.name),
    source: entry.number,
    name: entry.name,
    type: TYPE_BY_NAME.find(([re]) => re.test(entry.name))?.[1] ?? TYPE_BY_HEADING.find(([re]) => re.test(entry.heading))[1],
    city: place.city,
    region: place.region,
    area: place.area,
    address: entry.location,
    lat,
    lng,
  };
  byName.set(key, venue);
  venues.push(venue);
}

const ids = new Set();
for (const v of venues) {
  if (ids.has(v.id)) v.id = `${v.id}-${slug(v.city)}`;
  if (ids.has(v.id)) throw new Error(`Duplicate id ${v.id}`);
  ids.add(v.id);
}

writeFileSync(
  OUT,
  `// GENERATED by scripts/import-venues.js from data/lebanon_100_venues_coordinates.md.
// Edit that file (or the rules in the script) and run \`npm run import\`.
//
// Prices, capacity and available dates aren't known for these venues yet, so
// those fields are left out; the site shows them as "not listed" until added.
// Optional fields per venue: pricePerPerson, minGuests, maxGuests, availability
// (sorted "YYYY-MM-DD" dates), kidFriendly, rating, description, includes, images.
export const venues = ${JSON.stringify(venues, null, 2)};
`,
);

console.log(`Imported ${venues.length} venues from ${entries.length} entries.`);
console.log(`\nCoordinates changed (${report.moved.length}):\n  ${report.moved.join("\n  ")}`);
console.log(`\nDuplicates merged (${report.merged.length}):\n  ${report.merged.join("\n  ")}`);
