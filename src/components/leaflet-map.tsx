"use client";

import { memo, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import {
  MapContainer,
  Marker,
  Rectangle,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { UBERLANDIA_BOUNDS, UBERLANDIA_CENTER, isWithinUberlandia } from "@/lib/uberlandia";
import type { HerbMarker, Temperature } from "@/types/herb";

export type FocusPoint = { lat: number; lng: number; zoom?: number; nonce: number };

type Props = {
  markers: HerbMarker[];
  selectedId: string | null;
  pendingPoint: { lat: number; lng: number } | null;
  userLocation: { lat: number; lng: number } | null;
  focusPoint: FocusPoint | null;
  placing: boolean;
  onSelect: (marker: HerbMarker) => void;
  onMapClick: (lat: number, lng: number) => void;
  onOutOfBounds: () => void;
};

const LEAFLET_BOUNDS: [[number, number], [number, number]] = [
  [UBERLANDIA_BOUNDS.south, UBERLANDIA_BOUNDS.west],
  [UBERLANDIA_BOUNDS.north, UBERLANDIA_BOUNDS.east],
];

export const TEMPERATURE_COLOR: Record<Temperature, string> = {
  quente: "#b93a2a",
  morna: "#c98a12",
  fria: "#20639b",
};

/** Folha estilizada (branca) usada dentro dos pinos e dos agrupamentos. */
const LEAF_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.5 3.5C11 3.2 4.5 8 4.5 15.2c0 1.5.4 2.8 1 3.9C7 15 10 12.2 14.6 11c-3.7 1.6-6.4 4.4-7.8 8.6 1 .6 2.1.9 3.4.9 6.6 0 10.6-5.6 10.3-17z"/></svg>';

function pinIcon(marker: HerbMarker, selected: boolean) {
  const big = marker.status === "muita";
  const size = big ? 46 : 36;
  const color = TEMPERATURE_COLOR[marker.herb.temperature];
  // "muita erva" ganha pino maior e uma folha a mais, "pouca" um pino menor.
  const badge = big ? '<i class="pin-more" aria-hidden="true">+</i>' : "";
  return L.divIcon({
    className: "",
    html: `<span class="herb-pin${selected ? " is-selected" : ""}" style="width:${size}px;height:${size}px;background:${color}"><span class="pin-leaf" style="width:${Math.round(size * 0.52)}px;height:${Math.round(size * 0.52)}px">${LEAF_SVG}</span></span>${badge}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
}

function clusterIcon(cluster: L.MarkerCluster) {
  const n = cluster.getChildCount();
  const size = n < 10 ? 44 : n < 50 ? 50 : 56;
  return L.divIcon({
    className: "",
    html: `<span class="herb-cluster" style="width:${size}px;height:${size}px"><span class="cluster-leaf">${LEAF_SVG}</span><b>${n}</b></span>`,
    iconSize: [size, size],
  });
}

const pendingIcon = L.divIcon({
  className: "",
  html: '<span class="herb-pin" style="width:38px;height:38px;background:#1d2a21;font-size:22px"><span>+</span></span>',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

const userIcon = L.divIcon({
  className: "",
  html: '<span style="display:block;width:18px;height:18px;border-radius:999px;background:#2a87ff;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.45)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function ClickHandler({
  onMapClick,
  onOutOfBounds,
  placing,
}: Pick<Props, "onMapClick" | "onOutOfBounds" | "placing">) {
  useMapEvents({
    click(e) {
      if (!placing) return;
      const { lat, lng } = e.latlng;
      if (!isWithinUberlandia(lat, lng)) {
        onOutOfBounds();
        return;
      }
      onMapClick(lat, lng);
    },
  });
  return null;
}

function FlyToFocus({ focusPoint }: { focusPoint: FocusPoint | null }) {
  const map = useMap();
  useEffect(() => {
    if (!focusPoint) return;
    map.flyTo([focusPoint.lat, focusPoint.lng], focusPoint.zoom ?? 16, { duration: 0.8 });
  }, [focusPoint, map]);
  return null;
}

/** Enquadra os pontos existentes na primeira vez que eles chegam. */
function FitToMarkers({ markers }: { markers: HerbMarker[] }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (done.current || markers.length === 0) return;
    done.current = true;
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [70, 70], maxZoom: 16 });
  }, [markers, map]);
  return null;
}

/** Cursor de "marcar ponto" enquanto o modo de inclusão está ativo. */
function PlacingCursor({ placing }: { placing: boolean }) {
  const map = useMap();
  useEffect(() => {
    map.getContainer().style.cursor = placing ? "crosshair" : "";
  }, [placing, map]);
  return null;
}

/** Agrupa pinos próximos (aproxime para separar) e desenha cada marcação com a folha. */
function ClusterLayer({
  markers,
  selectedId,
  onSelect,
}: {
  markers: HerbMarker[];
  selectedId: string | null;
  onSelect: (m: HerbMarker) => void;
}) {
  const map = useMap();
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const group = L.markerClusterGroup({
      iconCreateFunction: clusterIcon,
      maxClusterRadius: 46,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 18,
    });
    for (const m of markers) {
      const marker = L.marker([m.lat, m.lng], {
        icon: pinIcon(m, m.id === selectedId),
        keyboard: true,
        title: `${m.herb.name} (${m.status === "muita" ? "muita" : "pouca"} erva)`,
      });
      marker.on("click", () => onSelectRef.current(m));
      group.addLayer(marker);
    }
    map.addLayer(group);
    return () => {
      map.removeLayer(group);
    };
  }, [map, markers, selectedId]);

  return null;
}

export default memo(function LeafletMap({
  markers,
  selectedId,
  pendingPoint,
  userLocation,
  focusPoint,
  placing,
  onSelect,
  onMapClick,
  onOutOfBounds,
}: Props) {
  return (
    <MapContainer
      center={[UBERLANDIA_CENTER.lat, UBERLANDIA_CENTER.lng]}
      zoom={12}
      minZoom={10}
      maxBounds={LEAFLET_BOUNDS}
      maxBoundsViscosity={0.85}
      zoomControl={false}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Rectangle
        bounds={LEAFLET_BOUNDS}
        interactive={false}
        pathOptions={{ color: "#2f6b3f", weight: 2, fillColor: "#2f6b3f", fillOpacity: 0.03 }}
      />
      <ClickHandler onMapClick={onMapClick} onOutOfBounds={onOutOfBounds} placing={placing} />
      <PlacingCursor placing={placing} />
      <FlyToFocus focusPoint={focusPoint} />
      <FitToMarkers markers={markers} />

      <ClusterLayer markers={markers} selectedId={selectedId} onSelect={onSelect} />

      {pendingPoint ? (
        <Marker position={[pendingPoint.lat, pendingPoint.lng]} icon={pendingIcon} interactive={false} />
      ) : null}
      {userLocation ? (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} interactive={false} />
      ) : null}
    </MapContainer>
  );
});
