"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { FilterSheet } from "@/components/filter-sheet";
import { INTENTS, intentById, intentScore, matchIntents } from "@/lib/intents";
import { HerbCard } from "@/components/herb-card";
import {
  EMPTY_FILTERS,
  countActiveFilters,
  filtersFromSearch,
  filtersToSearch,
  herbMatches,
} from "@/lib/herb-utils";
import type { HerbCard as HerbCardData, HerbFilters, Taxonomy } from "@/types/herb";

const PAGE_SIZE = 48;

/** Índice do guia: busca tolerante a acentos + filtros, sincronizado com a URL. */
export function HerbIndex({
  herbs,
  taxonomy,
}: {
  herbs: HerbCardData[];
  taxonomy: Taxonomy | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => filtersFromSearch(new URLSearchParams(searchParams)), [searchParams]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);
  // O campo de busca mantém estado local para a digitação não depender do roteador.
  const [text, setText] = useState(filters.q);

  const intent = intentById(searchParams.get("intencao"));

  const go = useCallback(
    (next: HerbFilters, intentId: string | null) => {
      setLimit(PAGE_SIZE);
      const params = new URLSearchParams(filtersToSearch(next));
      if (intentId) params.set("intencao", intentId);
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [pathname, router],
  );
  const apply = useCallback((next: HerbFilters) => go(next, intent?.id ?? null), [go, intent]);

  const suggested = useMemo(() => (intent ? [] : matchIntents(text)), [intent, text]);

  const matches = useMemo(() => {
    const found = herbs.filter((h) => herbMatches(h, filters));
    if (!intent) return found;
    return found
      .map((h) => ({ h, score: intentScore(h, intent) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.h.name.localeCompare(b.h.name, "pt-BR"))
      .map((x) => x.h);
  }, [herbs, filters, intent]);
  const visible = matches.slice(0, limit);
  const active = countActiveFilters(filters);

  const activeChips: { label: string; clear: () => void }[] = [];
  if (intent)
    activeChips.push({ label: `Preciso de: ${intent.label}`, clear: () => go(filters, null) });
  if (filters.temperature)
    activeChips.push({
      label: filters.temperature[0].toUpperCase() + filters.temperature.slice(1),
      clear: () => apply({ ...filters, temperature: null }),
    });
  const orixa = taxonomy?.orixas.find((o) => o.slug === filters.orixa);
  if (orixa) activeChips.push({ label: orixa.name, clear: () => apply({ ...filters, orixa: null }) });
  const povo = taxonomy?.povos.find((p) => p.slug === filters.povo);
  if (povo) activeChips.push({ label: povo.name, clear: () => apply({ ...filters, povo: null }) });
  const func = taxonomy?.functions.find((f) => f.slug === filters.funcao);
  if (func) activeChips.push({ label: func.label, clear: () => apply({ ...filters, funcao: null }) });

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-top">
          <div className="search-box">
            <Search size={18} aria-hidden />
            <input
              type="search"
              value={text}
              placeholder="Buscar erva ou orixá"
              aria-label="Buscar no guia de ervas"
              onChange={(e) => {
                setText(e.target.value);
                apply({ ...filters, q: e.target.value });
              }}
            />
            {text ? (
              <button
                type="button"
                className="clear"
                aria-label="Limpar busca"
                onClick={() => {
                  setText("");
                  apply({ ...filters, q: "" });
                }}
              >
                <X size={16} />
              </button>
            ) : null}
          </div>
          <button
            type="button"
            className="btn"
            aria-label={`Filtros${active > 0 ? ` (${active} ativos)` : ""}`}
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontal size={18} aria-hidden />
            <span className="hide-xs">Filtros</span>
            {active > 0 ? <span className="filter-count">{active}</span> : null}
          </button>
        </div>

        {suggested.length > 0 ? (
          <div className="chip-row" aria-label="Sugestões de necessidade">
            <span className="pv-small">Ervas para:</span>
            {suggested.map((i) => (
              <button
                key={i.id}
                type="button"
                className="chip chip-func"
                onClick={() => {
                  setText("");
                  go({ ...filters, q: "" }, i.id);
                }}
              >
                {i.label}
              </button>
            ))}
          </div>
        ) : null}

        {!intent ? (
          <div className="intent-row">
            <span className="intent-label">Preciso de</span>
            <div className="chip-row is-scroll" role="group" aria-label="Preciso de">
              {INTENTS.map((i) => (
                <button key={i.id} type="button" className="chip" onClick={() => go(filters, i.id)}>
                  {i.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {activeChips.length > 0 ? (
          <div className="chip-row">
            {activeChips.map((c) => (
              <button key={c.label} type="button" className="chip is-on" onClick={c.clear}>
                {c.label} <X size={13} aria-hidden />
                <span className="visually-hidden">remover filtro</span>
              </button>
            ))}
          </div>
        ) : null}

        <p className="result-line" role="status">
          {matches.length === herbs.length
            ? `${herbs.length} ervas no guia`
            : `${matches.length} de ${herbs.length} ervas`}
        </p>
      </div>

      {visible.length > 0 ? (
        <ul className="herb-grid" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {visible.map((h, i) => (
            <li key={h.slug} style={{ display: "contents" }}>
              <HerbCard herb={h} priority={i < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">
          <p>Nenhuma erva encontrada com esses filtros.</p>
          <button type="button" className="btn" onClick={() => { setText(""); go(EMPTY_FILTERS, null); }}>
            Limpar busca e filtros
          </button>
        </div>
      )}

      {matches.length > limit ? (
        <div style={{ display: "grid", placeItems: "center", marginTop: 22 }}>
          <button type="button" className="btn" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
            Mostrar mais ({matches.length - limit})
          </button>
        </div>
      ) : null}

      <FilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onChange={apply}
        taxonomy={taxonomy ?? undefined}
        resultCount={matches.length}
        resultNoun="ervas"
      />
    </>
  );
}
