import type { HerbCatalogEntry } from "@/types/herb";

export async function fetchHerbCatalog(
  signal?: AbortSignal,
): Promise<HerbCatalogEntry[]> {
  const res = await fetch("/api/herbs/catalog", { signal });
  const payload = (await res.json()) as {
    data?: HerbCatalogEntry[];
    error?: string;
  };
  if (!res.ok) {
    throw new Error(payload.error ?? "Não foi possível carregar o catálogo.");
  }
  return payload.data ?? [];
}
