// Checks that every venue photo URL still loads: `npm run check:images`.
// Needs normal internet access. Exits non-zero if any photo is broken.
import { venues } from "../src/data/venues.js";

const CONCURRENCY = 8;
const urls = [...new Set(venues.flatMap((v) => v.images))];
const usedBy = (url) => venues.filter((v) => v.images.includes(url)).map((v) => v.id);

async function check(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    const type = res.headers.get("content-type") ?? "";
    return res.ok && type.startsWith("image/") ? null : `HTTP ${res.status} ${type}`.trim();
  } catch (error) {
    return error.cause?.code ?? error.message;
  }
}

const broken = [];
for (let i = 0; i < urls.length; i += CONCURRENCY) {
  const batch = urls.slice(i, i + CONCURRENCY);
  const results = await Promise.all(batch.map(check));
  results.forEach((problem, j) => problem && broken.push({ url: batch[j], problem }));
}

console.log(`Checked ${urls.length} photos used by ${venues.length} venues.`);
for (const { url, problem } of broken) {
  console.log(`✗ ${problem}  ${url}\n    used by: ${usedBy(url).join(", ")}`);
}
if (broken.length) {
  console.log(`\n${broken.length} broken. Replace the IDs in scripts/generate-venues.js and re-run \`npm run generate\`.`);
  process.exit(1);
}
console.log("All photos OK.");
