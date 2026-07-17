"use client";

import { BLOCK_TAGS, type BlockTag } from "@/lib/tags";

interface TagChipsProps {
  value: BlockTag[];
  onChange: (value: BlockTag[]) => void;
}

export default function TagChips({ value, onChange }: TagChipsProps) {
  function toggle(tag: BlockTag) {
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {BLOCK_TAGS.map((tag) => {
        const active = value.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(tag)}
            className={`min-h-11 rounded-full border px-3 py-2 text-sm transition-colors ${
              active
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
