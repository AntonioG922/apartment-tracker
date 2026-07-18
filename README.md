# Chelsea Tour Tracker

A mobile-first app for tracking apartment tours and block impressions in Chelsea, Manhattan. See `tracker_prompt.md` for the full spec.

## Status

Build order steps 1-3: done.
- Step 1: the Chelsea block grid (W14th-W30th, 6th-11th Ave) is pre-generated as a static GeoJSON file and rendered on a Leaflet map, calibrated against real geocoded reference points.
- Step 2: block segments are tappable on the map - a bottom sheet lets you set a star rating, tags, and notes, autosaved to IndexedDB (Dexie) and colored by rating on the map.
- Step 3: the "+ Add apartment" flow - address search (Nominatim, with a manual pin-drop fallback if geocoding fails) followed by an essentials + "more details" sheet covering every field in the spec, autosaved to IndexedDB. Apartment pins render on the map colored by verdict.

Note: Nominatim address search can't be exercised from this sandbox (its network policy blocks nominatim.openstreetmap.org) - verified the manual pin-drop fallback path instead. Live search should be checked once running locally or deployed.

Steps 4-6 (list/compare + export, Supabase sync, PWA) are not built yet.

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
