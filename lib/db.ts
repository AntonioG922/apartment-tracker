import Dexie, { type EntityTable } from "dexie";
import type { BlockTag } from "./tags";
import type { Ac, Exposure, Laundry, OutdoorSpace, Utility, Verdict } from "./apartment-fields";

export interface BlockSegmentRecord {
  id: string; // matches the GeoJSON feature id, e.g. "w20-8-9"
  rating: number; // 0 = unrated, 1-5
  notes: string;
  tags: BlockTag[];
  visitedAt: number | null; // epoch ms, set on first edit
}

export interface ApartmentRecord {
  id: string; // client-generated UUID
  // Structured
  address: string;
  unit: string;
  lat: number | null;
  lng: number | null;
  blockSegmentId: string | null;
  rent: number | null;
  beds: number | null; // 0 = studio, 0.5 increments allowed
  baths: number | null;
  sqft: number | null;
  floor: number | null;
  elevator: boolean | null;
  walkupFlights: number | null;
  laundry: Laundry | null;
  dishwasher: boolean | null;
  outdoorSpace: OutdoorSpace | null;
  exposure: Exposure[];
  naturalLight: number | null; // 1-5
  noiseLevel: number | null; // 1-5
  ac: Ac | null;
  petsAllowed: boolean | null;
  utilitiesIncluded: Utility[];
  availableDate: string | null; // ISO date (yyyy-mm-dd)
  leaseTermMonths: number | null;
  brokerFee: boolean | null;
  listingUrl: string;
  agentName: string;
  agentPhone: string;
  tourDate: string | null; // ISO date (yyyy-mm-dd)
  rating: number; // 0 = unrated, 1-5
  verdict: Verdict;
  // Unstructured
  notes: string;
  // Sync bookkeeping (used from step 5 onward)
  updatedAt: number;
}

export interface PhotoRecord {
  id: string; // client-generated UUID
  apartmentId: string;
  blob: Blob;
  createdAt: number;
}

const db = new Dexie("apartment-tracker") as Dexie & {
  blockSegments: EntityTable<BlockSegmentRecord, "id">;
  apartments: EntityTable<ApartmentRecord, "id">;
  photos: EntityTable<PhotoRecord, "id">;
};

db.version(1).stores({
  blockSegments: "id",
});

db.version(2).stores({
  blockSegments: "id",
  apartments: "id, blockSegmentId, verdict",
  photos: "id, apartmentId",
});

export function emptyBlockSegment(id: string): BlockSegmentRecord {
  return { id, rating: 0, notes: "", tags: [], visitedAt: null };
}

// Upserts a segment's edited fields, stamping visitedAt on first edit only.
export async function updateBlockSegment(
  id: string,
  changes: Partial<Omit<BlockSegmentRecord, "id" | "visitedAt">>,
): Promise<void> {
  const existing = await db.blockSegments.get(id);
  const base = existing ?? emptyBlockSegment(id);
  await db.blockSegments.put({
    ...base,
    ...changes,
    id,
    visitedAt: base.visitedAt ?? Date.now(),
  });
}

export function emptyApartment(id: string, seed: Partial<ApartmentRecord> = {}): ApartmentRecord {
  return {
    id,
    address: "",
    unit: "",
    lat: null,
    lng: null,
    blockSegmentId: null,
    rent: null,
    beds: null,
    baths: null,
    sqft: null,
    floor: null,
    elevator: null,
    walkupFlights: null,
    laundry: null,
    dishwasher: null,
    outdoorSpace: null,
    exposure: [],
    naturalLight: null,
    noiseLevel: null,
    ac: null,
    petsAllowed: null,
    utilitiesIncluded: [],
    availableDate: null,
    leaseTermMonths: null,
    brokerFee: null,
    listingUrl: "",
    agentName: "",
    agentPhone: "",
    tourDate: null,
    rating: 0,
    verdict: "not-toured-yet",
    notes: "",
    updatedAt: Date.now(),
    ...seed,
  };
}

export async function createApartment(seed: Partial<ApartmentRecord>): Promise<string> {
  const id = crypto.randomUUID();
  await db.apartments.put(emptyApartment(id, seed));
  return id;
}

export async function updateApartment(
  id: string,
  changes: Partial<Omit<ApartmentRecord, "id">>,
): Promise<void> {
  const existing = await db.apartments.get(id);
  const base = existing ?? emptyApartment(id);
  await db.apartments.put({ ...base, ...changes, id, updatedAt: Date.now() });
}

export async function deleteApartment(id: string): Promise<void> {
  await db.transaction("rw", db.apartments, db.photos, async () => {
    await db.apartments.delete(id);
    await db.photos.where("apartmentId").equals(id).delete();
  });
}

export async function addPhoto(apartmentId: string, blob: Blob): Promise<string> {
  const id = crypto.randomUUID();
  await db.photos.put({ id, apartmentId, blob, createdAt: Date.now() });
  return id;
}

export async function deletePhoto(id: string): Promise<void> {
  await db.photos.delete(id);
}

export default db;
