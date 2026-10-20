/** Fase da lua pelo ciclo médio (aproximação de ± algumas horas, suficiente para o calendário). */
const SYNODIC = 29.530588853;
const DAY_MS = 86_400_000;
// Lua nova de referência: 6 de janeiro de 2000, 18:14 UTC.
const REF_NEW = Date.UTC(2000, 0, 6, 18, 14);

export type MoonPhase = { name: string; age: number; cycle: number; illumination: number };

export function moonPhase(date = new Date()): MoonPhase {
  const days = (date.getTime() - REF_NEW) / DAY_MS;
  const age = ((days % SYNODIC) + SYNODIC) % SYNODIC;
  const cycle = age / SYNODIC;
  const illumination = (1 - Math.cos(2 * Math.PI * cycle)) / 2;
  const edges: [number, string][] = [
    [1.85, "Lua nova"],
    [5.54, "Lua crescente"],
    [9.23, "Quarto crescente"],
    [12.91, "Crescente gibosa"],
    [16.61, "Lua cheia"],
    [20.3, "Minguante gibosa"],
    [23.99, "Quarto minguante"],
    [27.68, "Lua minguante"],
  ];
  const name = edges.find(([limit]) => age < limit)?.[1] ?? "Lua nova";
  return { name, age, cycle, illumination };
}

/** Próximas fases principais (nova, quarto crescente, cheia, quarto minguante). */
export function nextPhases(from = new Date(), count = 4): { name: string; date: Date }[] {
  const base = Math.floor((from.getTime() - REF_NEW) / DAY_MS / SYNODIC) - 1;
  const names = ["Lua nova", "Quarto crescente", "Lua cheia", "Quarto minguante"];
  const out: { name: string; date: Date }[] = [];
  for (let c = base; out.length < count && c < base + 4; c++) {
    for (let q = 0; q < 4; q++) {
      const t = REF_NEW + (c + q / 4) * SYNODIC * DAY_MS;
      if (t > from.getTime()) out.push({ name: names[q], date: new Date(t) });
    }
  }
  return out.slice(0, count);
}
