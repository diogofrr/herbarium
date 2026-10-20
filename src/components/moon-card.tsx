"use client";

import { useEffect, useState } from "react";
import { moonPhase, nextPhases } from "@/lib/moon";

/** Disco da lua visto do hemisfério sul: crescente ilumina a esquerda, minguante a direita. */
function MoonDisc({ cycle }: { cycle: number }) {
  const r = 30;
  const rx = Math.abs(Math.cos(2 * Math.PI * cycle)) * r;
  const crescent = Math.cos(2 * Math.PI * cycle) > 0;
  const waxing = cycle < 0.5;
  const lit = `M 0 ${-r} A ${r} ${r} 0 0 0 0 ${r} A ${rx} ${r} 0 0 ${crescent ? 1 : 0} 0 ${-r} Z`;
  return (
    <svg viewBox="-34 -34 68 68" width="64" height="64" aria-hidden>
      <circle r={r} fill="var(--ink)" opacity="0.88" />
      <path d={lit} fill="#f6efd6" transform={waxing ? undefined : "scale(-1 1)"} />
      <circle r={r} fill="none" stroke="var(--line)" strokeWidth="1" />
    </svg>
  );
}

const fmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", weekday: "short" });

/** Fase da lua de hoje e as próximas fases principais. */
export function MoonCard() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
  }, []);
  if (!now) return null;

  const phase = moonPhase(now);
  const upcoming = nextPhases(now);

  return (
    <section className="pv-card moon-card" aria-label="Fase da lua">
      <div className="moon-now">
        <MoonDisc cycle={phase.cycle} />
        <div>
          <strong>{phase.name}</strong>
          <p>{Math.round(phase.illumination * 100)}% iluminada hoje</p>
        </div>
      </div>
      <ul className="moon-next">
        {upcoming.map((p) => (
          <li key={p.date.toISOString()}>
            <span>{p.name}</span>
            <small>{fmt.format(p.date)}</small>
          </li>
        ))}
      </ul>
      <p className="pv-small">Datas aproximadas, no horário do seu aparelho.</p>
    </section>
  );
}
