"use client";

import { useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import type { LeafletMouseEvent, Marker as LeafletMarker } from "leaflet";
import { searchAddress, type GeocodeResult } from "@/lib/geocode";
import { findNearestSegmentId } from "@/lib/nearest-segment";
import { createApartment } from "@/lib/db";
import { PIN_ICON } from "@/lib/pin-icon";

const CHELSEA_CENTER: [number, number] = [40.7449, -73.9997];
const SEARCH_DEBOUNCE_MS = 400;

interface Pin {
  lat: number;
  lng: number;
}

interface AddressSearchSheetProps {
  grid: FeatureCollection | null;
  onClose: () => void;
  onCreated: (apartmentId: string) => void;
}

function ClickToPlacePin({ onPick }: { onPick: (pin: Pin) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function RecenterOnPin({ pin }: { pin: Pin | null }) {
  const map = useMap();
  useEffect(() => {
    if (pin) map.setView([pin.lat, pin.lng], 18);
  }, [pin, map]);
  return null;
}

export default function AddressSearchSheet({ grid, onClose, onCreated }: AddressSearchSheetProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pin, setPin] = useState<Pin | null>(null);
  const [addressText, setAddressText] = useState("");
  const [saving, setSaving] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    setMessage(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (!value.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      searchAddress(value, controller.signal)
        .then((found) => {
          setResults(found);
          if (found.length === 0) {
            setMessage("No matches - tap the map to drop a pin manually.");
          }
        })
        .catch((err: unknown) => {
          if ((err as Error).name !== "AbortError") {
            setMessage("Search failed - tap the map to drop a pin manually.");
          }
        })
        .finally(() => setLoading(false));
    }, SEARCH_DEBOUNCE_MS);
  }

  function handleSelectResult(result: GeocodeResult) {
    setPin({ lat: result.lat, lng: result.lon });
    setAddressText(result.displayName);
    setQuery(result.displayName);
    setResults([]);
  }

  function handleMapPick(next: Pin) {
    setPin(next);
    setAddressText((current) => current || query);
  }

  async function handleConfirm() {
    if (!pin || saving) return;
    setSaving(true);
    const blockSegmentId = grid ? findNearestSegmentId(pin.lat, pin.lng, grid) : null;
    const id = await createApartment({
      address: addressText || query || "Untitled address",
      lat: pin.lat,
      lng: pin.lng,
      blockSegmentId,
    });
    onCreated(id);
  }

  return (
    <Drawer.Root open onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[1100] bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[1101] flex max-h-[90vh] flex-col rounded-t-2xl bg-white outline-none dark:bg-zinc-900">
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4">
            <Drawer.Title className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Add apartment
            </Drawer.Title>

            <input
              autoFocus
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Address..."
              className="mt-4 w-full rounded-lg border border-zinc-300 bg-white p-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />

            {loading && <p className="mt-2 text-sm text-zinc-500">Searching...</p>}
            {message && <p className="mt-2 text-sm text-zinc-500">{message}</p>}

            {results.length > 0 && (
              <ul className="mt-2 divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
                {results.map((r) => (
                  <li key={r.placeId}>
                    <button
                      type="button"
                      onClick={() => handleSelectResult(r)}
                      className="block min-h-11 w-full px-3 py-3 text-left text-sm text-zinc-800 dark:text-zinc-200"
                    >
                      {r.displayName}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 h-56 overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
              <MapContainer
                center={pin ?? CHELSEA_CENTER}
                zoom={pin ? 18 : 15}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClickToPlacePin onPick={handleMapPick} />
                <RecenterOnPin pin={pin} />
                {pin && (
                  <Marker
                    position={[pin.lat, pin.lng]}
                    draggable
                    icon={PIN_ICON}
                    eventHandlers={{
                      dragend: (e) => {
                        const marker = e.target as LeafletMarker;
                        const ll = marker.getLatLng();
                        setPin({ lat: ll.lat, lng: ll.lng });
                      },
                    }}
                  />
                )}
              </MapContainer>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              {pin
                ? "Drag the pin to fine-tune, or tap elsewhere on the map."
                : "Search above, or tap the map to drop a pin manually."}
            </p>

            <button
              type="button"
              disabled={!pin || saving}
              onClick={handleConfirm}
              className="mt-5 min-h-11 w-full rounded-lg bg-zinc-900 py-3 text-base font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Use this location
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
