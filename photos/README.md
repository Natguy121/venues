# Venue photos

Put each venue's photos in a folder named after its id, for example:

```
photos/glow-kids/1.jpg
photos/glow-kids/2.jpg
photos/dream-park-lebanon/1.webp
```

`npm run import` lists every venue with its id in square brackets. Photos show in
file-name order (the first one is the card's cover). Then run `npm run import` and
`npm run build`.

- **Use only photos you have permission to use:** ones the venue sends you, or
  your own. Photos on Google Maps, Instagram and venue websites belong to the
  venue or the photographer.
- **Resize before adding:** about 1200 px wide and under 300 KB each (JPG or
  WebP), so the site stays fast on phones. Every photo is also embedded in
  `dist/partyspot.html`.
- **Avoid photos where children's faces are recognisable** unless the venue
  confirms it has the parents' consent.
