export type HerbStatus = "pouca" | "muita";

export type HerbClassification = "flor" | "erva" | "arvore";

export type EnergyTemperature = "quente" | "morna" | "fria";

export type AllergyRisk = "baixo" | "medio" | "alto";

export type HerbKey =
  // — lista principal —
  | "alecrim"
  | "alfazema"
  | "alho"
  | "anis_estrelado"
  | "aroeira"
  | "arruda"
  | "babosa"
  | "beladona"
  | "benjoim"
  | "bico_de_papagaio"
  | "boldo"
  | "calendula"
  | "camomila"
  | "cana_de_acucar"
  | "capim_cidreira"
  | "comigo_ninguem_pode"
  | "copo_de_leite"
  | "cravo_da_india"
  | "dama_da_noite"
  | "erva_doce"
  | "erva_santa_luzia"
  | "eucalipto"
  | "folha_de_fogo"
  | "girassol"
  | "guine"
  | "hortela"
  | "jasmim"
  | "levante"
  | "louro"
  | "maca"
  | "macela"
  | "malva"
  | "mamona"
  | "manjericao"
  | "manjerona"
  | "mirra"
  | "patchouly"
  | "pata_de_vaca"
  | "peregun"
  | "picao_preto"
  | "pinhao_roxo"
  | "pitanga"
  | "quebra_pedra"
  | "roma"
  | "rosas"
  | "saiao"
  | "salsa"
  | "salvia"
  | "samambaia"
  | "sao_goncalinho"
  | "trombeteira"
  | "urtiga"
  // — chaves legadas (compatibilidade com marcadores existentes) —
  | "abre_caminho"
  | "acoita_cavalo"
  | "alfavaca"
  | "amora"
  | "cana_do_brejo"
  | "carqueja"
  | "coentro"
  | "confrei"
  | "espada_de_sao_jorge"
  | "espinheira_santa"
  | "jurema_preta"
  | "jurubeba"
  | "lirio_branco"
  | "melissa"
  | "rosa_vermelha"
  | "rosas_brancas";

export type HerbDetails = {
  key: HerbKey;
  label: string;
  classification: HerbClassification;
  energyTemperature: EnergyTemperature;
  allergyRisk: AllergyRisk;
  warningNote: string;
  saintTags: string[];
  properties: string[];
};

export type HerbMarker = {
  id: string;
  herbKey: HerbKey;
  herbName: string;
  classification: HerbClassification;
  energyTemperature: EnergyTemperature;
  allergyRisk: AllergyRisk;
  warningNote: string;
  saintTags: string[];
  properties: string[];
  notes: string;
  status: HerbStatus;
  addressLabel: string;
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateHerbInput = {
  herbKey: HerbKey;
  notes?: string;
  status: HerbStatus;
  lat: number;
  lng: number;
  addressLabel?: string;
};

export type UpdateHerbInput = {
  herbKey?: HerbKey;
  notes?: string;
  status?: HerbStatus;
  addressLabel?: string;
};
