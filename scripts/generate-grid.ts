/**
 * Generates the Chelsea block-segment grid as a static GeoJSON file.
 *
 * Run with: npx tsx scripts/generate-grid.ts
 *
 * Grid bounds: W 14th St through W 30th St, 6th Ave through 11th Ave.
 * Produces one LineString per street segment (between two avenues) and one
 * per avenue segment (between two streets), with stable deterministic IDs.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { AVENUES, STREETS, gridToLngLat } from "../lib/grid-geo";

type SegmentKind = "street" | "avenue";

interface SegmentProperties {
  id: string;
  kind: SegmentKind;
  name: string;
}

interface SegmentFeature {
  type: "Feature";
  properties: SegmentProperties;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
}

function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function makeStreetFeature(streetIndex: number, aveIndex: number): SegmentFeature {
  const streetNum = STREETS[streetIndex];
  const aveHigh = AVENUES[aveIndex]; // west side of this piece, higher avenue number
  const aveLow = AVENUES[aveIndex + 1]; // east side, lower avenue number

  return {
    type: "Feature",
    properties: {
      id: `w${streetNum}-${aveLow}-${aveHigh}`,
      kind: "street",
      name: `W ${ordinal(streetNum)} St · ${aveLow}th–${aveHigh}th Ave`,
    },
    geometry: {
      type: "LineString",
      coordinates: [gridToLngLat(aveIndex, streetIndex), gridToLngLat(aveIndex + 1, streetIndex)],
    },
  };
}

function makeAvenueFeature(aveIndex: number, streetIndex: number): SegmentFeature {
  const aveNum = AVENUES[aveIndex];
  const streetLow = STREETS[streetIndex]; // south side, lower street number
  const streetHigh = STREETS[streetIndex + 1]; // north side, higher street number

  return {
    type: "Feature",
    properties: {
      id: `${aveNum}ave-${streetLow}-${streetHigh}`,
      kind: "avenue",
      name: `${ordinal(aveNum)} Ave · W ${streetLow}th–${streetHigh}th`,
    },
    geometry: {
      type: "LineString",
      coordinates: [gridToLngLat(aveIndex, streetIndex), gridToLngLat(aveIndex, streetIndex + 1)],
    },
  };
}

function generate(): SegmentFeature[] {
  const features: SegmentFeature[] = [];

  // Street segments: each street, between every pair of adjacent avenues.
  for (let streetIndex = 0; streetIndex < STREETS.length; streetIndex++) {
    for (let aveIndex = 0; aveIndex < AVENUES.length - 1; aveIndex++) {
      features.push(makeStreetFeature(streetIndex, aveIndex));
    }
  }

  // Avenue segments: each avenue, between every pair of adjacent streets.
  for (let aveIndex = 0; aveIndex < AVENUES.length; aveIndex++) {
    for (let streetIndex = 0; streetIndex < STREETS.length - 1; streetIndex++) {
      features.push(makeAvenueFeature(aveIndex, streetIndex));
    }
  }

  return features;
}

function main() {
  const features = generate();
  const geojson = {
    type: "FeatureCollection" as const,
    features,
  };

  const outPath = resolve(__dirname, "../public/data/chelsea-grid.geojson");
  writeFileSync(outPath, JSON.stringify(geojson, null, 2));
  console.log(`Wrote ${features.length} segments to ${outPath}`);
}

main();
