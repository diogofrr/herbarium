"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, LogIn, Pencil, Plus, Trash2, X } from "lucide-react";
import { HerbThumb, RiskBadge } from "@/components/herb-card";
import { TemperatureChip } from "@/components/chips";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/auth-context";
import { useFavorites, useHerbCatalog, useLists } from "@/hooks";
import type { HerbCard, HerbList } from "@/types/herb";

function HerbRow({ herb, onRemove, removeLabel }: { herb: HerbCard; onRemove: () => void; removeLabel: string }) {
  return (
    <li className="herb-row">
      <Link href={`/ervas/${herb.slug}`} className="herb-row-link">
        <span className="herb-row-thumb">
          <HerbThumb herb={herb} size={96} />
        </span>
        <span className="herb-row-text">
          <strong>{herb.name}</strong>
          <small>{herb.mainUse}</small>
          <span className="chip-row">
            <TemperatureChip temperature={herb.temperature} />
            {herb.hasRisk ? <RiskBadge /> : null}
          </span>
        </span>
      </Link>
      <button type="button" className="icon-btn" aria-label={removeLabel} onClick={onRemove}>
        <X size={18} aria-hidden />
      </button>
    </li>
  );
}

function ListCard({
  list,
  bySlug,
  onRename,
  onDelete,
  onRemoveHerb,
}: {
  list: HerbList;
  bySlug: Map<string, HerbCard>;
  onRename: (name: string) => void;
  onDelete: () => void;
  onRemoveHerb: (slug: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(list.name);
  const herbs = list.herbSlugs.map((s) => bySlug.get(s)).filter((h): h is HerbCard => !!h);

  return (
    <section className="pv-card list-card">
      <header className="list-card-head">
        {editing ? (
          <form
            className="list-new"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) onRename(name.trim());
              setEditing(false);
            }}
          >
            <input type="text" value={name} maxLength={60} aria-label="Nome da lista" onChange={(e) => setName(e.target.value)} autoFocus />
            <button type="submit" className="btn btn-primary">
              Salvar
            </button>
          </form>
        ) : (
          <>
            <h2>{list.name}</h2>
            <span className="pv-small">{herbs.length} ervas</span>
            <button type="button" className="icon-btn" aria-label="Renomear lista" onClick={() => setEditing(true)}>
              <Pencil size={16} aria-hidden />
            </button>
            <button type="button" className="icon-btn" aria-label="Apagar lista" onClick={onDelete}>
              <Trash2 size={16} aria-hidden />
            </button>
          </>
        )}
      </header>
      {herbs.length === 0 ? (
        <p className="pv-small">
          Lista vazia. No <Link href="/ervas">guia de ervas</Link>, toque no ícone de marcador de uma erva para
          adicioná-la aqui.
        </p>
      ) : (
        <ul className="herb-rows">
          {herbs.map((h) => (
            <HerbRow key={h.slug} herb={h} removeLabel={`Tirar ${h.name} da lista`} onRemove={() => onRemoveHerb(h.slug)} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default function MinhasErvasPage() {
  const { isAuthenticated, isLoading, openLogin } = useAuth();
  const catalog = useHerbCatalog();
  const { favorites, toggle } = useFavorites();
  const { lists, create, update, remove } = useLists();
  const [newName, setNewName] = useState("");
  const [toDelete, setToDelete] = useState<HerbList | null>(null);

  const bySlug = useMemo(() => new Map((catalog.data ?? []).map((h) => [h.slug, h])), [catalog.data]);
  const favHerbs = favorites.map((s) => bySlug.get(s)).filter((h): h is HerbCard => !!h);

  if (isLoading) return <div className="container" />;

  if (!isAuthenticated) {
    return (
      <div className="container acct">
        <h1 className="page-title">Minhas ervas</h1>
        <p className="page-lead">Entre para guardar suas ervas favoritas e montar listas.</p>
        <button type="button" className="btn btn-primary" onClick={openLogin}>
          <LogIn size={18} aria-hidden />
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div className="container acct">
      <h1 className="page-title">Minhas ervas</h1>
      <p className="page-lead">Suas favoritas e as listas que você montou, só você vê.</p>

      <section className="pv-section">
        <header className="pv-head">
          <span className="pv-head-icon" aria-hidden>
            <Heart size={22} />
          </span>
          <div>
            <h2>Favoritas</h2>
          </div>
        </header>
        {favHerbs.length === 0 ? (
          <p className="pv-small">
            Nenhuma favorita ainda. No <Link href="/ervas">guia de ervas</Link>, toque no coração de uma erva.
          </p>
        ) : (
          <ul className="herb-rows">
            {favHerbs.map((h) => (
              <HerbRow key={h.slug} herb={h} removeLabel={`Tirar ${h.name} das favoritas`} onRemove={() => void toggle(h.slug)} />
            ))}
          </ul>
        )}
      </section>

      <section className="pv-section">
        <header className="pv-head">
          <div>
            <h2>Listas</h2>
            <p>Por exemplo: banho de descarrego, defumação da casa.</p>
          </div>
        </header>

        <form
          className="list-new"
          onSubmit={(e) => {
            e.preventDefault();
            const label = newName.trim();
            if (!label) return;
            create.mutate({ name: label }, { onSuccess: () => setNewName("") });
          }}
        >
          <input
            type="text"
            value={newName}
            maxLength={60}
            placeholder="Nome da nova lista"
            aria-label="Nome da nova lista"
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={!newName.trim() || create.isPending}>
            <Plus size={16} aria-hidden />
            Criar
          </button>
        </form>
        {create.error ? (
          <p role="alert" className="form-error">
            {create.error.message}
          </p>
        ) : null}

        {lists.map((l) => (
          <ListCard
            key={l.id}
            list={l}
            bySlug={bySlug}
            onRename={(name) => update.mutate({ id: l.id, name })}
            onDelete={() => setToDelete(l)}
            onRemoveHerb={(slug) => update.mutate({ id: l.id, herbSlugs: l.herbSlugs.filter((s) => s !== slug) })}
          />
        ))}
      </section>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent
          title="Apagar lista?"
          description={`A lista "${toDelete?.name ?? ""}" será apagada. As ervas continuam no guia.`}
          confirmLabel="Apagar"
          danger
          onConfirm={() => {
            if (toDelete) remove.mutate(toDelete.id);
            setToDelete(null);
          }}
          onCancel={() => setToDelete(null)}
        />
      </AlertDialog>
    </div>
  );
}
