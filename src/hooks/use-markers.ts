"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMarker,
  deleteMarker,
  fetchMarkers,
  updateMarker,
} from "@/lib/api/client";
import type { CreateMarkerInput, HerbMarker, UpdateMarkerInput } from "@/types/herb";

const KEY = ["markers"] as const;

export function useMarkers() {
  return useQuery({
    queryKey: KEY,
    queryFn: ({ signal }) => fetchMarkers(signal),
    staleTime: 15_000,
  });
}

export function useCreateMarker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMarkerInput) => createMarker(payload),
    onSuccess: (created) => {
      qc.setQueryData<HerbMarker[]>(KEY, (old) => [created, ...(old ?? [])]);
    },
  });
}

export function useUpdateMarker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateMarkerInput }) =>
      updateMarker(id, body),
    onSuccess: (updated) => {
      qc.setQueryData<HerbMarker[]>(KEY, (old) =>
        (old ?? []).map((m) => (m.id === updated.id ? updated : m)),
      );
    },
  });
}

export function useDeleteMarker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMarker(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const snapshot = qc.getQueryData<HerbMarker[]>(KEY);
      qc.setQueryData<HerbMarker[]>(KEY, (old) => (old ?? []).filter((m) => m.id !== id));
      return { snapshot };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(KEY, ctx.snapshot);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: KEY });
    },
  });
}
