"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Camera, Loader2, LogIn, ScanSearch } from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import { TemperatureChip } from "@/components/chips";
import { useAuth } from "@/context/auth-context";
import type { HerbCard } from "@/types/herb";

type Match = {
  score: number;
  scientificName: string;
  commonNames: string[];
  family: string | null;
  guide: { level: "exact" | "genus"; herb: HerbCard } | null;
};

const ORGANS = [
  { value: "auto", label: "Automático" },
  { value: "leaf", label: "Folha" },
  { value: "flower", label: "Flor" },
  { value: "fruit", label: "Fruto" },
  { value: "bark", label: "Casca" },
  { value: "habit", label: "Planta toda" },
] as const;

/** Reduz a foto no navegador (JPEG, lado maior 1280 px): envia menos dados e respeita o limite do servidor. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Foto inválida."))), "image/jpeg", 0.85),
  );
}

export function PlantIdentifier() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [organ, setOrgan] = useState<(typeof ORGANS)[number]["value"]>("auto");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function run() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setMatches(null);
    try {
      const blob = await shrink(file);
      const body = new FormData();
      body.append("image", blob, "planta.jpg");
      body.append("organ", organ);
      const res = await fetch("/api/identify", { method: "POST", body });
      const payload = (await res.json().catch(() => ({}))) as {
        data?: { matches: Match[]; remaining: number | null };
        error?: string;
      };
      if (!res.ok || !payload.data) throw new Error(payload.error ?? "Não foi possível identificar.");
      setMatches(payload.data.matches);
      setRemaining(payload.data.remaining);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível identificar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="identify">
      <div className="identify-pick">
        <input
          ref={input}
          type="file"
          accept="image/*"
          capture="environment"
          className="visually-hidden"
          aria-label="Escolher foto da planta"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setMatches(null);
            setError(null);
          }}
        />
        <button type="button" className="identify-drop" onClick={() => input.current?.click()}>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Foto escolhida para identificação" />
          ) : (
            <span>
              <Camera size={34} aria-hidden />
              <strong>Tirar ou escolher uma foto</strong>
              <small>Folha, flor ou fruto bem enquadrados funcionam melhor</small>
            </span>
          )}
        </button>

        <div className="chip-row" role="group" aria-label="Parte da planta na foto">
          {ORGANS.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`chip${organ === o.value ? " is-on" : ""}`}
              aria-pressed={organ === o.value}
              onClick={() => setOrgan(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>

        {!isLoading && !isAuthenticated ? (
          <button type="button" className="btn btn-primary" onClick={() => setAuthOpen(true)}>
            <LogIn size={18} aria-hidden /> Entrar para identificar
          </button>
        ) : (
          <button type="button" className="btn btn-primary" disabled={!file || busy} onClick={() => void run()}>
            {busy ? <Loader2 size={18} className="auth-spinner" aria-hidden /> : <ScanSearch size={18} aria-hidden />}
            {busy ? "Identificando…" : "Identificar planta"}
          </button>
        )}
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      {matches ? (
        <section className="identify-results" aria-label="Resultado da identificação" aria-live="polite">
          <h2>Possíveis plantas</h2>
          {matches.length === 0 ? (
            <p className="empty">Nada reconhecido nesta foto. Tente outra, mais de perto e com boa luz.</p>
          ) : (
            <ol className="match-list">
              {matches.map((m) => (
                <li key={m.scientificName} className="match">
                  <div className="match-head">
                    <div>
                      <strong className="sci">{m.scientificName}</strong>
                      {m.commonNames.length > 0 ? <p className="fact-note">{m.commonNames.join(", ")}</p> : null}
                    </div>
                    <span className="score" title="Confiança do Pl@ntNet">
                      {Math.round(m.score * 100)}%
                    </span>
                  </div>
                  {m.guide ? (
                    <Link href={`/ervas/${m.guide.herb.slug}`} className="match-herb">
                      <span>
                        <small>{m.guide.level === "exact" ? "Está no guia" : "Mesmo gênero de uma erva do guia"}</small>
                        <strong>{m.guide.herb.name}</strong>
                      </span>
                      <TemperatureChip temperature={m.guide.herb.temperature} />
                    </Link>
                  ) : (
                    <p className="fact-note">Não consta no guia de ervas.</p>
                  )}
                </li>
              ))}
            </ol>
          )}
          <p className="disclaimer">
            A identificação é automática e serve de apoio: confirme sempre com alguém de confiança antes de usar
            qualquer planta, principalmente se for ingerir. Resultados por{" "}
            <a href="https://plantnet.org" target="_blank" rel="noopener noreferrer">
              Pl@ntNet
            </a>
            .{remaining !== null ? ` Restam ${remaining} identificações hoje.` : ""}
          </p>
        </section>
      ) : null}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
