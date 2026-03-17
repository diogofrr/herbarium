"use client";

import { createContext, useContext, useMemo, useCallback, type ReactNode } from "react";
import { useMapState, useGeolocation } from "@/hooks";
import { useDeleteHerb } from "@/hooks/use-herbs";
import type { MapState, MapAction, FocusPoint } from "@/hooks/use-map-state";
import type { HerbMarker } from "@/types/herb";
import type { Dispatch } from "react";

type HerbMapContextValue = {
  state: MapState;
  dispatch: Dispatch<MapAction>;
  onMapClick: (lat: number, lng: number) => void;
  onOutOfBounds: () => void;
  focusOn: (lat: number, lng: number, zoom?: number) => void;
  locateUser: () => void;
  openEditModal: (marker: HerbMarker) => void;
  handleModalSuccess: () => void;
  handleDeleteConfirm: () => void;
};

const HerbMapContext = createContext<HerbMapContextValue | null>(null);

export function useHerbMapContext() {
  const ctx = useContext(HerbMapContext);
  if (!ctx) throw new Error("useHerbMapContext must be used inside HerbMapProvider");
  return ctx;
}

export function HerbMapProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useMapState();
  const locateUser = useGeolocation(dispatch);
  const deleteMutation = useDeleteHerb();

  const focusOn = useCallback(
    (lat: number, lng: number, zoom = 16) => {
      dispatch({ type: "SET_FOCUS", payload: { lat, lng, zoom, nonce: Date.now() } });
    },
    [dispatch],
  );

  const onMapClick = useCallback(
    (lat: number, lng: number) => {
      dispatch({ type: "CLEAR_ERROR" });
      dispatch({ type: "SET_PENDING_POINT", payload: { lat, lng } });
      dispatch({ type: "CLOSE_MODAL" });
    },
    [dispatch],
  );

  const onOutOfBounds = useCallback(() => {
    dispatch({ type: "SET_ERROR", payload: "A marcação precisa estar dentro de Uberlândia - MG." });
  }, [dispatch]);

  const openEditModal = useCallback(
    (marker: HerbMarker) => {
      dispatch({ type: "OPEN_EDIT_MODAL", payload: marker });
    },
    [dispatch],
  );

  const handleModalSuccess = useCallback(() => {
    dispatch({ type: "MODAL_SUCCESS" });
  }, [dispatch]);

  const handleDeleteConfirm = useCallback(() => {
    const marker = state.confirmDelete;
    dispatch({ type: "SET_CONFIRM_DELETE", payload: null });
    if (!marker) return;
    deleteMutation.mutate(marker.id, {
      onError: (err) => {
        dispatch({
          type: "SET_ERROR",
          payload: err instanceof Error ? err.message : "Não foi possível remover.",
        });
      },
    });
  }, [state.confirmDelete, dispatch, deleteMutation]);

  const value = useMemo<HerbMapContextValue>(
    () => ({
      state,
      dispatch,
      onMapClick,
      onOutOfBounds,
      focusOn,
      locateUser,
      openEditModal,
      handleModalSuccess,
      handleDeleteConfirm,
    }),
    [
      state,
      dispatch,
      onMapClick,
      onOutOfBounds,
      focusOn,
      locateUser,
      openEditModal,
      handleModalSuccess,
      handleDeleteConfirm,
    ],
  );

  return <HerbMapContext.Provider value={value}>{children}</HerbMapContext.Provider>;
}
