"use client";

import { useMemo, useState } from "react";
import { Leaf, Search } from "lucide-react";
import { TemperatureChip } from "@/components/chips";
import { fold, thumbUrl } from "@/lib/herb-utils";
import type { HerbCard } from "@/types/herb";

type Props = {
  herbs: HerbCard[];
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
};

/** Lista pesquisável de ervas (acentos ignorados), pensada para toque no celular. */
export function HerbPicker({ herbs, value, onChange, disabled }: Props) {
  const [q, setQ] = useState("");
  const selected = herbs.find((h) => h.slug === value);

  const results = useMemo(() => {
    const needle = fold(q);
    const base = needle
      ? herbs.filter((h) => fold(`${h.name} ${h.alternativeNames.join(" ")}`).includes(needle))
      : herbs;
    return base.slice(0, 60);
  }, [herbs, q]);

  return (
    <div className="picker">
      <div className="search-box">
        <Search size={18} aria-hidden />
        <input
          type="search"
          value={q}
          disabled={disabled}
          placeholder={selected ? `Selecionada: ${selected.name}` : "Buscar erva"}
          aria-label="Buscar erva"
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="picker-list" role="listbox" aria-label="Ervas">
        {results.length === 0 ? (
          <p className="empty" style={{ padding: 16 }}>
            Nenhuma erva encontrada.
          </p>
        ) : (
          results.map((h) => (
            <button
              key={h.slug}
              type="button"
              role="option"
              aria-selected={h.slug === value}
              className="picker-item"
              disabled={disabled}
              onClick={() => onChange(h.slug)}
            >
              {h.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbUrl(h.cover.file)} alt="" width={36} height={36} loading="lazy" />
              ) : (
                <span className="mini-thumb" style={{ display: "grid", placeItems: "center" }}>
                  <Leaf size={18} aria-hidden />
                </span>
              )}
              <span style={{ flex: 1, minWidth: 0 }}>
                <strong>{h.name}</strong>
                <small>{h.orixas.map((o) => o.name).slice(0, 3).join(", ")}</small>
              </span>
              <TemperatureChip temperature={h.temperature} />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
