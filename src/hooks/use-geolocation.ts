"use client";

import { useCallback } from "react";
import type { Dispatch } from "react";
import { isWithinUberlandia } from "@/lib/uberlandia";
import type { MapAction } from "./use-map-state";

export function useGeolocation(dispatch: Dispatch<MapAction>) {
  return useCallback(() => {
    if (!navigator.geolocation) {
      dispatch({
        type: "SET_ERROR",
        payload: "Geolocalização não suportada neste navegador.",
      });
      return;
    }
    dispatch({ type: "SET_LOCATING", payload: true });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pt = { lat: coords.latitude, lng: coords.longitude };
        dispatch({ type: "SET_LOCATING", payload: false });
        if (!isWithinUberlandia(pt.lat, pt.lng)) {
          dispatch({
            type: "SET_ERROR",
            payload: "Sua localização atual está fora de Uberlândia - MG.",
          });
          return;
        }
        dispatch({ type: "SET_USER_LOCATION", payload: pt });
        dispatch({
          type: "SET_FOCUS",
          payload: { ...pt, zoom: 16, nonce: Date.now() },
        });
      },
      () => {
        dispatch({
          type: "SET_ERROR",
          payload: "Não foi possível obter sua localização.",
        });
        dispatch({ type: "SET_LOCATING", payload: false });
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, [dispatch]);
}
