"use client";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export default function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          onClick={() => onChange(value === n ? 0 : n)}
          className="flex h-11 w-11 items-center justify-center text-3xl leading-none"
        >
          <span className={value >= n ? "text-amber-400" : "text-zinc-300 dark:text-zinc-600"}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}
