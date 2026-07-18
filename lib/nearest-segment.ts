import type { FeatureCollection } from "geojson";

const METERS_PER_DEG_LAT = 111_320;

// Squared distance (in meters) from point p to segment ab, all as [x, y]
// meter offsets in a local planar frame - fine at Chelsea's scale.
function pointToSegmentDistSq(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  let t = lengthSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return (px - cx) ** 2 + (py - cy) ** 2;
}

// Finds the id of the grid segment nearest to (lat, lng), or null if the
// grid has no features.
export function findNearestSegmentId(
  lat: number,
  lng: number,
  grid: FeatureCollection,
): string | null {
  const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
  const toXY = (lngPt: number, latPt: number): [number, number] => [
    (lngPt - lng) * metersPerDegLng,
    (latPt - lat) * METERS_PER_DEG_LAT,
  ];
  const [px, py] = [0, 0]; // the point itself, in its own local frame

  let bestId: string | null = null;
  let bestDistSq = Infinity;

  for (const feature of grid.features) {
    if (feature.geometry.type !== "LineString") continue;
    const coords = feature.geometry.coordinates;
    for (let i = 0; i < coords.length - 1; i++) {
      const [ax, ay] = toXY(coords[i][0], coords[i][1]);
      const [bx, by] = toXY(coords[i + 1][0], coords[i + 1][1]);
      const distSq = pointToSegmentDistSq(px, py, ax, ay, bx, by);
      if (distSq < bestDistSq) {
        bestDistSq = distSq;
        bestId = (feature.properties?.id as string | undefined) ?? null;
      }
    }
  }

  return bestId;
}
