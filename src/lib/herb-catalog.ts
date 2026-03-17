import type {
  AllergyRisk,
  EnergyTemperature,
  HerbClassification,
  HerbDetails,
  HerbKey,
} from "@/types/herb";

export const HERB_KEYS: HerbKey[] = [
  // lista principal (exibida no seletor)
  "alecrim",
  "alfazema",
  "alho",
  "anis_estrelado",
  "aroeira",
  "arruda",
  "babosa",
  "beladona",
  "benjoim",
  "bico_de_papagaio",
  "boldo",
  "calendula",
  "camomila",
  "cana_de_acucar",
  "capim_cidreira",
  "comigo_ninguem_pode",
  "copo_de_leite",
  "cravo_da_india",
  "dama_da_noite",
  "erva_doce",
  "erva_santa_luzia",
  "eucalipto",
  "folha_de_fogo",
  "girassol",
  "guine",
  "hortela",
  "jasmim",
  "levante",
  "louro",
  "maca",
  "macela",
  "malva",
  "mamona",
  "manjericao",
  "manjerona",
  "mirra",
  "patchouly",
  "pata_de_vaca",
  "peregun",
  "picao_preto",
  "pinhao_roxo",
  "pitanga",
  "quebra_pedra",
  "roma",
  "rosas",
  "saiao",
  "salsa",
  "salvia",
  "samambaia",
  "sao_goncalinho",
  "trombeteira",
  "urtiga",
];

export const HERB_CLASSIFICATIONS: HerbClassification[] = ["flor", "erva", "arvore"];
export const ENERGY_TEMPERATURES: EnergyTemperature[] = ["quente", "morna", "fria"];
export const ALLERGY_RISKS: AllergyRisk[] = ["baixo", "medio", "alto"];

function h(
  key: HerbKey,
  label: string,
  classification: HerbClassification,
  energyTemperature: EnergyTemperature,
  allergyRisk: AllergyRisk,
  warningNote: string,
  saintTags: string[],
  properties: string[],
): HerbDetails {
  return { key, label, classification, energyTemperature, allergyRisk, warningNote, saintTags, properties };
}

