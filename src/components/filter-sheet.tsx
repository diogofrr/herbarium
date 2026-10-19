"use client";

import { X } from "lucide-react";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { EMPTY_FILTERS, TEMPERATURE_META, countActiveFilters } from "@/lib/herb-utils";
import type { HerbFilters, Taxonomy, Temperature } from "@/types/herb";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: HerbFilters;
  onChange: (next: HerbFilters) => void;
  taxonomy: Taxonomy | undefined;
  resultCount: number;
  resultNoun: string;
};

const TEMPS: Temperature[] = ["quente", "morna", "fria"];

export function FilterSheet({
  open,
  onOpenChange,
  filters,
  onChange,
  taxonomy,
  resultCount,
  resultNoun,
}: Props) {
  const toggle = <K extends "orixa" | "povo" | "funcao">(key: K, value: string) =>
    onChange({ ...filters, [key]: filters[key] === value ? null : value });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Filtros" description="Filtre por temperatura, orixá, povo ou função.">
        <div className="modal-header">
          <h2 className="modal-title">Filtros</h2>
          <DialogClose asChild>
            <button type="button" className="modal-close" aria-label="Fechar filtros">
              <X size={18} />
            </button>
          </DialogClose>
        </div>

        <section className="filter-group" aria-label="Temperatura">
          <h3>Temperatura</h3>
          <div className="chip-row">
            {TEMPS.map((t) => (
              <button
                key={t}
                type="button"
                className={`chip chip-temp-${t}${filters.temperature === t ? " is-on" : ""}`}
                aria-pressed={filters.temperature === t}
                onClick={() => onChange({ ...filters, temperature: filters.temperature === t ? null : t })}
              >
                {TEMPERATURE_META[t].label}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-group" aria-label="Orixá">
          <h3>Orixá</h3>
          <div className="chip-row">
            {taxonomy?.orixas.map((o) => (
              <button
                key={o.slug}
                type="button"
                className={`chip chip-orixa${filters.orixa === o.slug ? " is-on" : ""}`}
                aria-pressed={filters.orixa === o.slug}
                onClick={() => toggle("orixa", o.slug)}
              >
                {o.name}
                <small>{o.count}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="filter-group" aria-label="Povo">
          <h3>Povo de atuação</h3>
          <div className="chip-row">
            {taxonomy?.povos.map((p) => (
              <button
                key={p.slug}
                type="button"
                className={`chip chip-povo${filters.povo === p.slug ? " is-on" : ""}`}
                aria-pressed={filters.povo === p.slug}
                onClick={() => toggle("povo", p.slug)}
              >
                {p.name}
                <small>{p.count}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="filter-group" aria-label="Função">
          <h3>Função</h3>
          <div className="chip-row">
            {taxonomy?.functions
              .filter((f) => f.count > 0)
              .map((f) => (
                <button
                  key={f.slug}
                  type="button"
                  className={`chip chip-func${filters.funcao === f.slug ? " is-on" : ""}`}
                  aria-pressed={filters.funcao === f.slug}
                  onClick={() => toggle("funcao", f.slug)}
                >
                  {f.label}
                  <small>{f.count}</small>
                </button>
              ))}
          </div>
        </section>

        <div className="modal-actions">
          <button
            type="button"
            className="btn"
            disabled={countActiveFilters(filters) === 0}
            onClick={() => onChange({ ...EMPTY_FILTERS, q: filters.q })}
          >
            Limpar filtros
          </button>
          <DialogClose asChild>
            <button type="button" className="btn btn-primary">
              Ver {resultCount} {resultNoun}
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
