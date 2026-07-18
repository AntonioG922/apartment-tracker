"use client";

import { Marker } from "react-leaflet";
import type { ApartmentRecord } from "@/lib/db";
import { VERDICT_PIN_ICONS } from "@/lib/pin-icon";

interface ApartmentMarkersProps {
  apartments: ApartmentRecord[];
  onSelect: (id: string) => void;
}

export default function ApartmentMarkers({ apartments, onSelect }: ApartmentMarkersProps) {
  return (
    <>
      {apartments
        .filter((a): a is ApartmentRecord & { lat: number; lng: number } => a.lat !== null && a.lng !== null)
        .map((a) => (
          <Marker
            key={a.id}
            position={[a.lat, a.lng]}
            icon={VERDICT_PIN_ICONS[a.verdict]}
            eventHandlers={{ click: () => onSelect(a.id) }}
          />
        ))}
    </>
  );
}
