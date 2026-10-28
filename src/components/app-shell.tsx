"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Camera, FlaskConical, Leaf, LogIn, LogOut, Map as MapIcon, User } from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import { InstallButton } from "@/components/pwa";
import { useAuth } from "@/context/auth-context";

const LINKS = [
  { href: "/", label: "Mapa", Icon: MapIcon },
  { href: "/ervas", label: "Guia de ervas", Icon: BookOpen },
  { href: "/preparo", label: "Preparo", Icon: FlaskConical },
  { href: "/identificar", label: "Identificar", Icon: Camera },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isLoading, loginOpen, openLogin, closeLogin } = useAuth();

  return (
    <div className="shell">
      <header className={`app-nav${pathname === "/" ? " on-map" : ""}`}>
        <Link href="/" className="brand">
          <Leaf size={22} aria-hidden />
          Ewé
        </Link>
        <nav className="nav-links" aria-label="Principal">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="nav-link"
              aria-current={isActive(pathname, href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <span className="nav-spacer" />
        <InstallButton />
        {!isLoading &&
          (isAuthenticated ? (
            <div className="nav-user">
              <Link href="/minhas-ervas" className="nav-user-name">
                {user?.name}
              </Link>
              {user?.role === "ADMIN" ? (
                <Link href="/admin" className="btn btn-on-dark">
                  Admin
                </Link>
              ) : null}
              <button type="button" className="btn btn-on-dark" onClick={() => void logout()}>
                <LogOut size={16} aria-hidden />
                Sair
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-on-dark" onClick={() => openLogin()}>
              <LogIn size={16} aria-hidden />
              Entrar
            </button>
          ))}
      </header>

      <main className={`shell-main${pathname === "/" ? " is-map" : ""}`}>{children}</main>

      <nav className="tabbar" aria-label="Principal">
        {LINKS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="tab"
            aria-current={isActive(pathname, href) ? "page" : undefined}
          >
            <Icon size={22} aria-hidden />
            {label.replace("Guia de ervas", "Guia")}
          </Link>
        ))}
        {isAuthenticated ? (
          <Link href="/conta" className="tab" aria-current={isActive(pathname, "/conta") ? "page" : undefined}>
            <User size={22} aria-hidden />
            Conta
          </Link>
        ) : (
          <button type="button" className="tab" onClick={() => openLogin()}>
            <User size={22} aria-hidden />
            Entrar
          </button>
        )}
      </nav>

      <AuthModal open={loginOpen} onClose={closeLogin} />
    </div>
  );
}
