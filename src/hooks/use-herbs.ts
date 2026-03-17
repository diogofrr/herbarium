"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchHerbs,
  createHerb,
  updateHerb,
  deleteHerb,
  type HerbsFilter,
  type HerbPayload,
} from "@/lib/api/herbs";
import type { HerbMarker } from "@/types/herb";

export const herbsQueryKey = (filter: HerbsFilter) => ["herbs", filter] as const;

export function useHerbs(filter: HerbsFilter) {
  return useQuery({
    queryKey: herbsQueryKey(filter),
    queryFn: ({ signal }) => fetchHerbs(filter, signal),
  });
}

export function useCreateHerb() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: HerbPayload) => createHerb(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["herbs"] });
    },
  });
}

export function useUpdateHerb() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<HerbPayload> }) =>
      updateHerb(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["herbs"] });
    },
  });
}

export function useDeleteHerb() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteHerb(id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ["herbs"] });
      const snapshot = qc.getQueriesData<HerbMarker[]>({ queryKey: ["herbs"] });
      qc.setQueriesData<HerbMarker[]>(
        { queryKey: ["herbs"] },
        (old) => old?.filter((m) => m.id !== id) ?? [],
      );
      return { snapshot };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.snapshot) {
        for (const [key, data] of ctx.snapshot) {
          qc.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["herbs"] });
    },
  });
}
