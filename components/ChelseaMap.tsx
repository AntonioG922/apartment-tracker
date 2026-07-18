"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useLiveQuery } from "dexie-react-hooks";
import type { Feature, FeatureCollection } from "geojson";
import type { Layer, PathOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import db, { type ApartmentRecord, type BlockSegmentRecord } from "@/lib/db";
import { ratingColor } from "@/lib/rating-colors";
import BlockSheet, { type SelectedSegment } from "./BlockSheet";
import LocateButton from "./LocateButton";
import AddApartmentFAB from "./AddApartmentFAB";
import AddressSearchSheet from "./AddressSearchSheet";
import ApartmentSheet from "./ApartmentSheet";
import ApartmentMarkers from "./ApartmentMarkers";

// Roughly centers the W14th-W30th / 6th-11th Ave bounding box.
const CHELSEA_CENTER: [number, number] = [40.7449, -73.9997];
const CHELSEA_BOUNDS: [[number, number], [number, number]] = [
  [40.7345, -74.0125],
  [40.7555, -73.987],
];

export default function ChelseaMap() {
  const [grid, setGrid] = useState<FeatureCollection | null>(null);
  const [selected, setSelected] = useState<SelectedSegment | null>(null);
  const [addingApartment, setAddingApartment] = useState(false);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/chelsea-grid.geojson")
      .then((res) => res.json())
      .then(setGrid);
  }, []);

  const segments = useLiveQuery(() => db.blockSegments.toArray(), []);
  const recordsById = useMemo(() => {
    const map = new Map<string, BlockSegmentRecord>();
    for (const s of segments ?? []) map.set(s.id, s);
    return map;
  }, [segments]);
  const ratings = useMemo(() => {
    const map = new Map<string, number>();
    for (const [id, s] of recordsById) map.set(id, s.rating);
    return map;
  }, [recordsById]);

  const apartments = useLiveQuery(() => db.apartments.toArray(), []);
  const apartmentsById = useMemo(() => {
    const map = new Map<string, ApartmentRecord>();
    for (const a of apartments ?? []) map.set(a.id, a);
    return map;
  }, [apartments]);

  const visibleStyle = useCallback(
    (feature?: Feature): PathOptions => {
      const rating = feature ? (ratings.get(feature.properties?.id) ?? 0) : 0;
      return { color: ratingColor(rating), weight: 5, opacity: 0.9 };
    },
    [ratings],
  );

  const hitAreaStyle = useCallback(
    (): PathOptions => ({ color: "#000", weight: 20, opacity: 0 }),
    [],
  );

  const bindClick = useCallback((feature: Feature, layer: Layer) => {
    layer.on("click", () => {
      setSelected({
        id: feature.properties?.id,
        name: feature.properties?.name,
      });
    });
  }, []);

  return (
    <>
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
          <>
            <GeoJSON data={grid} style={visibleStyle} interactive={false} />
            <GeoJSON data={grid} style={hitAreaStyle} onEachFeature={bindClick} />
          </>
        )}
        <ApartmentMarkers apartments={apartments ?? []} onSelect={setSelectedApartmentId} />
        <LocateButton />
        <AddApartmentFAB onClick={() => setAddingApartment(true)} />
      </MapContainer>

      <BlockSheet
        key={selected?.id ?? "block-closed"}
        segment={selected}
        record={selected ? recordsById.get(selected.id) : undefined}
        onClose={() => setSelected(null)}
      />

      {addingApartment && (
        <AddressSearchSheet
          grid={grid}
          onClose={() => setAddingApartment(false)}
          onCreated={(id) => {
            setAddingApartment(false);
            setSelectedApartmentId(id);
          }}
        />
      )}

      <ApartmentSheet
        key={selectedApartmentId ?? "apartment-closed"}
        apartmentId={selectedApartmentId}
        record={selectedApartmentId ? apartmentsById.get(selectedApartmentId) : undefined}
        onClose={() => setSelectedApartmentId(null)}
      />
    </>
  );
}
