import type {
  CreateMarkerInput,
  HerbCard,
  HerbMarker,
  Taxonomy,
  UpdateMarkerInput,
} from "@/types/herb";

type Envelope<T> = { data?: T; error?: string };

async function request<T>(
  url: string,
  init: RequestInit | undefined,
  fallbackError: string,
): Promise<T> {
  const res = await fetch(url, init);
  const payload = (await res.json().catch(() => ({}))) as Envelope<T>;
  if (!res.ok) throw new Error(payload.error ?? fallbackError);
  return payload.data as T;
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const fetchHerbs = (signal?: AbortSignal) =>
  request<HerbCard[]>("/api/herbs", { signal }, "Não foi possível carregar o guia de ervas.");

export const fetchTaxonomy = (signal?: AbortSignal) =>
  request<Taxonomy>("/api/taxonomy", { signal }, "Não foi possível carregar as classificações.");

export const fetchMarkers = (signal?: AbortSignal) =>
  request<HerbMarker[]>("/api/markers", { signal }, "Não foi possível carregar os pontos.");

export const createMarker = (body: CreateMarkerInput) =>
  request<HerbMarker>("/api/markers", json("POST", body), "Não foi possível salvar.");

export const updateMarker = (id: string, body: UpdateMarkerInput) =>
  request<HerbMarker>(`/api/markers/${id}`, json("PATCH", body), "Não foi possível atualizar.");

export async function deleteMarker(id: string): Promise<void> {
  const res = await fetch(`/api/markers/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error ?? "Não foi possível remover.");
  }
}
