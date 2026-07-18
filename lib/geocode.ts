// Nominatim (OpenStreetMap) address search, biased to the Chelsea grid
// bounds. Browsers refuse to let JS set a `User-Agent` header (it's a
// forbidden header name per the Fetch spec) - Nominatim's own usage policy
// accounts for this and accepts the `Referer` header browsers send
// automatically instead, so we just fetch directly with no custom headers.
//
// Callers are responsible for debouncing (~400ms) and cancelling in-flight
// requests via AbortController, per Nominatim's ~1 req/sec usage policy.

const CHELSEA_VIEWBOX = "-74.0125,40.7555,-73.987,40.7345"; // left,top,right,bottom

export interface GeocodeResult {
  placeId: number;
  displayName: string;
  lat: number;
  lon: number;
}

export async function searchAddress(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodeResult[]> {
  if (!query.trim()) return [];

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", query);
  url.searchParams.set("viewbox", CHELSEA_VIEWBOX);
  url.searchParams.set("countrycodes", "us");
  url.searchParams.set("limit", "5");

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error(`Nominatim search failed: ${res.status}`);

  const data: Array<{ place_id: number; display_name: string; lat: string; lon: string }> =
    await res.json();

  return data.map((r) => ({
    placeId: r.place_id,
    displayName: r.display_name,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
  }));
}
