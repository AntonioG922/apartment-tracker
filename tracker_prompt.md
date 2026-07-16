# Build: Chelsea apartment tour tracker

Build a mobile-first web app for tracking apartment tours in Chelsea, Manhattan. I use it one-handed on my phone while walking around, and review it later on a laptop. Speed of capture matters more than polish — I should be able to rate a block in under 5 seconds while standing on the corner.

## Stack

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Map: **Leaflet + react-leaflet** with OpenStreetMap tiles (no API key, no billing)
- Storage: **local-first**. All writes go to IndexedDB (use Dexie) synchronously from the UI's perspective, then sync to Supabase in the background when online. Never block the UI on the network — NYC buildings have dead zones and I will be in elevators and basements.
- Deploy target: Vercel. It must work as a PWA (installable, offline-capable, tiles cached for the Chelsea bounding box).

## Core data model

Two top-level entities.

### 1. BlockSegment

A single side-to-side stretch of street between two cross streets. **Pre-generate the entire Chelsea grid at build time** as a static GeoJSON file — do not fetch from Overpass at runtime.

Grid bounds: W 14th St through W 30th St, and 6th Ave through 11th Ave.

Generate:
- Every **street** segment: e.g. W 20th St between 8th Ave and 9th Ave
- Every **avenue** segment: e.g. 8th Ave between W 19th St and W 20th St

Each segment is a GeoJSON `LineString` with a stable deterministic ID:
- Streets: `w20-8-9` (W 20th St, between 8th and 9th Ave — lower avenue number first)
- Avenues: `8ave-19-20` (8th Ave, between W 19th and W 20th St — lower street number first)

Derive coordinates from a hardcoded lookup table of avenue longitudes and street latitudes. The Chelsea grid is regular enough that a lat/lng table plus linear interpolation gives segments accurate enough to tap. Note the grid is rotated ~29° from true north — account for this so segments actually sit on the roads rather than floating diagonally off them.

Fields I can edit per segment:
- `rating`: 1–5 stars, tap to set
- `notes`: free text
- `tags`: multi-select chips — `quiet`, `loud`, `tree-lined`, `pretty`, `ugly`, `sketchy at night`, `smells`, `construction`, `too commercial`, `good light`, `dead at night`
- `visitedAt`: timestamp, auto-set on first edit

### 2. Apartment

Fields:
- **Structured:**
  - `address` (string, required) + `unit`
  - `lat`/`lng` (from geocoding, user-adjustable by dragging the pin)
  - `blockSegmentId` — auto-assigned by finding the nearest segment; this links apartments to block notes
  - `rent` (number, monthly)
  - `beds` (0 for studio, supports 0.5 increments for "flex"), `baths`
  - `sqft` (nullable — NYC listings often omit it)
  - `floor` (number), `elevator` (bool), `walkupFlights` (number, only if no elevator)
  - `laundry`: enum `in-unit` | `in-building` | `none`
  - `dishwasher` (bool)
  - `outdoorSpace`: enum `none` | `balcony` | `terrace` | `shared-roof` | `backyard`
  - `exposure`: multi-select `N` | `S` | `E` | `W`
  - `naturalLight`: 1–5
  - `noiseLevel`: 1–5
  - `ac`: enum `central` | `window-units` | `mini-split` | `none`
  - `petsAllowed` (bool), `utilitiesIncluded` (multi-select: heat, hot water, gas, electric, wifi)
  - `availableDate` (date), `leaseTermMonths`
  - `brokerFee` (bool — under the FARE Act the landlord pays, but flag any listing that still tries)
  - `listingUrl`, `agentName`, `agentPhone`
  - `tourDate` (date)
  - `rating`: 1–5
  - `verdict`: enum `yes` | `maybe` | `no` | `not-toured-yet`
- **Unstructured:**
  - `notes` (free text, the catch-all)
  - `photos`: array of images, stored as blobs in IndexedDB, uploaded to Supabase Storage on sync. Camera capture directly from the form.

