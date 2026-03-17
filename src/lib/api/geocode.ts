export type GeocodeResult = { label: string; lat: number; lng: number };

export async function fetchGeocode(
  q: string,
  signal?: AbortSignal,
): Promise<GeocodeResult[]> {
  if (q.trim().length < 3) return [];
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(q.trim())}`, { signal });
  const payload = (await res.json()) as { data?: GeocodeResult[]; error?: string };
  if (!res.ok) return [];
  return payload.data ?? [];
}
