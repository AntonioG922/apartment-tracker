"use client";

import { useState } from "react";
import { Circle, CircleMarker, useMap } from "react-leaflet";

export default function LocateButton() {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState(0);

  function handleLocate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        map.flyTo(next, 18);
        setPosition(next);
        setAccuracy(pos.coords.accuracy);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return (
    <>
      {position && (
        <>
          <Circle
            center={position}
            radius={accuracy}
            pathOptions={{ color: "#3b82f6", weight: 1, fillColor: "#3b82f6", fillOpacity: 0.12 }}
          />
          <CircleMarker
            center={position}
            radius={8}
            pathOptions={{ color: "#fff", weight: 3, fillColor: "#3b82f6", fillOpacity: 1 }}
          />
        </>
      )}
      <button
        type="button"
        onClick={handleLocate}
        aria-label="Locate me"
        className="absolute bottom-24 right-4 z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-lg dark:bg-zinc-800"
      >
        {locating ? "…" : "📍"}
      </button>
    </>
  );
}
