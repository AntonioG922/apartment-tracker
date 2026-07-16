# Chelsea Tour Tracker

A mobile-first app for tracking apartment tours and block impressions in Chelsea, Manhattan. See `tracker_prompt.md` for the full spec.

## Status

Build order step 1 (grid generation): done. The Chelsea block grid (W14th-W30th, 6th-11th Ave) is pre-generated as a static GeoJSON file and rendered on a Leaflet map for visual verification. Steps 2-6 (interactive block/apartment editing, add-apartment flow, list/compare, Supabase sync, PWA) are not built yet.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Regenerating the grid

```bash
npm run generate:grid
```

Writes `public/data/chelsea-grid.geojson`. Edit `lib/grid-geo.ts` to change bounds, spacing, or rotation.
