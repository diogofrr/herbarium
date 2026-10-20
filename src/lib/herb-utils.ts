import type { HerbCard, HerbFilters, Temperature } from "@/types/herb";

export const EMPTY_FILTERS: HerbFilters = {
  q: "",
  temperature: null,
  orixa: null,
  povo: null,
  funcao: null,
};

/** minúsculas, sem acentos, espaços colapsados: base da busca tolerante. */
export function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export const TEMPERATURE_META: Record<
  Temperature,
  { label: string; hint: string }
> = {
  quente: {
    label: "Quente",
    hint: "Limpa, dissolve e descarrega. Erva forte.",
  },
  morna: {
    label: "Morna",
    hint: "Equilibra, restaura e energiza.",
  },
  fria: {
    label: "Fria",
    hint: "Uso específico: acalma, constrói e fixa.",
  },
};

export function isTemperature(value: string | null | undefined): value is Temperature {
  return value === "quente" || value === "morna" || value === "fria";
}

/** Arquivos de imagem ficam em /public/herbs (WebP otimizado). */
export function imageUrl(file: string): string {
  return `/herbs/${file}`;
}

export function thumbUrl(file: string): string {
  return `/herbs/${file.replace(/\.webp$/, "-thumb.webp")}`;
}

export function herbMatches(herb: HerbCard, filters: HerbFilters): boolean {
  if (filters.temperature && herb.temperature !== filters.temperature) return false;
  if (filters.orixa && !herb.orixas.some((o) => o.slug === filters.orixa)) return false;
  if (filters.povo && !herb.povos.some((p) => p.slug === filters.povo)) return false;
  if (filters.funcao && !herb.functions.includes(filters.funcao)) return false;

  const q = fold(filters.q);
  if (!q) return true;
  const haystack = fold(
    [
      herb.name,
      herb.alternativeNames.join(" "),
      herb.scientificName ?? "",
      herb.mainUse,
      herb.orixas.map((o) => o.name).join(" "),
      herb.povos.map((p) => p.name).join(" "),
    ].join(" "),
  );
  return q.split(" ").every((token) => haystack.includes(token));
}

export function countActiveFilters(filters: HerbFilters): number {
  return [filters.temperature, filters.orixa, filters.povo, filters.funcao].filter(Boolean).length;
}

/** Dá nome legível à lista de orixás/povos (para texto corrido e aria-label). */
export function joinNames(items: { name: string }[]): string {
  const names = items.map((i) => i.name);
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

export function filtersToSearch(filters: HerbFilters): string {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.temperature) params.set("temperatura", filters.temperature);
  if (filters.orixa) params.set("orixa", filters.orixa);
  if (filters.povo) params.set("povo", filters.povo);
  if (filters.funcao) params.set("funcao", filters.funcao);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function filtersFromSearch(params: URLSearchParams): HerbFilters {
  const t = params.get("temperatura");
  return {
    q: params.get("q") ?? "",
    temperature: isTemperature(t) ? t : null,
    orixa: params.get("orixa"),
    povo: params.get("povo"),
    funcao: params.get("funcao"),
  };
}

/** Rótulos do vocabulário de funções (espelha data/taxonomy.json da API). */
export const FUNCTION_LABELS: Record<string, string> = {
  limpeza: "Limpeza",
  descarrego: "Descarrego",
  purificacao: "Purificação",
  protecao: "Proteção",
  "quebra-de-demanda": "Quebra de demanda",
  banimento: "Banimento",
  "abertura-de-caminhos": "Abertura de caminhos",
  prosperidade: "Prosperidade",
  sorte: "Sorte",
  amor: "Amor",
  sensualidade: "Sensualidade",
  harmonia: "Harmonia",
  calmante: "Calmante",
  equilibrio: "Equilíbrio",
  energizacao: "Energização",
  cura: "Cura",
  mediunidade: "Mediunidade",
  intuicao: "Intuição",
  "elevacao-espiritual": "Elevação espiritual",
  coragem: "Coragem",
  fertilidade: "Fertilidade",
  consagracao: "Consagração",
};

export function labelOfFunction(slug: string): string {
  return FUNCTION_LABELS[slug] ?? slug.replace(/-/g, " ");
}

const STALE_DAYS = 60;
const DAY_MS = 86_400_000;

/** Ponto que ninguém confirma há mais de 60 dias: a erva pode não estar mais lá. */
export function isStaleMarker(lastConfirmedAt: string, now = Date.now()): boolean {
  return now - new Date(lastConfirmedAt).getTime() > STALE_DAYS * DAY_MS;
}

/** "hoje", "há 3 dias", "há 2 meses". */
export function timeAgo(iso: string, now = Date.now()): string {
  const days = Math.floor((now - new Date(iso).getTime()) / DAY_MS);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "há 1 mês" : `há ${months} meses`;
  const years = Math.floor(months / 12);
  return years === 1 ? "há 1 ano" : `há ${years} anos`;
}
