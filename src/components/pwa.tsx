"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** Registra o service worker (só em produção, para não atrapalhar o desenvolvimento). */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  return null;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Botão "Instalar app": usa o prompt nativo (Android/Chrome) ou ensina o caminho no iPhone. */
export function InstallButton({ className = "btn btn-on-dark", label = "Instalar app" }: { className?: string; label?: string }) {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(true); // evita piscar antes de checar
  const [ios, setIos] = useState(false);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInstalled(isStandalone());
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || (!event && !ios)) return null;

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={label}
        onClick={async () => {
          if (event) {
            await event.prompt();
            await event.userChoice;
            setEvent(null);
          } else {
            setHelp(true);
          }
        }}
      >
        <Download size={16} aria-hidden />
        <span className="install-label">{label}</span>
      </button>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent title="Instalar o Herbá" description="Como adicionar o app à tela inicial do iPhone.">
          <div className="modal-header">
            <h2 className="modal-title">Instalar o Herbá</h2>
            <DialogClose asChild>
              <button type="button" className="modal-close" aria-label="Fechar">
                <X size={18} />
              </button>
            </DialogClose>
          </div>
          <ol className="install-steps">
            <li>
              Toque em <Share size={16} aria-hidden style={{ verticalAlign: -3 }} /> <strong>Compartilhar</strong> na barra do Safari.
            </li>
            <li>
              Escolha <strong>Adicionar à Tela de Início</strong>.
            </li>
            <li>
              Confirme em <strong>Adicionar</strong>. O app abre em tela cheia, como qualquer outro.
            </li>
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
}
