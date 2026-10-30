import type {
  AdminHerb,
  AdminUser,
  HerbList,
  GoneResult,
  HerbMarker,
  MarkerDetail,
  UpdateHerbInput,
} from "@/types/herb";

type Envelope<T> = { data?: T; error?: string };

async function call<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/proxy/${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = (await res.json().catch(() => ({}))) as Envelope<T>;
  if (!res.ok) throw new Error(payload.error ?? "Não foi possível concluir a ação.");
  return payload.data as T;
}

// Favoritas e listas
export const fetchFavorites = () => call<string[]>("me/favorites", "GET");
export const addFavorite = (slug: string) => call<string[]>(`me/favorites/${slug}`, "POST");
export const removeFavorite = (slug: string) => call<string[]>(`me/favorites/${slug}`, "DELETE");

export const fetchLists = () => call<HerbList[]>("me/lists", "GET");
export const createList = (body: { name?: string; herbSlugs?: string[] }) =>
  call<HerbList>("me/lists", "POST", body);
export const updateList = (id: string, body: { name?: string; herbSlugs?: string[] }) =>
  call<HerbList>(`me/lists/${id}`, "PATCH", body);
export const deleteList = (id: string) => call<{ success: true }>(`me/lists/${id}`, "DELETE");

// Pontos do mapa: histórico, confirmação e foto
export const fetchMarkerDetail = (id: string) => call<MarkerDetail>(`markers/${id}`, "GET");
export const confirmMarker = (id: string) => call<HerbMarker>(`markers/${id}/confirm`, "POST");
export const reportMarkerGone = (id: string) => call<GoneResult>(`markers/${id}/gone`, "POST");
export const uploadMarkerPhoto = (id: string, mime: string, data: string) =>
  call<{ success: true }>(`markers/${id}/photo`, "POST", { mime, data });
export const markerPhotoUrl = (id: string, version: string) =>
  `/api/proxy/markers/${id}/photo?v=${encodeURIComponent(version)}`;

// Administração
export const fetchAdminUsers = () => call<AdminUser[]>("admin/users", "GET");
export const updateAdminUser = (id: string, body: { isActive?: boolean; role?: "USER" | "HERBMASTER" }) =>
  call<AdminUser[]>(`admin/users/${id}`, "PATCH", body);
export const fetchAdminHerb = (slug: string) => call<AdminHerb>(`admin/herbs/${slug}`, "GET");
export const saveAdminHerb = (slug: string, body: UpdateHerbInput) =>
  call<AdminHerb>(`admin/herbs/${slug}`, "PATCH", body);
export const unlockAdminHerb = (slug: string) =>
  call<AdminHerb>(`admin/herbs/${slug}/unlock`, "POST");
