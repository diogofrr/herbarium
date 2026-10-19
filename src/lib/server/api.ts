import type { HerbCard, HerbDetail, Taxonomy } from "@/types/herb";

export const API_URL = process.env.HERBARIUM_API_URL ?? "http://localhost:8081";

/** Segundos de cache dos dados da wiki (mudam raramente). */
export const WIKI_REVALIDATE = 300;

export type ApiResult<T> = { data: T | null; status: number };

/** status 0 = backend inalcançável; 404 = não existe; demais = resposta da API. */
async function apiGet<T>(path: string, revalidate = WIKI_REVALIDATE): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate } });
    if (!res.ok) return { data: null, status: res.status };
    return { data: (await res.json()) as T, status: res.status };
  } catch {
    return { data: null, status: 0 };
  }
}

export const getHerbs = async () => (await apiGet<HerbCard[]>("/herbs")).data;
export const getTaxonomy = async () => (await apiGet<Taxonomy>("/taxonomy")).data;
export const getHerb = (slug: string) =>
  apiGet<HerbDetail>(`/herbs/${encodeURIComponent(slug)}`);
