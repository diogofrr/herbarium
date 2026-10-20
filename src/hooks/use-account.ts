"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addFavorite,
  createList,
  deleteList,
  fetchFavorites,
  fetchLists,
  removeFavorite,
  updateList,
} from "@/lib/api/account";
import { useAuth } from "@/context/auth-context";
import type { HerbList } from "@/types/herb";

const FAVORITES = ["favorites"] as const;
const LISTS = ["lists"] as const;

/** Slugs das ervas favoritas do usuário logado. */
export function useFavorites() {
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: FAVORITES,
    queryFn: fetchFavorites,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
  const toggle = useMutation({
    mutationFn: ({ slug, on }: { slug: string; on: boolean }) =>
      on ? addFavorite(slug) : removeFavorite(slug),
    onMutate: async ({ slug, on }) => {
      await qc.cancelQueries({ queryKey: FAVORITES });
      const snapshot = qc.getQueryData<string[]>(FAVORITES);
      qc.setQueryData<string[]>(FAVORITES, (old) =>
        on ? [slug, ...(old ?? [])] : (old ?? []).filter((s) => s !== slug),
      );
      return { snapshot };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(FAVORITES, ctx.snapshot);
    },
    onSuccess: (slugs) => qc.setQueryData(FAVORITES, slugs),
  });
  return {
    favorites: query.data ?? [],
    isFavorite: (slug: string) => (query.data ?? []).includes(slug),
    toggle: (slug: string) => toggle.mutateAsync({ slug, on: !(query.data ?? []).includes(slug) }),
  };
}

/** Listas pessoais ("banho de descarrego", "defumação da casa"...). */
export function useLists() {
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: LISTS,
    queryFn: fetchLists,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: LISTS });
  const create = useMutation({
    mutationFn: createList,
    onSuccess: (list) => qc.setQueryData<HerbList[]>(LISTS, (old) => [list, ...(old ?? [])]),
  });
  const update = useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; herbSlugs?: string[] }) =>
      updateList(id, body),
    onSuccess: (list) =>
      qc.setQueryData<HerbList[]>(LISTS, (old) => (old ?? []).map((l) => (l.id === list.id ? list : l))),
  });
  const remove = useMutation({
    mutationFn: deleteList,
    onSuccess: () => void refresh(),
  });
  return { lists: query.data ?? [], isLoading: query.isLoading, create, update, remove };
}