## Add-apartment flow

This is the flow I use most, so make it fast:

1. Big persistent "+ Add apartment" FAB on the map screen.
2. **Step 1 — address.** A single text input with autocomplete. Use Nominatim (OSM geocoder) with a viewbox biased to Chelsea and `countrycodes=us`. Respect its 1 req/sec rate limit — debounce at 400ms and set a proper `User-Agent`. Show matched results as a tappable list; on select, drop the pin and show a mini-map so I can confirm or drag it. If geocoding fails entirely, let me long-press the map to drop a pin manually and type the address free-form. **Never let a failed geocode block me from saving.**
3. **Step 2 — the essentials only:** rent, beds, baths, tour date. Everything else is collapsed behind a "More details" accordion. I should be able to save after step 2.
4. **Step 3 (optional) — full details + photos + notes.**

Saving is always available from any step. Partial records are fine and normal.

## Map screen (the home screen)

- Leaflet map centered on Chelsea, sensible zoom bounds so I can't wander off to Queens.
- Block segments rendered as clickable `Polyline`s with generous `weight` and an invisible wider hit area (~20px) so they're tappable with a thumb. Color by rating: unrated = light gray, 1–2 = red ramp, 3 = amber, 4–5 = green ramp.
- Tapping a segment opens a bottom sheet: segment name ("W 20th St · 8th–9th Ave"), star rating, tag chips, notes textarea, and a list of any apartments on that block. Autosave on change — no save button, no modal.
- Apartment pins colored by `verdict` (green/amber/red/gray). Tapping opens a detail sheet.
- Top bar filters: min/max rent, min beds, verdict, "has laundry", "elevator only".
- A "locate me" button — when I'm standing on a block, I want to jump straight to rating it. Bonus: if my GPS position is within ~30m of a segment, surface a "rate this block" shortcut.

## List / compare screen

- Sortable table of apartments: address, rent, beds, sqft, $/sqft (computed), block rating, apartment rating, verdict.
- Tapping a row opens the detail sheet; a "show on map" action jumps back to the pin.
- Export everything to JSON and CSV. This is important — I want to hand the CSV to my wife and I want a bail-out path if the app breaks.

## Supabase

- Two tables (`block_segments`, `apartments`) plus a `photos` storage bucket.
- Single-user: no auth UI. Use a hardcoded user id from an env var, with RLS policies keyed to it. Don't build a login screen.
- Sync strategy: last-write-wins on `updated_at`. Every record carries a client-generated UUID so offline creates don't collide. Show a small sync status indicator (synced / pending / offline) — I want to know if my notes are safe.
- Include the SQL migration files in the repo. Put Supabase URL/key in `.env.local` and give me a `.env.example`.

## Mobile UX constraints — these are hard requirements

- All primary controls reachable in the bottom third of the screen. No top-corner buttons for anything I do often.
- Tap targets ≥44px.
- Autosave everywhere. No "unsaved changes" state can ever exist.
- Works with zero network. The sync indicator is the only thing allowed to notice.
- No confirmation dialogs except for delete.

## Deliverables

- Working app, `npm run dev` clean out of the box.
- Seed the block segment GeoJSON as a committed file, generated by a script I can re-run (`scripts/generate-grid.ts`) if I want to widen the bounds later.
- Seed 2–3 fake apartments so the map isn't empty on first run.
- README covering Supabase setup and Vercel deploy.

## Build order

1. Grid generation script + GeoJSON output — verify visually that segments sit on real roads before doing anything else. This is the highest-risk piece; get it right first.
2. Map screen with clickable segments + local (IndexedDB) block notes and ratings.
3. Add-apartment flow + pins.
4. List/compare screen + export.
5. Supabase sync layer.
6. PWA / offline tile caching.

Stop after step 1 and show me a screenshot so I can confirm the grid alignment before you continue.
