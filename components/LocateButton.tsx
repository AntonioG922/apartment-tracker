"use client";

import { useState } from "react";
import { useMap } from "react-leaflet";

export default function LocateButton() {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  function handleLocate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 18);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return (
    <button
      type="button"
      onClick={handleLocate}
      aria-label="Locate me"
      className="absolute bottom-24 right-4 z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-lg dark:bg-zinc-800"
    >
      {locating ? "…" : "📍"}
    </button>
  );
}
