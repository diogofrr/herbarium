"use client";

import Link from "next/link";
import { BookOpen, Navigation, Pencil, Trash2, X } from "lucide-react";
import { HerbThumb } from "@/components/herb-card";
import { HerbFacts } from "@/components/herb-facts";
import type { AuthUser } from "@/lib/api/auth";
import type { HerbMarker, MarkerStatus } from "@/types/herb";

type Props = {
  marker: HerbMarker;
  user: AuthUser | null;
  onClose: () => void;
  onEdit: (marker: HerbMarker) => void;
  onDelete: (marker: HerbMarker) => void;
  onChangeStatus: (marker: HerbMarker, status: MarkerStatus) => void;
  busy?: boolean;
};

export function canManageMarker(user: AuthUser | null, marker: HerbMarker): boolean {
  if (!user) return false;
  if (user.role === "ADMIN" || user.role === "HERBMASTER") return true;
  return marker.createdById !== null && marker.createdById === user.id;
}

/** Painel da marcação selecionada: erva, orixás, povos, temperatura e função. */
export function MarkerSheet({ marker, user, onClose, onEdit, onDelete, onChangeStatus, busy = false }: Props) {
  const { herb } = marker;
  const manage = canManageMarker(user, marker);

  return (
    <aside className="sheet" aria-label={`Marcação de ${herb.name}`}>
      <div className="sheet-handle" aria-hidden />
      <div className="sheet-head">
        <div className="sheet-photo">
          <HerbThumb herb={herb} size={160} />
        </div>
        <div>
          <h2>{herb.name}</h2>
          {herb.scientificName ? <p className="sci">{herb.scientificName}</p> : null}
          {user ? null : (
            <p className="sheet-meta" style={{ margin: "4px 0 0" }}>
              {marker.status === "muita" ? "Muita erva neste ponto" : "Pouca erva neste ponto"}
            </p>
          )}
        </div>
        <button type="button" className="modal-close" aria-label="Fechar painel" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {user ? (
        <div className="qty" role="group" aria-label="Quantidade de erva neste ponto">
          <span className="qty-label">Quantidade neste ponto</span>
          <div className="segmented">
            {(["muita", "pouca"] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={`qty-opt${marker.status === v ? " is-on" : ""}`}
                aria-pressed={marker.status === v}
                disabled={busy}
                onClick={() => marker.status !== v && onChangeStatus(marker, v)}
              >
                {v === "muita" ? "Muita erva" : "Pouca erva"}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <HerbFacts herb={herb} compact />

      {marker.addressLabel ? <p className="sheet-meta">📍 {marker.addressLabel}</p> : null}
      {marker.notes ? <p className="sheet-meta">{marker.notes}</p> : null}
      {herb.hasRisk ? (
        <p className="sheet-meta" style={{ color: "var(--danger)", fontWeight: 600 }}>
          Atenção: esta erva exige cuidado. Veja a página dela no guia.
        </p>
      ) : null}

      <div className="sheet-actions">
        <Link href={`/ervas/${herb.slug}`} className="btn btn-primary">
          <BookOpen size={16} aria-hidden />
          Ver no guia
        </Link>
        <a
          className="btn"
          href={`https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lng}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Navigation size={16} aria-hidden />
          Como chegar
        </a>
        {manage ? (
          <>
            <button type="button" className="btn" onClick={() => onEdit(marker)}>
              <Pencil size={16} aria-hidden />
              Editar
            </button>
            <button type="button" className="btn btn-danger" onClick={() => onDelete(marker)}>
              <Trash2 size={16} aria-hidden />
              Remover
            </button>
          </>
        ) : null}
      </div>
    </aside>
  );
}
