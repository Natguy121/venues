// Builds dist/partyspot.html: the whole site in one self-contained file
// (styles, Leaflet, the app and the venue data inlined).
//
//   npm run build
//
// The normal site loads its scripts as ES modules, which browsers refuse to
// load from a file opened directly (file://), as phones do. The single file
// works anywhere: opened directly, sent to a phone, or hosted as-is.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(root + path, "utf8");
// Inlined code must not close its <script>/<style> element early.
const safe = (code, tag) => code.replace(new RegExp(`</${tag}`, "gi"), `<\\/${tag}`);

const { outputFiles } = await build({
  entryPoints: [root + "src/app.js"],
  bundle: true,
  format: "iife",
  target: "es2020",
  minify: true,
  write: false,
});
const app = outputFiles[0].text;

let html = read("index.html");
let replaced = 0;
const replace = (pattern, replacement) => {
  if (!pattern.test(html)) throw new Error(`index.html: no match for ${pattern}`);
  html = html.replace(pattern, () => replacement);
  replaced++;
};

// The logo links to "./", which from a standalone file would open its folder.
replace(/<a class="brand" href="\.\/">/, '<a class="brand" href="#">');

// Stylesheets, in place.
for (const href of ["vendor/leaflet/leaflet.css", "vendor/leaflet.markercluster/MarkerCluster.css", "styles.css"]) {
  replace(new RegExp(`<link rel="stylesheet" href="${href}">`), `<style>\n${safe(read(href), "style")}\n</style>`);
}
// Scripts move to the end of <body> so they run after the page is parsed,
// in the order the original deferred/module scripts ran.
const scripts = [];
for (const src of ["vendor/leaflet/leaflet.js", "vendor/leaflet.markercluster/leaflet.markercluster.js"]) {
  replace(new RegExp(`\\s*<script src="${src}" defer></script>`), "");
  scripts.push(read(src));
}
replace(/\s*<script type="module" src="src\/app.js"><\/script>/, "");
scripts.push(app);
replace(/<\/body>/, `${scripts.map((code) => `<script>\n${safe(code, "script")}\n</script>`).join("\n")}\n</body>`);

mkdirSync(root + "dist", { recursive: true });
writeFileSync(root + "dist/partyspot.html", html);
console.log(`Wrote dist/partyspot.html (${(html.length / 1024).toFixed(0)} KB, ${replaced} replacements).`);
