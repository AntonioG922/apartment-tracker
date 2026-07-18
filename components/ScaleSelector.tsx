"use client";

interface ScaleSelectorProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export default function ScaleSelector({ value, onChange }: ScaleSelectorProps) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? null : n)}
            className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-medium ${
              active
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
