"use client";

import { useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import { updateBlockSegment, type BlockSegmentRecord } from "@/lib/db";
import type { BlockTag } from "@/lib/tags";
import StarRating from "./StarRating";
import TagChips from "./TagChips";

export interface SelectedSegment {
  id: string;
  name: string;
}

interface BlockSheetProps {
  segment: SelectedSegment | null;
  record: BlockSegmentRecord | undefined;
  onClose: () => void;
}

const NOTES_SAVE_DEBOUNCE_MS = 400;

// Keyed by segment id at the call site, so a new segment remounts this
// component and re-initializes `notes` fresh - no effect needed to sync it.
export default function BlockSheet({ segment, record, onClose }: BlockSheetProps) {
  const [notes, setNotes] = useState(() => record?.notes ?? "");
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (notesTimer.current) clearTimeout(notesTimer.current);
    };
  }, []);

  if (!segment) return null;

  function handleNotesChange(next: string) {
    setNotes(next);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => {
      updateBlockSegment(segment!.id, { notes: next });
    }, NOTES_SAVE_DEBOUNCE_MS);
  }

  function handleRatingChange(rating: number) {
    updateBlockSegment(segment!.id, { rating });
  }

  function handleTagsChange(tags: BlockTag[]) {
    updateBlockSegment(segment!.id, { tags });
  }

  return (
    <Drawer.Root
      open={!!segment}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[1100] bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[1101] flex max-h-[85vh] flex-col rounded-t-2xl bg-white outline-none dark:bg-zinc-900">
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4">
            <Drawer.Title className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {segment.name}
            </Drawer.Title>

            <div className="mt-4">
              <StarRating value={record?.rating ?? 0} onChange={handleRatingChange} />
            </div>

            <div className="mt-5">
              <TagChips value={record?.tags ?? []} onChange={handleTagsChange} />
            </div>

            <div className="mt-5">
              <textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Notes..."
                rows={4}
                className="w-full resize-none rounded-lg border border-zinc-300 bg-white p-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
