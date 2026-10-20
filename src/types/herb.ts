export type Temperature = "quente" | "morna" | "fria";
export type MarkerStatus = "pouca" | "muita";

export type HerbLink = { slug: string; name: string; note: string | null };

export type HerbCover = {
  file: string;
  alt: string;
  width: number;
  height: number;
} | null;

/** Versão enxuta: cards da wiki, busca e painel do mapa. */
export type HerbCard = {
  slug: string;
  name: string;
  alternativeNames: string[];
  scientificName: string | null;
  temperature: Temperature;
  functions: string[];
  mainUse: string;
  summary: string;
  hasRisk: boolean;
  orixas: HerbLink[];
  povos: HerbLink[];
  cover: HerbCover;
};

export type HerbSection = { id: string; title: string; body: string };

export type HerbImage = {
  file: string;
  alt: string;
  caption: string | null;
  credit: string;
  license: string;
  sourceUrl: string;
  width: number;
  height: number;
};

export type HerbSource = { id: string; label: string };

/** Versão completa: página da wiki. */
export type HerbDetail = HerbCard & {
  family: string | null;
  partsUsed: string[];
  sex: string[];
  element: string[];
  riskNote: string | null;
  classificationNote: string | null;
  sections: HerbSection[];
  sources: HerbSource[];
  images: HerbImage[];
};

export type TaxonomyItem = {
  slug: string;
  name: string;
  description: string | null;
  count: number;
};

export type Taxonomy = {
  total: number;
  orixas: TaxonomyItem[];
  povos: TaxonomyItem[];
  temperatures: TaxonomyItem[];
  functions: { slug: string; label: string; description: string | null; count: number }[];
};

export type HerbMarker = {
  id: string;
  herbSlug: string;
  status: MarkerStatus;
  notes: string;
  addressLabel: string;
  lat: number;
  lng: number;
  createdById: string | null;
  createdByName: string | null;
  hasPhoto: boolean;
  createdAt: string;
  updatedAt: string;
  /** Última vez que alguém viu ou confirmou a erva neste ponto. */
  lastConfirmedAt: string;
  /** Quando foi dado como esgotado (só vem com "Esgotados" ligado). */
  goneAt: string | null;
  herb: HerbCard;
};

export type MarkerEvent = {
  id: string;
  kind: "CREATED" | "STATUS" | "CONFIRMED" | "PHOTO" | "GONE";
  status: MarkerStatus | null;
  userName: string;
  createdAt: string;
};

export type GoneResult = { hidden: boolean; reports: number; needed: number };

export type MarkerDetail = HerbMarker & { events: MarkerEvent[] };

export type HerbList = { id: string; name: string; herbSlugs: string[]; updatedAt: string };

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "USER" | "HERBMASTER" | "ADMIN";
  isActive: boolean;
  markers: number;
  createdAt: string;
};

export type AdminHerb = HerbDetail & { locked: boolean };

export type UpdateHerbInput = Partial<{
  name: string;
  alternativeNames: string[];
  temperature: Temperature;
  mainUse: string;
  summary: string;
  functions: string[];
  orixas: string[];
  povos: string[];
  hasRisk: boolean;
  riskNote: string;
  sections: HerbSection[];
}>;

export type CreateMarkerInput = {
  herbSlug: string;
  status: MarkerStatus;
  notes?: string;
  addressLabel?: string;
  lat: number;
  lng: number;
};

export type UpdateMarkerInput = {
  herbSlug?: string;
  status?: MarkerStatus;
  notes?: string;
  addressLabel?: string;
};

/** Filtros compartilhados entre o mapa e o índice da wiki. */
export type HerbFilters = {
  q: string;
  temperature: Temperature | null;
  orixa: string | null;
  povo: string | null;
  funcao: string | null;
};
