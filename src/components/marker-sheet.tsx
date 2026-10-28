"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, Camera, CheckCircle2, CircleSlash, History, Navigation, Pencil, Trash2, X } from "lucide-react";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { HerbThumb } from "@/components/herb-card";
import { HerbFacts } from "@/components/herb-facts";
import { useConfirmMarker, useMarkerDetail, useReportGone, useUploadMarkerPhoto } from "@/hooks";
import { markerPhotoUrl } from "@/lib/api/account";
import type { AuthUser } from "@/lib/api/auth";
import { compressPhoto } from "@/lib/image";
import { isStaleMarker, timeAgo } from "@/lib/herb-utils";
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

/** Lembra neste aparelho quais ervas a pessoa já verificou hoje (a API é quem garante o limite). */
const VERIFIED_KEY = "herbarium-verified";

function today() {
  return new Date().toLocaleDateString("sv-SE");
}

function readVerified(): { day: string; slugs: string[] } {
  try {
    const raw = JSON.parse(localStorage.getItem(VERIFIED_KEY) ?? "null") as { day?: string; slugs?: string[] } | null;
    if (raw?.day === today() && Array.isArray(raw.slugs)) return { day: raw.day, slugs: raw.slugs };
  } catch {
    /* sem armazenamento: só a API limita */
  }
  return { day: today(), slugs: [] };
}

function wasVerifiedToday(slug: string): boolean {
  return readVerified().slugs.includes(slug);
}

function markVerifiedToday(slug: string) {
  try {
    const { day, slugs } = readVerified();
    localStorage.setItem(VERIFIED_KEY, JSON.stringify({ day, slugs: [...new Set([...slugs, slug])] }));
  } catch {
    /* ignora */
  }
}

const EVENT_TEXT = {
  CREATED: "marcou o ponto",
  STATUS: "mudou a quantidade",
  CONFIRMED: "confirmou que ainda tem erva",
  PHOTO: "mandou uma foto",
  GONE: "avisou que a erva acabou",
} as const;

/** Foto do ponto fica escondida até NEXT_PUBLIC_MARKER_PHOTOS=true (e MARKER_PHOTOS_ENABLED=true na API). */
const PHOTOS_ON = process.env.NEXT_PUBLIC_MARKER_PHOTOS === "true";

