"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import db, { addPhoto, deletePhoto } from "@/lib/db";

function PhotoThumb({ blob, onDelete }: { blob: Blob; onDelete: () => void }) {
  const url = useMemo(() => URL.createObjectURL(blob), [blob]);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
      {/* eslint-disable-next-line @next/next/no-img-element -- local blob: URL, not a next/image-compatible remote asset */}
      <img src={url} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete photo"
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white"
      >
        ✕
      </button>
    </div>
  );
}

interface PhotoPickerProps {
  apartmentId: string;
}

export default function PhotoPicker({ apartmentId }: PhotoPickerProps) {
  const photos = useLiveQuery(
    () => db.photos.where("apartmentId").equals(apartmentId).toArray(),
    [apartmentId],
  );
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      await addPhoto(apartmentId, file);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(photos ?? []).map((p) => (
          <PhotoThumb key={p.id} blob={p.blob} onDelete={() => deletePhoto(p.id)} />
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Add photo"
          className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-zinc-400 text-2xl text-zinc-400"
        >
          +
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
