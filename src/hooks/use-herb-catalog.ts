"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchHerbCatalog } from "@/lib/api/herb-catalog";
import type { HerbCatalogEntry } from "@/types/herb";

export function useHerbCatalog() {
  const query = useQuery({
    queryKey: ["herb-catalog"],
    queryFn: ({ signal }) => fetchHerbCatalog(signal),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 2,
  });

  const helpers = useMemo(() => {
    const list = query.data ?? [];
    const byKey = new Map<string, HerbCatalogEntry>(list.map((h) => [h.key, h]));
    return {
      list,
      byKey: (key: string) => byKey.get(key),
      has: (key: string) => byKey.has(key),
      keys: list.map((h) => h.key),
    };
  }, [query.data]);

  return { ...query, ...helpers };
}