export const HERB_CATALOG: Record<HerbKey, HerbDetails> = {
  // ── A ─────────────────────────────────────────────────────────────────────
  alecrim: h(
    "alecrim", "Alecrim", "erva", "morna", "medio",
    "Atenção: evitar uso interno para hipertensos.",
    ["Oxalá", "Oxóssi", "Ibeji", "Preto-Velho", "Caboclo", "Erê"],
    ["Abertura de Caminhos", "Expansão", "Limpeza", "Equilíbrio Emocional"],
  ),
  alfazema: h(
    "alfazema", "Alfazema", "erva", "morna", "baixo",
    "Seguro.",
    ["Iemanjá", "Oxum", "Oxalá", "Caboclo", "Ibeji"],
    ["Acalmar", "Atrativo Feminino", "Harmonia", "Fortalecer Mediunidade"],
  ),
  alho: h(
    "alho", "Alho (e Cascas)", "erva", "quente", "medio",
    "Atenção: o consumo pode causar dermatite ou irritação no estômago.",
    ["Exu", "Ossain"],
    ["Descarrego Forte", "Consumir Negatividade", "Antibiótico Astral"],
  ),
  anis_estrelado: h(
    "anis_estrelado", "Anis-Estrelado", "erva", "morna", "baixo",
    "Seguro.",
    ["Iemanjá", "Oxum", "Cigano", "Marinheiro"],
    ["Sorte", "Energias Positivas", "Equilíbrio Mediúnico", "Amor"],
  ),
  aroeira: h(
    "aroeira", "Aroeira", "arvore", "quente", "medio",
    "Atenção: risco de alergia na pele. Não usar para banho (na coroa) em algumas casas.",
    ["Exu", "Ogum", "Oxóssi"],
    ["Limpeza Pesada", "Descarrego", "Quebra Feitiço"],
  ),
  arruda: h(
    "arruda", "Arruda", "erva", "quente", "alto",
    "Atenção: erva agressiva. Pode ser tóxica/abortiva. Não usar para banho na coroa.",
    ["Exu", "Ogum", "Preto-Velho", "Boiadeiro"],
    ["Descarrego", "Defesa", "Consumidora de Negatividade", "Quebra Feitiço"],
  ),
  // ── B ─────────────────────────────────────────────────────────────────────
  babosa: h(
    "babosa", "Babosa", "erva", "morna", "medio",
    "Atenção: uso externo recomendado. Pode causar irritações gástricas.",
    ["Exu", "Omolu"],
    ["Proteção", "Sorte", "Cicatrizante", "Regenerador"],
  ),
  beladona: h(
    "beladona", "Beladona", "erva", "quente", "alto",
    "ALTO RISCO: erva altamente tóxica. Não ingerir.",
    ["Exu"],
    ["Sacudimento", "Limpeza Densa", "Afastar Más Vibrações"],
  ),
  benjoim: h(
    "benjoim", "Benjoim", "erva", "morna", "baixo",
    "Seguro para defumação.",
    ["Oxalá", "Oxum"],
    ["Purificação", "Prosperidade", "Viagem Astral", "Destruir Larvas Astrais"],
  ),
  bico_de_papagaio: h(
    "bico_de_papagaio", "Bico-de-Papagaio", "flor", "morna", "alto",
    "ALTO RISCO: látex provoca coceira, queimação, diarreia e lesões oculares.",
    ["Uso Ornamental"],
    ["Estética"],
  ),
  boldo: h(
    "boldo", "Boldo (Tapete de Oxalá)", "erva", "morna", "medio",
    "Atenção: em excesso (ingerido), pode ser tóxico.",
    ["Oxalá", "Xangô"],
    ["Limpeza Coronária", "Equilíbrio", "Purificação"],
  ),
  // ── C ─────────────────────────────────────────────────────────────────────
  calendula: h(
    "calendula", "Calêndula", "flor", "morna", "baixo",
    "Seguro.",
    ["Iemanjá", "Oxum", "Oyá"],
    ["Energizador Astral", "Purificador de Chacras", "Amor"],
  ),
  camomila: h(
    "camomila", "Camomila", "flor", "morna", "medio",
    "Atenção: pode causar náuseas ou dermatites em pessoas sensíveis.",
    ["Oxalá", "Oxum", "Cigano"],
    ["Acalmar", "Adoçamento", "Paz"],
  ),
  cana_de_acucar: h(
    "cana_de_acucar", "Cana-de-Açúcar", "erva", "quente", "baixo",
    "Seguro. (Usa-se as folhas/bagaço para banhos/defumação).",
    ["Ewá", "Exu", "Oxumarê"],
    ["Limpeza Básica", "Consumir Astrais", "Atrair Dinheiro"],
  ),
  capim_cidreira: h(
    "capim_cidreira", "Capim Cidreira/Santo", "erva", "morna", "baixo",
    "Seguro.",
    ["Ogum", "Oxum", "Oxóssi"],
    ["Acalmar", "Bons Fluidos", "Sono"],
  ),
  comigo_ninguem_pode: h(
    "comigo_ninguem_pode", "Comigo-Ninguém-Pode", "erva", "quente", "alto",
    "ALTO RISCO: altamente tóxica (oxalato de cálcio). Causa asfixia e lesões oculares. Não banhar a coroa.",
    ["Exu", "Ogum"],
    ["Defesa", "Afastar Energias Negativas", "Quebrar Mandinga"],
  ),
  copo_de_leite: h(
    "copo_de_leite", "Copo-de-Leite", "flor", "fria", "alto",
    "ALTO RISCO: extrema toxicidade (oxalato de cálcio), causa dificuldade de deglutição e asfixia.",
    ["Uso Ornamental"],
    ["Estética"],
  ),
  cravo_da_india: h(
    "cravo_da_india", "Cravo da Índia", "erva", "fria", "baixo",
    "Seguro. (Pode causar leve sensibilidade se esfregado puro).",
    ["Obá", "Xangô", "Cigano"],
    ["Energia", "Poder", "Proteção contra Má Intenção", "Descarrego Sexual"],
  ),
  // ── D ─────────────────────────────────────────────────────────────────────
  dama_da_noite: h(
    "dama_da_noite", "Dama da Noite", "flor", "fria", "baixo",
    "O aroma forte pode incomodar pessoas sensíveis.",
    ["Ewá", "Nanã", "Pombo-Gira"],
    ["Intuição", "Atrativo Feminino"],
  ),
  // ── E ─────────────────────────────────────────────────────────────────────
  erva_doce: h(
    "erva_doce", "Erva Doce", "erva", "morna", "baixo",
    "Seguro.",
    ["Oxalá", "Oxum"],
    ["Adoçamento", "Romance", "Acalmar", "Harmonizar"],
  ),
  erva_santa_luzia: h(
    "erva_santa_luzia", "Erva de Santa Luzia", "erva", "fria", "baixo",
    "Seguro.",
    ["Ewá", "Iemanjá", "Oxum", "Oyá"],
    ["Cristalizar", "Prover", "Cura"],
  ),
  eucalipto: h(
    "eucalipto", "Eucalipto", "arvore", "morna", "baixo",
    "Seguro.",
    ["Oxalá"],
    ["Cura Espiritual", "Proteção", "Saúde", "Descarrego Forte"],
  ),
  // ── F ─────────────────────────────────────────────────────────────────────
  folha_de_fogo: h(
    "folha_de_fogo", "Folha de Fogo", "erva", "quente", "medio",
    "Atenção: pode causar queimação/alergia cutânea.",
    ["Exu", "Xangô"],
    ["Quebra Feitiço", "Limpeza", "Transformação"],
  ),
  // ── G ─────────────────────────────────────────────────────────────────────
  girassol: h(
    "girassol", "Girassol", "flor", "fria", "baixo",
    "Seguro.",
    ["Oxum", "Oyá", "Cigano"],
    ["Anuladora de Eguns", "Cristalizar", "Intuição"],
  ),
  guine: h(
    "guine", "Guiné", "erva", "quente", "medio",
    "Atenção: erva tóxica/agressiva; pode causar irritações e é tóxica se ingerida.",
    ["Omolu", "Oxóssi", "Preto-Velho", "Caboclo", "Boiadeiro"],
    ["Cortar Baixo Astral", "Barrar Mal", "Quebra Feitiço", "Descarrego"],
  ),
  // ── H ─────────────────────────────────────────────────────────────────────
  hortela: h(
    "hortela", "Hortelã", "erva", "morna", "baixo",
    "Seguro.",
    ["Oxalá", "Oxóssi", "Oxum", "Oyá"],
    ["Mudanças", "Animar", "Elevar Astral", "Abertura de Caminhos"],
  ),
  // ── J ─────────────────────────────────────────────────────────────────────
  jasmim: h(
    "jasmim", "Jasmim", "flor", "fria", "baixo",
    "Seguro.",
    ["Ibeji", "Iemanjá", "Erê"],
    ["Amor", "Sensualidade", "Paz", "Espiritualidade"],
  ),
  // ── L ─────────────────────────────────────────────────────────────────────
  levante: h(
    "levante", "Levante", "erva", "morna", "baixo",
    "Seguro.",
    ["Oxóssi", "Xangô"],
    ["Elevar Vibrações", "Força", "Liderança", "Bons Fluidos"],
  ),
  louro: h(
    "louro", "Louro", "arvore", "morna", "baixo",
    "Seguro.",
    ["Obá", "Oxóssi", "Oxumarê", "Oyá", "Cigano"],
    ["Prosperidade", "Vitória", "Atrair Dinheiro", "Fartura"],
  ),
  // ── M ─────────────────────────────────────────────────────────────────────
  maca: h(
    "maca", "Maçã (Folha/Casca)", "arvore", "fria", "baixo",
    "Seguro.",
    ["Obá", "Oxum", "Oyá"],
    ["Amor", "Magnetismo", "Prover", "Paz no Lar"],
  ),
  macela: h(
    "macela", "Macela", "flor", "morna", "baixo",
    "Seguro.",
    ["Oxalá"],
    ["Acalmar", "Atrair Amizades", "Proteger Lar", "Equilibrar"],
  ),
  malva: h(
    "malva", "Malva", "erva", "fria", "baixo",
    "Seguro.",
    ["Iemanjá", "Oxum"],
    ["Acalmar", "Paz", "Auto-Estima", "Equilíbrio Mental"],
  ),
  mamona: h(
    "mamona", "Mamona", "arvore", "quente", "alto",
    "ALTO RISCO: suas sementes contêm ricina e são letais se ingeridas. Pode agredir fisicamente na pele.",
    ["Exu", "Omolu", "Ossain", "Bahiano"],
    ["Limpeza de Caminhos", "Quebra Demanda", "Descarrego Pesado"],
  ),
  manjericao: h(
    "manjericao", "Manjericão", "erva", "morna", "baixo",
    "Seguro.",
    ["Nanã", "Omolu", "Oxalá", "Oxum", "Preto-Velho"],
    ["Elevação Espiritual", "Proteção", "Afastar Pessimismo", "Dinheiro"],
  ),
  manjerona: h(
    "manjerona", "Manjerona", "erva", "morna", "baixo",
    "Seguro.",
    ["Obá", "Oyá", "Xangô"],
    ["Amor Próprio", "Proteger Casa", "Revigorar"],
  ),
  mirra: h(
    "mirra", "Mirra", "erva", "quente", "baixo",
    "Seguro (em resina para queima).",
    ["Xangô"],
    ["Limpeza Duradoura", "Destruir Larvas Astrais", "Purificação"],
  ),
  // ── P ─────────────────────────────────────────────────────────────────────
  patchouly: h(
    "patchouly", "Patchouly", "erva", "fria", "baixo",
    "Seguro.",
    ["Oxalá"],
    ["Amor", "Sensualidade", "Intuição", "Magnetismo"],
  ),
  pata_de_vaca: h(
    "pata_de_vaca", "Pata de Vaca", "arvore", "morna", "baixo",
    "Seguro.",
    ["Iemanjá", "Nanã", "Obá"],
    ["Aterramento", "Materialização", "Equilíbrio"],
  ),
  peregun: h(
    "peregun", "Peregun (Pau d'Água)", "arvore", "morna", "baixo",
    "Seguro.",
    ["Logun-Edé", "Nanã", "Obá", "Ogum", "Ossain", "Oxóssi", "Oyá"],
    ["Limpeza", "Abertura", "Defesa", "Descarrego"],
  ),
  picao_preto: h(
    "picao_preto", "Picão Preto", "erva", "quente", "medio",
    "Erva agressiva para banhos.",
    ["Exu", "Omolu"],
    ["Aterramento", "Consumir Negatividade", "Limpeza"],
  ),
  pinhao_roxo: h(
    "pinhao_roxo", "Pinhão Roxo/Branco", "arvore", "quente", "alto",
    "ALTO RISCO: muito agressiva/tóxica. Não usar para banho (na cabeça).",
    ["Ogum"],
    ["Quebra Magia Negra", "Defesa", "Descarrego Forte", "Paralisa Fluxos"],
  ),
  pitanga: h(
    "pitanga", "Pitanga (Folha)", "arvore", "morna", "baixo",
    "Seguro.",
    ["Oyá"],
    ["Prosperidade", "Movimentação Espiritual"],
  ),
  // ── Q ─────────────────────────────────────────────────────────────────────
  quebra_pedra: h(
    "quebra_pedra", "Quebra Demanda / Quebra Pedra", "erva", "quente", "baixo",
    "Seguro.",
    ["Exu", "Ogum", "Xangô"],
    ["Desmanchar Feitiços", "Quebrar Inveja", "Aterramento"],
  ),
  // ── R ─────────────────────────────────────────────────────────────────────
  roma: h(
    "roma", "Romã (Folha/Casca)", "arvore", "morna", "baixo",
    "Seguro.",
    ["Ogum", "Oyá"],
    ["Proteção contra Inveja", "Renovação", "Limpeza", "Prosperidade"],
  ),
  rosas: h(
    "rosas", "Rosas", "flor", "fria", "baixo",
    "Seguro.",
    ["Ibeji", "Yabás", "Oxalá", "Pombo-Gira"],
    ["Amor", "Pureza", "Paz", "Harmonia", "Sensualidade", "Atração"],
  ),
  // ── S ─────────────────────────────────────────────────────────────────────
  saiao: h(
    "saiao", "Saião / Folha da Costa", "erva", "morna", "baixo",
    "Seguro.",
    ["Oxóssi", "Oxalá"],
    ["Equilíbrio", "Limpeza", "Calmante", "Restaurar Energias"],
  ),
  salsa: h(
    "salsa", "Salsa / Salsão", "erva", "fria", "baixo",
    "Seguro.",
    ["Exu", "Oxóssi"],
    ["Afastar Obsessores", "Defesa", "Proteger"],
  ),
  salvia: h(
    "salvia", "Sálvia", "erva", "morna", "baixo",
    "Seguro.",
    ["Oxalá"],
    ["Proteção", "Sabedoria", "Purificação", "Limpeza"],
  ),
  samambaia: h(
    "samambaia", "Samambaia", "erva", "morna", "baixo",
    "Seguro.",
    ["Oxóssi", "Caboclo"],
    ["Restabelecer", "Purificar", "Equilibrar"],
  ),
  sao_goncalinho: h(
    "sao_goncalinho", "São Gonçalinho", "arvore", "morna", "baixo",
    "Seguro.",
    ["Ogum", "Oxóssi"],
    ["Limpeza", "Quebra Demanda", "Aterramento"],
  ),
  // ── T ─────────────────────────────────────────────────────────────────────
  trombeteira: h(
    "trombeteira", "Trombeteira (Saia Branca)", "flor", "quente", "alto",
    "ALTO RISCO/LETAL: alcaloides causam taquicardia, boca seca, alucinações e podem levar à morte.",
    ["Magia Torta"],
    ["Alucinações", "Morte"],
  ),
  // ── U ─────────────────────────────────────────────────────────────────────
  urtiga: h(
    "urtiga", "Urtiga", "erva", "quente", "alto",
    "ALTO RISCO: pelos urticantes causam severa irritação, coceira e queimação. Não usar para banho de corpo/cabeça.",
    ["Exu"],
    ["Ataque", "Quebra Feitiço", "Limpeza Densa"],
  ),

  // ══ LEGADO — mantidas para compatibilidade com marcadores existentes ══════
  abre_caminho: h(
    "abre_caminho", "Abre-Caminho", "erva", "quente", "medio",
    "Atenção: verificar composição; algumas versões contêm ervas agressivas.",
    ["Exu", "Ogum"],
    ["Abertura de Caminhos", "Destravamento", "Prosperidade", "Movimento"],
  ),
  acoita_cavalo: h(
    "acoita_cavalo", "Açoita-Cavalo", "arvore", "morna", "medio",
    "Seguro.",
    ["Caboclos", "Oxóssi"],
    ["Resistência", "Firmeza", "Força", "Estrutura"],
  ),
  alfavaca: h(
    "alfavaca", "Alfavaca", "erva", "morna", "baixo",
    "Seguro.",
    ["Oxóssi", "Oxum"],
    ["Harmonia", "Equilíbrio", "Bem-Estar", "Limpeza Suave"],
  ),
  amora: h(
    "amora", "Amora", "arvore", "morna", "baixo",
    "Seguro.",
    ["Oxum", "Ibeji"],
    ["Afeto", "Vitalidade", "Equilíbrio", "Doçura"],
  ),
  cana_do_brejo: h(
    "cana_do_brejo", "Cana-do-Brejo", "erva", "fria", "medio",
    "Seguro.",
    ["Nanã", "Obaluaiê"],
    ["Purificação", "Desintoxicação", "Alívio", "Equilíbrio"],
  ),
  carqueja: h(
    "carqueja", "Carqueja", "erva", "fria", "medio",
    "Seguro.",
    ["Obaluaiê", "Nanã"],
    ["Limpeza", "Equilíbrio", "Purificação", "Resistência"],
  ),
  coentro: h(
    "coentro", "Coentro", "erva", "morna", "baixo",
    "Seguro.",
    ["Oxóssi", "Ogum"],
    ["Força", "Movimento", "Abertura", "Vitalidade"],
  ),
  confrei: h(
    "confrei", "Confrei", "erva", "fria", "medio",
    "Atenção: uso interno prolongado pode ser hepatotóxico.",
    ["Obaluaiê", "Nanã"],
    ["Regeneração", "Cuidado", "Proteção", "Reparo"],
  ),
  espada_de_sao_jorge: h(
    "espada_de_sao_jorge", "Espada-de-São-Jorge", "erva", "quente", "medio",
    "Seguro. Não ingerir.",
    ["Ogum", "Iansã"],
    ["Proteção", "Barreira Energética", "Defesa", "Firmeza"],
  ),
  espinheira_santa: h(
    "espinheira_santa", "Espinheira-Santa", "arvore", "morna", "medio",
    "Seguro.",
    ["Oxóssi", "Nanã"],
    ["Proteção", "Equilíbrio", "Resguardo", "Cuidado"],
  ),
  jurema_preta: h(
    "jurema_preta", "Jurema Preta", "arvore", "morna", "medio",
    "Seguro.",
    ["Caboclos", "Oxóssi", "Ossain"],
    ["Firmeza", "Ancestralidade", "Defesa", "Conexão Espiritual"],
  ),
  jurubeba: h(
    "jurubeba", "Jurubeba", "erva", "quente", "medio",
    "Seguro.",
    ["Ogum", "Exu"],
    ["Descarrego", "Força", "Resistência", "Movimento"],
  ),
  lirio_branco: h(
    "lirio_branco", "Lírio Branco", "flor", "fria", "medio",
    "Seguro.",
    ["Oxalá", "Nanã"],
    ["Serenidade", "Purificação", "Respeito", "Equilíbrio"],
  ),
  melissa: h(
    "melissa", "Melissa", "erva", "fria", "baixo",
    "Seguro.",
    ["Oxum", "Oxalá"],
    ["Calma", "Suavidade", "Bem-Estar", "Equilíbrio"],
  ),
  rosa_vermelha: h(
    "rosa_vermelha", "Rosa Vermelha", "flor", "morna", "baixo",
    "Seguro.",
    ["Ibeji", "Yabás", "Pombo-Gira"],
    ["Amor", "Sensualidade", "Atração", "Vitalidade"],
  ),
  rosas_brancas: h(
    "rosas_brancas", "Rosas Brancas", "flor", "fria", "baixo",
    "Seguro.",
    ["Oxalá", "Iemanjá", "Oxum"],
    ["Paz", "Pureza", "Elevação", "Harmonia"],
  ),
};

