# Chelsea Tour Tracker

A mobile-first app for tracking apartment tours and block impressions in Chelsea, Manhattan. See `tracker_prompt.md` for the full spec.

## Status

Build order steps 1-2: done.
- Step 1: the Chelsea block grid (W14th-W30th, 6th-11th Ave) is pre-generated as a static GeoJSON file and rendered on a Leaflet map, calibrated against real geocoded reference points.
- Step 2: block segments are tappable on the map - a bottom sheet lets you set a star rating, tags, and notes, autosaved to IndexedDB (Dexie) and colored by rating on the map.

Steps 3-6 (add-apartment flow + pins, list/compare, Supabase sync, PWA) are not built yet.

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
