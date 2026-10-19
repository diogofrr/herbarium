"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchHerbs, fetchTaxonomy } from "@/lib/api/client";

/** Catálogo leve (cards) do guia; cacheado por 10 min no cliente. */
export function useHerbCatalog() {
  return useQuery({
    queryKey: ["herb-catalog"],
    queryFn: ({ signal }) => fetchHerbs(signal),
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  });
}

export function useTaxonomy() {
  return useQuery({
    queryKey: ["taxonomy"],
    queryFn: ({ signal }) => fetchTaxonomy(signal),
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  });
}
