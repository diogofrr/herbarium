import "server-only";

import { randomUUID } from "node:crypto";
import db from "@/lib/db";
import { DEFAULT_HERB_KEY, findBestHerbKeyByName, getHerbDetails } from "@/lib/herb-catalog";
import type {
  CreateHerbInput,
  HerbClassification,
  HerbKey,
  HerbMarker,
  HerbStatus,
  UpdateHerbInput,
} from "@/types/herb";

type ListOptions = {
  query?: string;
  status?: HerbStatus;
  classification?: HerbClassification;
};

// ── Row ↔ HerbMarker conversion ───────────────────────────────────────────────

type DbRow = {
  id: string;
  herb_key: string;
  herb_name: string;
  classification: string;
  energy_temp: string;
  allergy_risk: string;
  warning_note: string;
  saint_tags: string;
  properties: string;
  notes: string;
  status: string;
  address_label: string;
  lat: number;
  lng: number;
  created_at: string;
  updated_at: string;
};

function parseArray(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function rowToMarker(row: DbRow): HerbMarker {
  const herbKey = (row.herb_key ?? DEFAULT_HERB_KEY) as HerbKey;
  return {
    id: row.id,
    herbKey,
    herbName: row.herb_name,
    classification: (row.classification as HerbMarker["classification"]) ?? "erva",
    energyTemperature: (row.energy_temp as HerbMarker["energyTemperature"]) ?? "morna",
    allergyRisk: (row.allergy_risk as HerbMarker["allergyRisk"]) ?? "baixo",
    warningNote: row.warning_note ?? "",
    saintTags: parseArray(row.saint_tags),
    properties: parseArray(row.properties),
    notes: row.notes ?? "",
    status: row.status === "pouca" ? "pouca" : "muita",
    addressLabel: row.address_label ?? "",
    lat: row.lat,
    lng: row.lng,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Prepared statements (compiled once, reused on every call) ─────────────────

const stmtList = db.prepare(`
  SELECT * FROM herb_markers
  WHERE (@status = '' OR status = @status)
    AND (@classification = '' OR classification = @classification)
    AND (
      @q = ''
      OR herb_name      LIKE @q
      OR notes          LIKE @q
      OR address_label  LIKE @q
      OR saint_tags     LIKE @q
      OR properties     LIKE @q
    )
  ORDER BY updated_at DESC
`);

const stmtInsert = db.prepare(`
  INSERT INTO herb_markers
    (id, herb_key, herb_name, classification, energy_temp, allergy_risk,
     warning_note, saint_tags, properties, notes, status, address_label,
     lat, lng, created_at, updated_at)
  VALUES
    (@id, @herb_key, @herb_name, @classification, @energy_temp, @allergy_risk,
     @warning_note, @saint_tags, @properties, @notes, @status, @address_label,
     @lat, @lng, @created_at, @updated_at)
`);

const stmtFindById = db.prepare("SELECT * FROM herb_markers WHERE id = ?");

const stmtUpdate = db.prepare(`
  UPDATE herb_markers SET
    herb_key       = @herb_key,
    herb_name      = @herb_name,
    classification = @classification,
    energy_temp    = @energy_temp,
    allergy_risk   = @allergy_risk,
    warning_note   = @warning_note,
    saint_tags     = @saint_tags,
    properties     = @properties,
    notes          = @notes,
    status         = @status,
    address_label  = @address_label,
    updated_at     = @updated_at
  WHERE id = @id
`);

const stmtDelete = db.prepare("DELETE FROM herb_markers WHERE id = ?");

// ── Public API ─────────────────────────────────────────────────────────────────

export async function listHerbs(options: ListOptions = {}): Promise<HerbMarker[]> {
  const q = options.query?.trim() ? `%${options.query.trim()}%` : "";
  const rows = stmtList.all({
    status: options.status ?? "",
    classification: options.classification ?? "",
    q,
  }) as DbRow[];

  return rows.map(rowToMarker);
}

export async function createHerb(input: CreateHerbInput): Promise<HerbMarker> {
  const now = new Date().toISOString();
  const details = getHerbDetails(input.herbKey);

  const row = {
    id: randomUUID(),
    herb_key: input.herbKey,
    herb_name: details.label,
    classification: details.classification,
    energy_temp: details.energyTemperature,
    allergy_risk: details.allergyRisk,
    warning_note: details.warningNote,
    saint_tags: JSON.stringify(details.saintTags),
    properties: JSON.stringify(details.properties),
    notes: input.notes?.trim() ?? "",
    status: input.status,
    address_label: input.addressLabel?.trim() ?? "",
    lat: input.lat,
    lng: input.lng,
    created_at: now,
    updated_at: now,
  };

  stmtInsert.run(row);

  return rowToMarker({ ...row, saint_tags: row.saint_tags, properties: row.properties } as DbRow);
}

export async function updateHerb(id: string, patch: UpdateHerbInput): Promise<HerbMarker | null> {
  const current = stmtFindById.get(id) as DbRow | undefined;
  if (!current) return null;

  let merged = { ...current };

  if (patch.herbKey) {
    const details = getHerbDetails(patch.herbKey);
    merged = {
      ...merged,
      herb_key: patch.herbKey,
      herb_name: details.label,
      classification: details.classification,
      energy_temp: details.energyTemperature,
      allergy_risk: details.allergyRisk,
      warning_note: details.warningNote,
      saint_tags: JSON.stringify(details.saintTags),
      properties: JSON.stringify(details.properties),
    };
  }

  if (patch.status !== undefined) merged.status = patch.status;
  if (typeof patch.notes === "string") merged.notes = patch.notes.trim();
  if (typeof patch.addressLabel === "string") merged.address_label = patch.addressLabel.trim();

  merged.updated_at = new Date().toISOString();

  stmtUpdate.run({ ...merged, id });

  return rowToMarker(merged);
}

export async function deleteHerb(id: string): Promise<boolean> {
  const info = stmtDelete.run(id);
  return info.changes > 0;
}

// ── Legacy normalisation helper (kept for API routes that import it) ──────────
export function normalizeLegacyName(name: string): HerbKey {
  return findBestHerbKeyByName(name);
}
