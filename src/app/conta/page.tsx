"use client";

import Link from "next/link";
import { BookmarkCheck, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { InstallButton } from "@/components/pwa";
import { OfflineButton } from "@/components/offline-button";
import { useAuth } from "@/context/auth-context";

export default function ContaPage() {
  const { user, isAuthenticated, isLoading, logout, openLogin } = useAuth();

  if (isLoading) return <div className="container" />;

  if (!isAuthenticated || !user) {
    return (
      <div className="container acct">
        <h1 className="page-title">Minha conta</h1>
        <p className="page-lead">Entre para favoritar ervas, montar listas e marcar pontos no mapa.</p>
        <button type="button" className="btn btn-primary" onClick={openLogin}>
          <LogIn size={18} aria-hidden />
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div className="container acct">
      <h1 className="page-title">{user.name}</h1>
      <p className="page-lead">{user.email}</p>

      <div className="acct-grid">
        <Link href="/minhas-ervas" className="pv-card acct-link">
          <BookmarkCheck size={22} aria-hidden />
          <strong>Minhas ervas</strong>
          <span>Favoritas e listas para banhos e defumações.</span>
        </Link>
        {user.role === "ADMIN" || user.role === "HERBMASTER" ? (
          <Link href="/admin" className="pv-card acct-link">
            <ShieldCheck size={22} aria-hidden />
            <strong>{user.role === "ADMIN" ? "Administração" : "Curadoria"}</strong>
            <span>{user.role === "ADMIN" ? "Editar ervas e gerenciar usuários." : "Corrigir informações das ervas."}</span>
          </Link>
        ) : null}
      </div>

      <div className="acct-actions">
        <OfflineButton />
        <InstallButton className="btn" />
        <button type="button" className="btn btn-danger" onClick={() => void logout()}>
          <LogOut size={16} aria-hidden />
          Sair
        </button>
      </div>
    </div>
  );
}
