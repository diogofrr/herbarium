import { fold } from "@/lib/herb-utils";
import type { HerbCard } from "@/types/herb";

/** "Preciso de…": necessidades comuns ligadas às funções do vocabulário do guia. */
export type Intent = { id: string; label: string; words: string[]; functions: string[] };

export const INTENTS: Intent[] = [
  { id: "limpeza", label: "Limpar e descarregar", words: ["limpar", "limpeza", "descarrego", "descarregar", "carga", "pesado", "pesada", "purificar"], functions: ["limpeza", "descarrego", "purificacao"] },
  { id: "protecao", label: "Proteção", words: ["protecao", "proteger", "defesa", "defender", "escudo"], functions: ["protecao"] },
  { id: "demanda", label: "Quebrar demanda e olho gordo", words: ["demanda", "olho gordo", "inveja", "mau olhado", "feitico", "magia"], functions: ["quebra-de-demanda", "banimento"] },
  { id: "caminhos", label: "Abrir caminhos", words: ["caminho", "caminhos", "abrir", "trabalho", "emprego", "oportunidade"], functions: ["abertura-de-caminhos"] },
  { id: "prosperidade", label: "Prosperidade e sorte", words: ["dinheiro", "prosperidade", "fartura", "abundancia", "riqueza", "sorte", "comercio"], functions: ["prosperidade", "sorte"] },
  { id: "amor", label: "Amor e relações", words: ["amor", "paixao", "relacionamento", "romance", "namoro", "conquista"], functions: ["amor", "sensualidade"] },
  { id: "calma", label: "Calma e harmonia", words: ["calma", "acalmar", "ansiedade", "estresse", "paz", "harmonia", "dormir", "equilibrio"], functions: ["calmante", "harmonia", "equilibrio"] },
  { id: "energia", label: "Energia e coragem", words: ["energia", "energizar", "cansaco", "animo", "forca", "coragem", "reenergizar"], functions: ["energizacao", "coragem"] },
  { id: "cura", label: "Cura", words: ["cura", "curar", "saude", "doenca"], functions: ["cura"] },
  { id: "mediunidade", label: "Mediunidade e intuição", words: ["mediunidade", "intuicao", "clarividencia", "desenvolvimento", "amaci", "espiritualidade"], functions: ["mediunidade", "intuicao", "elevacao-espiritual"] },
];

export function intentById(id: string | null): Intent | null {
  return INTENTS.find((i) => i.id === id) ?? null;
}

/** Necessidades que combinam com o que a pessoa digitou ("proteger a casa" → Proteção). */
export function matchIntents(text: string): Intent[] {
  const q = fold(text);
  if (q.length < 3) return [];
  const tokens = q.split(" ");
  return INTENTS.filter((i) =>
    i.words.some((w) => (w.includes(" ") ? q.includes(w) : tokens.some((t) => t.length >= 3 && (t === w || w.startsWith(t))))),
  );
}

/** Quantas das funções da necessidade a erva cobre (0 = não serve). */
export function intentScore(herb: HerbCard, intent: Intent): number {
  return herb.functions.filter((f) => intent.functions.includes(f)).length;
}
