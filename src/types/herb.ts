export type HerbStatus = "pouca" | "muita";

export type HerbCatalogEntry = {
  key: string;
  name: string;
  alternativeNames: string[];
  type: string | null;
  temperature: string[];
  sex: string[];
  element: string[];
  systems: string[];
  otherTags: string[];
  classDesc: string | null;
  hasRisk: boolean;
  riskTags: string[];
  riskDesc: string | null;
  orixas: string[];
  orixasText: string | null;
  falanges: string[];
  falangesText: string | null;
  usage: string | null;
  notes: string | null;
};

export type HerbMarker = {
  id: string;
  herbKey: string;
  status: HerbStatus;
  notes: string;
  addressLabel: string;
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt: string;
  catalog: HerbCatalogEntry;
};

export type CreateHerbInput = {
  herbKey: string;
  notes?: string;
  status: HerbStatus;
  lat: number;
  lng: number;
  addressLabel?: string;
};

export type UpdateHerbInput = {
  herbKey?: string;
  notes?: string;
  status?: HerbStatus;
  addressLabel?: string;
};
