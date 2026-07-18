"use client";

interface NumberStepperProps {
  value: number | null;
  onChange: (value: number | null) => void;
  step?: number;
  min?: number;
  suffix?: string;
}

export default function NumberStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  suffix,
}: NumberStepperProps) {
  const current = value ?? min;

  function adjust(delta: number) {
    const next = Math.max(min, Math.round((current + delta) / step) * step);
    onChange(next);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => adjust(-step)}
        aria-label="Decrease"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 text-lg text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
      >
        −
      </button>
      <span className="min-w-12 text-center text-base text-zinc-900 dark:text-zinc-100">
        {value === null ? "—" : `${value}${suffix ?? ""}`}
      </span>
      <button
        type="button"
        onClick={() => adjust(step)}
        aria-label="Increase"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 text-lg text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
      >
        +
      </button>
    </div>
  );
}
