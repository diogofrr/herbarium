import { getHerbs } from "@/lib/server/api";
import type { HerbCard } from "@/types/herb";

const ENDPOINT = "https://my-api.plantnet.org/v2/identify/all";

export type Organ = "auto" | "leaf" | "flower" | "fruit" | "bark" | "habit";
export const ORGANS: Organ[] = ["auto", "leaf", "flower", "fruit", "bark", "habit"];

export type IdentifyMatch = {
  score: number;
  scientificName: string;
  commonNames: string[];
  family: string | null;
  /** exact: mesma espécie do guia; genus: outra espécie do mesmo gênero */
  guide: { level: "exact" | "genus"; herb: HerbCard } | null;
};

/** Nomes antigos que o guia ainda usa e que o Pl@ntNet devolve com o nome aceito. */
const SYNONYMS: Record<string, string> = {
  "rosmarinus officinalis": "salvia rosmarinus",
  "lippia alba": "lippia alba",
  "matricaria chamomilla": "matricaria chamomilla",
  "chamomilla recutita": "matricaria chamomilla",
  "mimosa hostilis": "mimosa tenuiflora",
  "cymbopogon citratus": "cymbopogon citratus",
  "plectranthus barbatus": "coleus barbatus",
  "kalanchoe brasiliensis": "kalanchoe brasiliensis",
  "bryophyllum pinnatum": "kalanchoe pinnata",
  "dracaena fragrans": "dracaena fragrans",
  "cordyline terminalis": "cordyline fruticosa",
  "ocimum minimum": "ocimum basilicum",
  "citrus aurantium": "citrus x aurantium",
  "citrus limon": "citrus x limon",
  "pelargonium graveolens": "pelargonium graveolens",
  "solanum lycopersicum": "solanum lycopersicum",
  "lycopersicon esculentum": "solanum lycopersicum",
};

function canonical(name: string): string {
  const t = name
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/×/g, "x")
    .split(/\s+/)
    .filter(Boolean);
  const two = t.slice(0, 2).join(" ");
  return SYNONYMS[two] ?? two;
}

function genusOf(name: string): string {
  return canonical(name).split(" ")[0] ?? "";
}

function matchHerb(
  scientificName: string,
  herbs: HerbCard[],
): IdentifyMatch["guide"] {
  const wanted = canonical(scientificName);
  const genus = genusOf(scientificName);
  const exact = herbs.find((h) => h.scientificName && canonical(h.scientificName) === wanted);
  if (exact) return { level: "exact", herb: exact };
  const sameGenus = herbs.find((h) => h.scientificName && genusOf(h.scientificName) === genus);
  return sameGenus ? { level: "genus", herb: sameGenus } : null;
}

type PlantNetResult = {
  score: number;
  species: {
    scientificNameWithoutAuthor: string;
    commonNames?: string[];
    family?: { scientificNameWithoutAuthor: string };
  };
};

export class PlantNetError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function identifyPlant(
  image: Blob,
  organ: Organ,
): Promise<{ matches: IdentifyMatch[]; remaining: number | null }> {
  const key = process.env.PLANTNET_API_KEY;
  if (!key) throw new PlantNetError("Identificação não configurada.", 503);

  const form = new FormData();
  form.append("images", image, "planta.jpg");
  form.append("organs", organ);

  const url = `${ENDPOINT}?api-key=${encodeURIComponent(key)}&lang=pt&nb-results=5&no-reject=false`;
  const res = await fetch(url, { method: "POST", body: form, cache: "no-store" });

  if (res.status === 404) return { matches: [], remaining: null };
  if (res.status === 429) throw new PlantNetError("Limite diário de identificações atingido. Tente amanhã.", 429);
  if (!res.ok) throw new PlantNetError("O serviço de identificação não respondeu.", 502);

  const data = (await res.json()) as {
    results: PlantNetResult[];
    remainingIdentificationRequests?: number;
  };
  const herbs = (await getHerbs()) ?? [];

  const matches = data.results.map<IdentifyMatch>((r) => ({
    score: r.score,
    scientificName: r.species.scientificNameWithoutAuthor,
    commonNames: (r.species.commonNames ?? []).slice(0, 4),
    family: r.species.family?.scientificNameWithoutAuthor ?? null,
    guide: matchHerb(r.species.scientificNameWithoutAuthor, herbs),
  }));
  return { matches, remaining: data.remainingIdentificationRequests ?? null };
}
