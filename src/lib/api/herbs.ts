import type { HerbMarker } from "@/types/herb";

export type HerbsFilter = {
  q?: string;
  status?: "todos" | "pouca" | "muita";
};

export type HerbPayload = {
  herbKey: string;
  status: string;
  notes: string;
  addressLabel: string;
  lat: number;
  lng: number;
};

export async function fetchHerbs(
  filter: HerbsFilter,
  signal?: AbortSignal,
): Promise<HerbMarker[]> {
  const params = new URLSearchParams();
  if (filter.q?.trim()) params.set("q", filter.q.trim());
  if (filter.status && filter.status !== "todos") params.set("status", filter.status);

  const res = await fetch(`/api/herbs?${params.toString()}`, { signal });
  const payload = (await res.json()) as { data?: HerbMarker[]; error?: string };
  if (!res.ok) throw new Error(payload.error ?? "Não foi possível carregar os pontos.");
  return payload.data ?? [];
}

export async function createHerb(
  body: HerbPayload,
  signal?: AbortSignal,
): Promise<HerbMarker> {
  const res = await fetch("/api/herbs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const payload = (await res.json()) as { data?: HerbMarker; error?: string };
  if (!res.ok) throw new Error(payload.error ?? "Não foi possível salvar.");
  return payload.data!;
}

export async function updateHerb(
  id: string,
  body: Partial<HerbPayload>,
  signal?: AbortSignal,
): Promise<HerbMarker> {
  const res = await fetch(`/api/herbs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const payload = (await res.json()) as { data?: HerbMarker; error?: string };
  if (!res.ok) throw new Error(payload.error ?? "Não foi possível atualizar.");
  return payload.data!;
}

export async function deleteHerb(id: string, signal?: AbortSignal): Promise<void> {
  const res = await fetch(`/api/herbs/${id}`, { method: "DELETE", signal });
  const payload = (await res.json()) as { success?: boolean; error?: string };
  if (!res.ok) throw new Error(payload.error ?? "Não foi possível remover.");
}
