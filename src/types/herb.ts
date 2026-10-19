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
  createdAt: string;
  updatedAt: string;
  herb: HerbCard;
};

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