/** Quem marcou, se está atualizado, foto do local e histórico do ponto. */
function MarkerInfo({ marker, user }: { marker: HerbMarker; user: AuthUser | null }) {
  const confirm = useConfirmMarker();
  const reportGone = useReportGone();
  const [askGone, setAskGone] = useState(false);
  const upload = useUploadMarkerPhoto();
  const [showHistory, setShowHistory] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmedToday, setConfirmedToday] = useState(() => wasVerifiedToday(marker.herbSlug));
  const rememberVerified = (slug: string) => {
    setConfirmedToday(true);
    markVerifiedToday(slug);
  };
  const fileRef = useRef<HTMLInputElement>(null);
  const detail = useMarkerDetail(marker.id, showHistory);
  const stale = isStaleMarker(marker.lastConfirmedAt);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setMessage(null);
    try {
      const { mime, data } = await compressPhoto(file);
      await upload.mutateAsync({ id: marker.id, mime, data });
      setMessage("Foto enviada.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Não foi possível enviar a foto.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="marker-info">
      {PHOTOS_ON && marker.hasPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="marker-photo"
          src={markerPhotoUrl(marker.id, marker.lastConfirmedAt)}
          alt={`Foto do local onde há ${marker.herb.name}`}
          loading="lazy"
        />
      ) : null}

      <p className="sheet-meta">
        {marker.createdByName ? `Marcado por ${marker.createdByName} ${timeAgo(marker.createdAt)}. ` : `Marcado ${timeAgo(marker.createdAt)}. `}
        Confirmado {timeAgo(marker.lastConfirmedAt)}.
        {stale ? <span className="stale-badge">Pode estar desatualizado</span> : null}
      </p>

      {user ? (
        <div className="marker-info-actions">
          <button
            type="button"
            className="btn btn-yes"
            disabled={confirm.isPending || confirmedToday}
            onClick={() => {
              setMessage(null);
              confirm.mutate(marker.id, {
                onSuccess: () => {
                  rememberVerified(marker.herbSlug);
                  setMessage("Confirmado. Obrigado!");
                },
                onError: (e) => {
                  if (e.message.includes("já verificou")) rememberVerified(marker.herbSlug);
                  setMessage(e.message);
                },
              });
            }}
          >
            <CheckCircle2 size={18} aria-hidden />
            {confirmedToday ? "Verificada hoje" : "Ainda tem aqui"}
          </button>
          <button
            type="button"
            className="btn btn-no"
            disabled={reportGone.isPending || confirmedToday || !!marker.goneAt}
            onClick={() => setAskGone(true)}
          >
            <CircleSlash size={18} aria-hidden />
            Não tem mais
          </button>
          {PHOTOS_ON ? (
            <>
              <button type="button" className="btn" disabled={upload.isPending} onClick={() => fileRef.current?.click()}>
                <Camera size={16} aria-hidden />
                {marker.hasPhoto ? "Trocar foto" : "Adicionar foto"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={(e) => void onFile(e.target.files?.[0])}
              />
            </>
          ) : null}
        </div>
      ) : null}
      {message ? <p className="sheet-meta" role="status">{message}</p> : null}
      {marker.goneAt ? (
        <p className="sheet-meta" role="status">
          <span className="stale-badge">Esgotado</span> Se ainda tiver erva aqui, toque em &quot;Ainda tem aqui&quot;
          para reabrir o ponto.
        </p>
      ) : null}

      <AlertDialog open={askGone} onOpenChange={setAskGone}>
        <AlertDialogContent
          title="A erva acabou mesmo?"
          description={`Você vai avisar que não há mais ${marker.herb.name} neste ponto. Quando duas pessoas avisarem, ele sai do mapa. Quem marcou o ponto tira na hora.`}
          confirmLabel="Sim, acabou"
          danger
          onCancel={() => setAskGone(false)}
          onConfirm={() => {
            setAskGone(false);
            setMessage(null);
            reportGone.mutate(marker.id, {
              onSuccess: (r) => {
                rememberVerified(marker.herbSlug);
                setMessage(
                  r.hidden
                    ? "Ponto marcado como esgotado e retirado do mapa."
                    : `Aviso registrado (${r.reports} de ${r.needed}). Falta mais uma pessoa confirmar para o ponto sair do mapa.`,
                );
              },
              onError: (e) => {
                if (e.message.includes("já verificou")) rememberVerified(marker.herbSlug);
                setMessage(e.message);
              },
            });
          }}
        />
      </AlertDialog>

      <button type="button" className="history-toggle" aria-expanded={showHistory} onClick={() => setShowHistory((v) => !v)}>
        <History size={15} aria-hidden />
        {showHistory ? "Esconder histórico" : "Ver histórico"}
      </button>
      {showHistory ? (
        detail.isLoading ? (
          <p className="sheet-meta">Carregando…</p>
        ) : detail.data && detail.data.events.length > 0 ? (
          <ul className="history-list">
            {detail.data.events.map((e) => (
              <li key={e.id}>
                <strong>{e.userName}</strong> {EVENT_TEXT[e.kind]}
                {e.status ? ` (${e.status === "muita" ? "muita" : "pouca"} erva)` : ""}
                <small>{timeAgo(e.createdAt)}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="sheet-meta">Ainda não há registros neste ponto.</p>
        )
      ) : null}
    </div>
  );
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

      <MarkerInfo key={marker.id} marker={marker} user={user} />

      <HerbFacts herb={herb} compact />

      {marker.addressLabel ? <p className="sheet-meta">📍 {marker.addressLabel}</p> : null}
      {marker.notes ? <p className="sheet-meta">{marker.notes}</p> : null}
      {herb.hasRisk ? (
        <p className="sheet-meta" style={{ color: "var(--danger)", fontWeight: 600 }}>
          Cuidado: esta erva pede atenção no uso. Leia o aviso na página dela no guia.
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
