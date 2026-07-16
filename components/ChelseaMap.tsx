"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import "leaflet/dist/leaflet.css";

// Roughly centers the W14th-W30th / 6th-11th Ave bounding box.
const CHELSEA_CENTER: [number, number] = [40.7449, -73.9997];
const CHELSEA_BOUNDS: [[number, number], [number, number]] = [
  [40.7345, -74.0125],
  [40.7555, -73.987],
];

export default function ChelseaMap() {
  const [grid, setGrid] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetch("/data/chelsea-grid.geojson")
      .then((res) => res.json())
      .then(setGrid);
  }, []);

  return (
    <MapContainer
      center={CHELSEA_CENTER}
      zoom={16}
      maxBounds={CHELSEA_BOUNDS}
      maxBoundsViscosity={1.0}
      minZoom={15}
      maxZoom={19}
      className="h-screen w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {grid && (
        <GeoJSON
          data={grid}
          style={{ color: "#9ca3af", weight: 4, opacity: 0.9 }}
        />
      )}
    </MapContainer>
  );
}
