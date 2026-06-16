"use client";

import { memo, useEffect, useMemo } from "react";
import L from "leaflet";
import { Pencil, Trash2 } from "lucide-react";
import {
  MapContainer,
  Marker,
  Popup,
  Rectangle,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import {
  UBERLANDIA_BOUNDS,
  UBERLANDIA_CENTER,
  isWithinUberlandia,
} from "@/lib/uberlandia";
import type { HerbMarker } from "@/types/herb";

type FocusPoint = {
  lat: number;
  lng: number;
  zoom?: number;
  nonce: number;
};

type Props = {
  markers: HerbMarker[];
  pendingPoint: { lat: number; lng: number } | null;
  userLocation: { lat: number; lng: number } | null;
  focusPoint: FocusPoint | null;
  onMapClick: (lat: number, lng: number) => void;
  onOutOfBounds: () => void;
  onEdit: (marker: HerbMarker) => void;
  onDelete: (marker: HerbMarker) => void;
};

const LEAFLET_BOUNDS: [[number, number], [number, number]] = [
  [UBERLANDIA_BOUNDS.south, UBERLANDIA_BOUNDS.west],
  [UBERLANDIA_BOUNDS.north, UBERLANDIA_BOUNDS.east],
];

function statusColor(status: HerbMarker["status"]): string {
  return status === "muita" ? "#19b66f" : "#f5b301";
}

function riskColor(hasRisk: boolean, riskTags: string[]): string {
  if (!hasRisk) return "#2b6240";
  const t = riskTags.map((r) => r.toLowerCase()).join(" ");
  if (t.includes("letal") || t.includes("tóxic") || t.includes("toxic")) {
    return "#9f2f23";
  }
  return "#a06020";
}

function markerIcon(marker: HerbMarker) {
  const fill = riskColor(marker.catalog.hasRisk, marker.catalog.riskTags);
  const ring = statusColor(marker.status);
  const initial = marker.catalog.name.charAt(0).toUpperCase();
  return L.divIcon({
    className: "",
    html: `<span style="display:grid;place-items:center;width:32px;height:32px;border-radius:999px;background:${fill};border:3px solid ${ring};color:#fff;font-weight:700;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.35);transition:transform .15s">${initial}</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

const pendingIcon = L.divIcon({
  className: "",
  html: '<span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:999px;background:#2279d5;color:#fff;border:2px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.35);font-size:21px;font-weight:700;line-height:1;animation:pulse 1.2s ease infinite">+</span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
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
}: {
  onMapClick: (lat: number, lng: number) => void;
  onOutOfBounds: () => void;
}) {
  useMapEvents({
    click(e) {
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
    map.flyTo([focusPoint.lat, focusPoint.lng], focusPoint.zoom ?? 16, {
      duration: 0.8,
    });
  }, [focusPoint, map]);
  return null;
}

const HerbMarkerPin = memo(function HerbMarkerPin({
  marker,
  onEdit,
  onDelete,
}: {
  marker: HerbMarker;
  onEdit: (m: HerbMarker) => void;
  onDelete: (m: HerbMarker) => void;
}) {
  const icon = useMemo(
    () => markerIcon(marker),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [marker.id, marker.status, marker.catalog?.key, marker.catalog?.hasRisk],
  );

  const cat = marker.catalog;
  const temperature = cat.temperature.join(" / ") || null;

  return (
    <Marker position={[marker.lat, marker.lng]} icon={icon}>
      <Popup>
        <div className="map-popup">
          <header>
            <h3>{cat.name}</h3>
            {cat.type || temperature ? (
              <p>
                {[cat.type, temperature].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </header>

          <div className="popup-status-row">
            <span className={`popup-status-badge ${marker.status}`}>
              {marker.status === "muita" ? "Muita erva" : "Pouca erva"}
            </span>
            {cat.hasRisk ? (
              <span
                className="popup-risk"
                style={{ color: riskColor(cat.hasRisk, cat.riskTags) }}
              >
                ⚠ {cat.riskTags.join(", ") || "Risco"}
              </span>
            ) : null}
          </div>

          {cat.hasRisk && cat.riskDesc ? (
            <p className="popup-warning popup-warning-alto">⚠ {cat.riskDesc}</p>
          ) : null}

          {marker.addressLabel ? (
            <p className="popup-address">📍 {marker.addressLabel}</p>
          ) : null}

          {marker.notes ? <p className="popup-notes">{marker.notes}</p> : null}

          {cat.orixas.length > 0 ? (
            <>
              <p className="popup-section-label">Orixás</p>
              <div className="popup-tags">
                {cat.orixas.slice(0, 5).map((o) => (
                  <span key={o}>{o}</span>
                ))}
              </div>
            </>
          ) : null}

          {cat.usage ? (
            <>
              <p className="popup-section-label">Uso</p>
              <p className="popup-notes">{cat.usage}</p>
            </>
          ) : null}

          <div className="popup-actions">
            <button type="button" onClick={() => onEdit(marker)}>
              <Pencil size={14} />
              Editar
            </button>
            <button
              type="button"
              className="danger"
              onClick={() => onDelete(marker)}
            >
              <Trash2 size={14} />
              Remover
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
});

export default memo(function LeafletMap({
  markers,
  pendingPoint,
  userLocation,
  focusPoint,
  onMapClick,
  onOutOfBounds,
  onEdit,
  onDelete,
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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Rectangle
        bounds={LEAFLET_BOUNDS}
        pathOptions={{
          color: "#0a7b64",
          weight: 2,
          fillColor: "#2bc29a",
          fillOpacity: 0.04,
        }}
      />

      <ClickHandler onMapClick={onMapClick} onOutOfBounds={onOutOfBounds} />
      <FlyToFocus focusPoint={focusPoint} />

      {markers.map((marker) => (
        <HerbMarkerPin
          key={marker.id}
          marker={marker}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {pendingPoint ? (
        <Marker position={[pendingPoint.lat, pendingPoint.lng]} icon={pendingIcon} />
      ) : null}
      {userLocation ? (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />
      ) : null}
    </MapContainer>
  );
});
