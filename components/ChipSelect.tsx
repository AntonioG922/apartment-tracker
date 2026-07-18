"use client";

interface ChipSelectProps<T extends string> {
  options: readonly T[];
  value: T[];
  onChange: (value: T[]) => void;
}

export default function ChipSelect<T extends string>({
  options,
  value,
  onChange,
}: ChipSelectProps<T>) {
  function toggle(option: T) {
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(option)}
            className={`min-h-11 rounded-full border px-3 py-2 text-sm transition-colors ${
              active
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
