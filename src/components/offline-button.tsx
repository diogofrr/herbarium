"use client";

import { useEffect, useState } from "react";
import { CloudDownload, Check } from "lucide-react";
import { useHerbCatalog } from "@/hooks";
import { thumbUrl } from "@/lib/herb-utils";

const KEY = "herbarium-offline-saved";

/**
 * Baixa o guia para uso sem internet: lista, páginas de cada erva e miniaturas.
 * Quem guarda tudo é o service worker (só existe na versão publicada).
 */
export function OfflineButton() {
  const catalog = useHerbCatalog();
  const [supported, setSupported] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported("serviceWorker" in navigator && "caches" in window);
    try {
      setSavedAt(localStorage.getItem(KEY));
    } catch {
      /* sem armazenamento: segue sem lembrar */
    }
  }, []);

  if (!supported) return null;

  const run = async () => {
    const herbs = catalog.data ?? [];
    if (herbs.length === 0) return;
    const urls = [
      "/ervas",
      "/preparo",
      "/identificar",
      ...herbs.map((h) => `/ervas/${h.slug}`),
      ...herbs.filter((h) => h.cover).map((h) => thumbUrl(h.cover!.file)),
    ];
    setProgress(0);
    let done = 0;
    for (let i = 0; i < urls.length; i += 6) {
      await Promise.all(
        urls.slice(i, i + 6).map((u) =>
          fetch(u, { credentials: "same-origin" })
            .then((r) => (r.ok ? r.arrayBuffer() : undefined))
            .catch(() => undefined),
        ),
      );
      done = Math.min(urls.length, i + 6);
      setProgress(Math.round((done / urls.length) * 100));
    }
    const stamp = new Date().toLocaleDateString("pt-BR");
    try {
      localStorage.setItem(KEY, stamp);
    } catch {
      /* ignora */
    }
    setSavedAt(stamp);
    setProgress(null);
  };

  return (
    <button type="button" className="btn" disabled={progress !== null || !catalog.data} onClick={() => void run()}>
      {savedAt && progress === null ? <Check size={16} aria-hidden /> : <CloudDownload size={16} aria-hidden />}
      {progress !== null
        ? `Baixando… ${progress}%`
        : savedAt
          ? `Guia salvo em ${savedAt}. Atualizar`
          : "Salvar guia para usar offline"}
    </button>
  );
}
