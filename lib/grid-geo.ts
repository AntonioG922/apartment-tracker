/**
 * Shared geo math for the Chelsea block grid.
 *
 * The Manhattan street grid is not aligned with true north/south — it's
 * rotated clockwise by roughly 29 degrees (per the Commissioners' Plan of
 * 1811). We build the grid in a local, unrotated (u, v) frame — u = meters
 * east along "streets", v = meters north along "avenues" — then rotate the
 * whole thing by GRID_ROTATION_DEG around ORIGIN to get real lat/lng.
 */

// Real-world anchor for the grid, at W 14th St & 6th Ave (ave index 5,
// street index 0 below). Fitted from two real geocoded points along 6th Ave
// (14th St and 23rd St subway/PATH stations, both ~40.7374,-73.9969 and
// ~40.7429,-73.9929) rather than assumed, since that pair also nails down
// GRID_ROTATION_DEG and STREET_SPACING_M with zero residual on those points.
const ANCHOR_AVE_INDEX = 5;
const ANCHOR_STREET_INDEX = 0;
export const ANCHOR_LAT = 40.7374;
export const ANCHOR_LNG = -73.9969;

// Clockwise rotation of the grid from true north, in degrees. Fitted from
// the two anchor points above (textbook value commonly cited is ~29deg).
export const GRID_ROTATION_DEG = 28.85;

// Distance between adjacent streets (short blocks), in meters. Fitted from
// the two anchor points above (~9 blocks apart along 6th Ave) - that fit is
// an average over 9 blocks, and real block lengths aren't perfectly uniform.
export const STREET_SPACING_M = 77.7;

// Per-gap overrides where the uniform STREET_SPACING_M average is visibly
// off against real tiles. Keyed by the lower street number of the gap (e.g.
// 23 = the block between W23rd and W24th). Confirmed against real map tiles:
// the 23rd-24th block runs wider than average, which was pushing every
// street from 24th up too far south.
const STREET_GAP_OVERRIDES_M: Partial<Record<number, number>> = {
  23: 92,
};

// Distance between adjacent avenues (long blocks), in meters. ~800 ft,
// the commonly-cited average spacing for 6th-11th Ave; not independently
// calibrated against a real second avenue point (see tracker_prompt build
// order step 1 - verify visually and adjust if a block looks off).
export const AVENUE_SPACING_M = 244;

const METERS_PER_DEG_LAT = 111_320;

function metersPerDegLng(atLat: number): number {
  return METERS_PER_DEG_LAT * Math.cos((atLat * Math.PI) / 180);
}

// Avenues covered by the grid, ordered west (index 0) to east (index 5).
export const AVENUES = [11, 10, 9, 8, 7, 6] as const;

// Streets covered by the grid, ordered south (index 0) to north (index 16).
export const STREETS = Array.from({ length: 17 }, (_, i) => 14 + i);

// Cumulative north-offset (meters) of each street index from W14th St,
// walking gap by gap so a single wider/narrower block only shifts the
// streets beyond it rather than the whole grid.
const STREET_OFFSETS_M: number[] = (() => {
  const offsets = [0];
  for (let i = 0; i < STREETS.length - 1; i++) {
    const gap = STREET_GAP_OVERRIDES_M[STREETS[i]] ?? STREET_SPACING_M;
    offsets.push(offsets[i] + gap);
  }
  return offsets;
})();

/**
 * Convert a local grid position to [lng, lat].
 * aveIndex: 0 = 11th Ave ... 5 = 6th Ave (increasing eastward)
 * streetIndex: 0 = W14th St ... 16 = W30th St (increasing northward)
 */
export function gridToLngLat(aveIndex: number, streetIndex: number): [number, number] {
  const u = (aveIndex - ANCHOR_AVE_INDEX) * AVENUE_SPACING_M;
  const v = STREET_OFFSETS_M[streetIndex] - STREET_OFFSETS_M[ANCHOR_STREET_INDEX];

  const theta = (GRID_ROTATION_DEG * Math.PI) / 180;
  const eastOffset = u * Math.cos(theta) + v * Math.sin(theta);
  const northOffset = -u * Math.sin(theta) + v * Math.cos(theta);

  const dLat = northOffset / METERS_PER_DEG_LAT;
  const dLng = eastOffset / metersPerDegLng(ANCHOR_LAT);

  return [ANCHOR_LNG + dLng, ANCHOR_LAT + dLat];
}
