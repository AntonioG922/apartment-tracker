"use client";

interface BoolToggleProps {
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  yesLabel?: string;
  noLabel?: string;
}

export default function BoolToggle({
  value,
  onChange,
  yesLabel = "Yes",
  noLabel = "No",
}: BoolToggleProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        aria-pressed={value === true}
        onClick={() => onChange(value === true ? null : true)}
        className={`min-h-11 flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
          value === true
            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
            : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        }`}
      >
        {yesLabel}
      </button>
      <button
        type="button"
        aria-pressed={value === false}
        onClick={() => onChange(value === false ? null : false)}
        className={`min-h-11 flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
          value === false
            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
            : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        }`}
      >
        {noLabel}
      </button>
    </div>
  );
}
