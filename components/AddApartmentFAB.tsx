"use client";

interface AddApartmentFABProps {
  onClick: () => void;
}

export default function AddApartmentFAB({ onClick }: AddApartmentFABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute bottom-24 left-4 z-[1000] flex h-14 items-center gap-1 rounded-full bg-zinc-900 px-5 text-base font-medium text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
    >
      <span className="text-xl leading-none">+</span> Add apartment
    </button>
  );
}
