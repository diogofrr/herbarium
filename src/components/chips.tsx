import Link from "next/link";
import { Flame, Snowflake, Sun } from "lucide-react";
import { TEMPERATURE_META, labelOfFunction } from "@/lib/herb-utils";
import type { HerbLink, Temperature } from "@/types/herb";

const ICONS = { quente: Flame, morna: Sun, fria: Snowflake } as const;

export function TemperatureChip({
  temperature,
  withHint = false,
}: {
  temperature: Temperature;
  withHint?: boolean;
}) {
  const Icon = ICONS[temperature];
  const meta = TEMPERATURE_META[temperature];
  return (
    <span className={`chip chip-temp-${temperature}`} title={withHint ? undefined : meta.hint}>
      <Icon size={14} aria-hidden />
      {meta.label}
    </span>
  );
}

type LinkChipsProps = {
  items: HerbLink[];
  kind: "orixa" | "povo";
  limit?: number;
  /** Quando true, cada chip leva ao índice do guia filtrado. */
  linked?: boolean;
};

export function LinkChips({ items, kind, limit, linked = false }: LinkChipsProps) {
  const shown = limit ? items.slice(0, limit) : items;
  const hidden = items.length - shown.length;
  if (items.length === 0) return null;
  const cls = kind === "orixa" ? "chip chip-orixa" : "chip chip-povo";
  return (
    <div className="chip-row">
      {shown.map((i) =>
        linked ? (
          <Link key={i.slug} href={`/ervas?${kind}=${i.slug}`} className={cls} title={i.note ?? undefined}>
            {i.name}
          </Link>
        ) : (
          <span key={i.slug} className={cls} title={i.note ?? undefined}>
            {i.name}
          </span>
        ),
      )}
      {hidden > 0 ? <span className="chip">+{hidden}</span> : null}
    </div>
  );
}

export function FunctionChips({
  slugs,
  linked = false,
  limit,
}: {
  slugs: string[];
  linked?: boolean;
  limit?: number;
}) {
  const shown = limit ? slugs.slice(0, limit) : slugs;
  return (
    <div className="chip-row">
      {shown.map((s) =>
        linked ? (
          <Link key={s} href={`/ervas?funcao=${s}`} className="chip chip-func">
            {labelOfFunction(s)}
          </Link>
        ) : (
          <span key={s} className="chip chip-func">
            {labelOfFunction(s)}
          </span>
        ),
      )}
    </div>
  );
}