export const DEFAULT_HERB_KEY: HerbKey = "arruda";

const NAME_TO_KEY: Record<string, HerbKey> = {
  alecrim: "alecrim",
  alfazema: "alfazema",
  alho: "alho",
  "anis estrelado": "anis_estrelado",
  "anis-estrelado": "anis_estrelado",
  anis: "anis_estrelado",
  aroeira: "aroeira",
  arruda: "arruda",
  babosa: "babosa",
  beladona: "beladona",
  benjoim: "benjoim",
  "bico de papagaio": "bico_de_papagaio",
  "bico-de-papagaio": "bico_de_papagaio",
  boldo: "boldo",
  "tapete de oxalá": "boldo",
  "calendula": "calendula",
  calêndula: "calendula",
  camomila: "camomila",
  "cana de açúcar": "cana_de_acucar",
  "cana-de-açúcar": "cana_de_acucar",
  "capim cidreira": "capim_cidreira",
  "capim santo": "capim_cidreira",
  "erva cidreira": "capim_cidreira",
  "comigo ninguem pode": "comigo_ninguem_pode",
  "comigo ninguém pode": "comigo_ninguem_pode",
  "comigo-ninguém-pode": "comigo_ninguem_pode",
  "copo de leite": "copo_de_leite",
  "copo-de-leite": "copo_de_leite",
  "cravo da india": "cravo_da_india",
  "cravo da índia": "cravo_da_india",
  "cravo-da-índia": "cravo_da_india",
  "dama da noite": "dama_da_noite",
  "erva doce": "erva_doce",
  "erva-doce": "erva_doce",
  "erva de santa luzia": "erva_santa_luzia",
  "erva santa luzia": "erva_santa_luzia",
  eucalipto: "eucalipto",
  "folha de fogo": "folha_de_fogo",
  girassol: "girassol",
  guine: "guine",
  guiné: "guine",
  hortela: "hortela",
  hortelã: "hortela",
  jasmim: "jasmim",
  levante: "levante",
  louro: "louro",
  maçã: "maca",
  "folha de maçã": "maca",
  macela: "macela",
  marcela: "macela",
  malva: "malva",
  mamona: "mamona",
  manjericao: "manjericao",
  manjericão: "manjericao",
  manjerona: "manjerona",
  mirra: "mirra",
  patchouly: "patchouly",
  "pata de vaca": "pata_de_vaca",
  peregun: "peregun",
  "pau d'água": "peregun",
  "picao preto": "picao_preto",
  "picão preto": "picao_preto",
  "pinhao roxo": "pinhao_roxo",
  "pinhão roxo": "pinhao_roxo",
  "pinhão branco": "pinhao_roxo",
  pitanga: "pitanga",
  "quebra pedra": "quebra_pedra",
  "quebra-pedra": "quebra_pedra",
  "quebra demanda": "quebra_pedra",
  roma: "roma",
  romã: "roma",
  rosas: "rosas",
  "rosa branca": "rosas_brancas",
  "rosas brancas": "rosas_brancas",
  "rosa vermelha": "rosa_vermelha",
  saiao: "saiao",
  saião: "saiao",
  "folha da costa": "saiao",
  salsa: "salsa",
  salsão: "salsa",
  salvia: "salvia",
  sálvia: "salvia",
  samambaia: "samambaia",
  "sao goncalinho": "sao_goncalinho",
  "são gonçalinho": "sao_goncalinho",
  trombeteira: "trombeteira",
  "saia branca": "trombeteira",
  urtiga: "urtiga",
  // legado
  "abre caminho": "abre_caminho",
  "espada de sao jorge": "espada_de_sao_jorge",
  "espada de são jorge": "espada_de_sao_jorge",
  jurema: "jurema_preta",
  "jurema preta": "jurema_preta",
  "lirio branco": "lirio_branco",
  "lírio branco": "lirio_branco",
  alfavaca: "alfavaca",
  amora: "amora",
  "cana do brejo": "cana_do_brejo",
  coentro: "coentro",
  jurubeba: "jurubeba",
  melissa: "melissa",
  confrei: "confrei",
  "acoita-cavalo": "acoita_cavalo",
  "açoita-cavalo": "acoita_cavalo",
  carqueja: "carqueja",
  "espinheira santa": "espinheira_santa",
};

export function isHerbKey(value: string): value is HerbKey {
  return value in HERB_CATALOG;
}

export function getHerbDetails(key: HerbKey): HerbDetails {
  return HERB_CATALOG[key];
}

export function findBestHerbKeyByName(name: string): HerbKey {
  const normalized = name.trim().toLowerCase();
  const mapped = NAME_TO_KEY[normalized];
  if (mapped) return mapped;

  const found = (Object.keys(HERB_CATALOG) as HerbKey[]).find(
    (key) => HERB_CATALOG[key].label.toLowerCase() === normalized,
  );

  return found ?? DEFAULT_HERB_KEY;
}
