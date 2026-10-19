"use client";

import { useCallback, useState } from "react";
import { isWithinUberlandia } from "@/lib/uberlandia";

export type UserLocation = { lat: number; lng: number };

/** Localiza o usuário; rejeita coordenadas fora de Uberlândia. */
export function useGeolocation(onError: (message: string) => void) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [locating, setLocating] = useState(false);

  const locate = useCallback(
    (onFound?: (point: UserLocation) => void) => {
      if (!navigator.geolocation) {
        onError("Geolocalização não suportada neste navegador.");
        return;
      }
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setLocating(false);
          const point = { lat: coords.latitude, lng: coords.longitude };
          if (!isWithinUberlandia(point.lat, point.lng)) {
            onError("Sua localização atual está fora de Uberlândia - MG.");
            return;
          }
          setLocation(point);
          onFound?.(point);
        },
        () => {
          setLocating(false);
          onError("Não foi possível obter sua localização.");
        },
        { enableHighAccuracy: true, timeout: 10_000 },
      );
    },
    [onError],
  );

  return { location, locating, locate };
}
