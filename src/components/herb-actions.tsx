"use client";

import { useState } from "react";
import { BookmarkPlus, Check, Heart, Plus, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/context/auth-context";
import { useFavorites, useLists } from "@/hooks";

/** Coração: marca a erva como favorita (pede login se preciso). */
export function FavoriteButton({
  slug,
  name,
  className = "icon-btn",
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const { isAuthenticated, openLogin } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const on = isAuthenticated && isFavorite(slug);

  return (
    <button
      type="button"
      className={`${className}${on ? " is-active" : ""}`}
      aria-pressed={on}
      aria-label={on ? `Tirar ${name} das favoritas` : `Favoritar ${name}`}
      onClick={() => (isAuthenticated ? void toggle(slug) : openLogin())}
    >
      <Heart size={18} aria-hidden fill={on ? "currentColor" : "none"} />
    </button>
  );
}

/** Escolhe em quais listas a erva entra ("banho de descarrego", "defumação da casa"...). */
export function ListButton({
  slug,
  name,
  className = "icon-btn",
  withLabel = false,
}: {
  slug: string;
  name: string;
  className?: string;
  withLabel?: boolean;
}) {
  const { isAuthenticated, openLogin } = useAuth();
  const { lists, create, update } = useLists();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string, slugs: string[]) => {
    setError(null);
    const next = slugs.includes(slug) ? slugs.filter((s) => s !== slug) : [...slugs, slug];
    update.mutate({ id, herbSlugs: next }, { onError: (e) => setError(e.message) });
  };

  const addList = () => {
    const label = newName.trim();
    if (!label) return;
    setError(null);
    create.mutate(
      { name: label, herbSlugs: [slug] },
      {
        onSuccess: () => setNewName(""),
        onError: (e) => setError(e.message),
      },
    );
  };

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={`Adicionar ${name} a uma lista`}
        onClick={() => (isAuthenticated ? setOpen(true) : openLogin())}
      >
        <BookmarkPlus size={18} aria-hidden />
        {withLabel ? <span>Adicionar a uma lista</span> : null}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title="Adicionar a uma lista" description={`Escolha as listas que terão ${name}.`}>
          <div className="modal-header">
            <h2 className="modal-title">Listas com {name}</h2>
            <DialogClose asChild>
              <button type="button" className="modal-close" aria-label="Fechar">
                <X size={18} />
              </button>
            </DialogClose>
          </div>

          {lists.length === 0 ? (
            <p className="pv-small">Você ainda não tem listas. Crie a primeira abaixo.</p>
          ) : (
            <ul className="list-pick">
              {lists.map((l) => {
                const on = l.herbSlugs.includes(slug);
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      className={`list-pick-item${on ? " is-on" : ""}`}
                      aria-pressed={on}
                      disabled={update.isPending}
                      onClick={() => toggle(l.id, l.herbSlugs)}
                    >
                      <span className="list-pick-check" aria-hidden>
                        {on ? <Check size={16} /> : null}
                      </span>
                      <span>{l.name}</span>
                      <small>{l.herbSlugs.length} ervas</small>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <form
            className="list-new"
            onSubmit={(e) => {
              e.preventDefault();
              addList();
            }}
          >
            <input
              type="text"
              value={newName}
              maxLength={60}
              placeholder="Nova lista (ex.: banho de descarrego)"
              aria-label="Nome da nova lista"
              onChange={(e) => setNewName(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={!newName.trim() || create.isPending}>
              <Plus size={16} aria-hidden />
              Criar
            </button>
          </form>
          {error ? (
            <p role="alert" className="form-error">
              {error}
            </p>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
