"use client";

import { memo, useState } from "react";
import { Loader2, LogIn, UserPlus, Leaf, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useTaxonomy } from "@/hooks/use-catalog";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type Mode = "login" | "register";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AuthModal = memo(function AuthModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const { data: taxonomy } = useTaxonomy();
  const [name, setName] = useState("");
  const [orixa, setOrixa] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setName("");
    setOrixa("");
    setEmail("");
    setPassword("");
    setError(null);
  }

  function switchMode(next: Mode) {
    setMode(next);
    reset();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!EMAIL_RE.test(email)) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (password.length < 8) {
      setError("Senha deve ter ao menos 8 caracteres.");
      return;
    }
    if (mode === "register") {
      if (!/^[\p{L}][\p{L}'-]+$/u.test(name.trim())) {
        setError("Informe só o seu primeiro nome.");
        return;
      }
      if (!orixa) {
        setError("Escolha o seu santo de cabeça.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name.trim(), orixa, email, password);
      }
      reset();
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !loading) onClose();
      }}
    >
      <DialogContent
        title={mode === "login" ? "Entrar no Ewé" : "Criar conta"}
        description={
          mode === "login"
            ? "Entre para marcar ervas no mapa, favoritar e montar suas listas."
            : "Crie sua conta para marcar onde há ervas e guardar suas favoritas."
        }
        className="auth-dialog"
      >
        <DialogClose asChild>
          <button
            type="button"
            className="modal-close auth-close-btn"
            aria-label="fechar"
            disabled={loading}
          >
            <X size={18} />
          </button>
        </DialogClose>

        <div className="auth-header">
          <Leaf size={24} />
          <h2 className="modal-title">
            {mode === "login" ? "Entrar no Ewé" : "Criar conta"}
          </h2>
          <p>
            {mode === "login"
              ? "Entre para marcar ervas no mapa, favoritar e montar suas listas."
              : "Crie sua conta para marcar onde há ervas e guardar suas favoritas."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {mode === "register" && (
            <>
              <label className="auth-field">
                <span>Primeiro nome</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Diogo"
                  maxLength={30}
                  autoFocus
                  autoComplete="given-name"
                  disabled={loading}
                />
              </label>
              <label className="auth-field">
                <span>Santo de cabeça</span>
                <select value={orixa} onChange={(e) => setOrixa(e.target.value)} disabled={loading}>
                  <option value="">Escolha o orixá</option>
                  {taxonomy?.orixas.map((o) => (
                    <option key={o.slug} value={o.slug}>
                      {o.name}
                    </option>
                  ))}
                </select>
                {name.trim() && orixa ? (
                  <small className="fact-note">
                    Você aparecerá como {name.trim()} de {taxonomy?.orixas.find((o) => o.slug === orixa)?.name}.
                  </small>
                ) : null}
              </label>
            </>
          )}

          <label className="auth-field">
            <span>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              autoFocus={mode === "login"}
              autoComplete="email"
              inputMode="email"
              disabled={loading}
            />
          </label>

          <label className="auth-field">
            <span>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              disabled={loading}
            />
          </label>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="auth-spinner" /> Aguarde…
              </>
            ) : mode === "login" ? (
              <>
                <LogIn size={16} /> Entrar
              </>
            ) : (
              <>
                <UserPlus size={16} /> Criar conta
              </>
            )}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "login" ? (
            <p>
              Não tem conta?{" "}
              <button type="button" onClick={() => switchMode("register")}>
                Cadastre-se
              </button>
            </p>
          ) : (
            <p>
              Já tem conta?{" "}
              <button type="button" onClick={() => switchMode("login")}>
                Entrar
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
