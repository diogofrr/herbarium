"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  confirmMarker,
  fetchMarkerDetail,
  reportMarkerGone,
  uploadMarkerPhoto,
} from "@/lib/api/account";
import {
  createMarker,
  deleteMarker,
  fetchMarkers,
  updateMarker,
} from "@/lib/api/client";
import type { CreateMarkerInput, HerbMarker, UpdateMarkerInput } from "@/types/herb";

/** Prefixo comum: as listas com e sem "esgotados" são atualizadas juntas. */
const KEY = ["markers"] as const;

/** `includeGone` mostra também os pontos dados como esgotados. */
export function useMarkers(includeGone = false) {
  return useQuery({
    queryKey: [...KEY, includeGone],
    queryFn: ({ signal }) => fetchMarkers(includeGone, signal),
    staleTime: 15_000,
  });
}

export function useCreateMarker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMarkerInput) => createMarker(payload),
    onSuccess: (created) => {
      qc.setQueriesData<HerbMarker[]>({ queryKey: KEY }, (old) => (old ? [created, ...old] : old));
    },
  });
}

function replaceMarker(updated: HerbMarker) {
  return (old: HerbMarker[] | undefined) =>
    old?.map((m) => (m.id === updated.id ? updated : m));
}

export function useUpdateMarker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateMarkerInput }) =>
      updateMarker(id, body),
    onSuccess: (updated) => {
      qc.setQueriesData<HerbMarker[]>({ queryKey: KEY }, replaceMarker(updated));
    },
  });
}

export function useDeleteMarker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMarker(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const snapshots = qc.getQueriesData<HerbMarker[]>({ queryKey: KEY });
      qc.setQueriesData<HerbMarker[]>({ queryKey: KEY }, (old) => old?.filter((m) => m.id !== id));
      return { snapshots };
    },
    onError: (_err, _id, ctx) => {
      for (const [key, data] of ctx?.snapshots ?? []) qc.setQueryData(key, data);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

/** Histórico do ponto (carrega só quando o painel de histórico é aberto). */
export function useMarkerDetail(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ["marker-detail", id],
    queryFn: () => fetchMarkerDetail(id),
    enabled,
    staleTime: 10_000,
  });
}

/** "Ainda tem erva aqui": renova a confirmação do ponto (e reabre um ponto esgotado). */
export function useConfirmMarker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => confirmMarker(id),
    onSuccess: (updated) => {
      qc.setQueriesData<HerbMarker[]>({ queryKey: KEY }, replaceMarker(updated));
      void qc.invalidateQueries({ queryKey: KEY });
      void qc.invalidateQueries({ queryKey: ["marker-detail", updated.id] });
    },
  });
}

/** "Não tem mais": com avisos suficientes o ponto sai do mapa. */
export function useReportGone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportMarkerGone(id),
    onSuccess: (_result, id) => {
      void qc.invalidateQueries({ queryKey: KEY });
      void qc.invalidateQueries({ queryKey: ["marker-detail", id] });
    },
  });
}

export function useUploadMarkerPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, mime, data }: { id: string; mime: string; data: string }) =>
      uploadMarkerPhoto(id, mime, data),
    onSuccess: (_r, { id }) => {
      qc.setQueriesData<HerbMarker[]>({ queryKey: KEY }, (old) =>
        old?.map((m) =>
          m.id === id ? { ...m, hasPhoto: true, lastConfirmedAt: new Date().toISOString() } : m,
        ),
      );
      void qc.invalidateQueries({ queryKey: ["marker-detail", id] });
    },
  });
}
