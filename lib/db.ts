import Dexie, { type EntityTable } from "dexie";
import type { BlockTag } from "./tags";

export interface BlockSegmentRecord {
  id: string; // matches the GeoJSON feature id, e.g. "w20-8-9"
  rating: number; // 0 = unrated, 1-5
  notes: string;
  tags: BlockTag[];
  visitedAt: number | null; // epoch ms, set on first edit
}

const db = new Dexie("apartment-tracker") as Dexie & {
  blockSegments: EntityTable<BlockSegmentRecord, "id">;
};

db.version(1).stores({
  blockSegments: "id",
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

export default db;
