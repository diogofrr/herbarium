"use client";

import { useState } from "react";
import { X, LogIn, UserPlus, Leaf } from "lucide-react";
import { useAuth } from "@/context/auth-context";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Mode = "login" | "register";

export function AuthModal({ open, onClose }: Props) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  function reset() {
    setName("");
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
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true">
      <div className="auth-modal">
        <button
          type="button"
          className="auth-close"
          aria-label="fechar"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <div className="auth-header">
          <Leaf size={24} />
          <h2>{mode === "login" ? "Entrar no Herbarium" : "Criar conta"}</h2>
          <p>
            {mode === "login"
              ? "Faça login para adicionar ou editar marcadores."
              : "Crie uma conta para contribuir com o mapa."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <label className="auth-field">
              <span>Nome</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
                autoComplete="name"
              />
            </label>
          )}

          <label className="auth-field">
            <span>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              required
              autoComplete="email"
            />
          </label>

          <label className="auth-field">
            <span>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              "Aguarde…"
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
      </div>
    </div>
  );
}
