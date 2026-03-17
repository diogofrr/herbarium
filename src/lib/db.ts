import "server-only";

import Database from "better-sqlite3";
import { mkdirSync, existsSync, readFileSync, renameSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "data");
mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(join(DATA_DIR, "herbs.db"));

// WAL = concurrent reads don't block writes; much faster for a web app
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS herb_markers (
    id              TEXT PRIMARY KEY,
    herb_key        TEXT NOT NULL,
    herb_name       TEXT NOT NULL,
    classification  TEXT NOT NULL,
    energy_temp     TEXT NOT NULL,
    allergy_risk    TEXT NOT NULL,
    warning_note    TEXT NOT NULL DEFAULT '',
    saint_tags      TEXT NOT NULL DEFAULT '[]',
    properties      TEXT NOT NULL DEFAULT '[]',
    notes           TEXT NOT NULL DEFAULT '',
    status          TEXT NOT NULL DEFAULT 'muita',
    address_label   TEXT NOT NULL DEFAULT '',
    lat             REAL NOT NULL,
    lng             REAL NOT NULL,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_status   ON herb_markers(status);
  CREATE INDEX IF NOT EXISTS idx_updated  ON herb_markers(updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_herb_key ON herb_markers(herb_key);
`);

// ── One-time migration from herbs.json ───────────────────────────────────────
const jsonPath = join(DATA_DIR, "herbs.json");
const migratedPath = join(DATA_DIR, "herbs.json.migrated");

if (existsSync(jsonPath) && !existsSync(migratedPath)) {
  try {
    const count = (db.prepare("SELECT COUNT(*) AS n FROM herb_markers").get() as { n: number }).n;
    if (count === 0) {
      const raw = readFileSync(jsonPath, "utf8");
      const rows: Record<string, unknown>[] = JSON.parse(raw);

      const insert = db.prepare(`
        INSERT OR IGNORE INTO herb_markers
          (id, herb_key, herb_name, classification, energy_temp, allergy_risk,
           warning_note, saint_tags, properties, notes, status, address_label,
           lat, lng, created_at, updated_at)
        VALUES
          (@id, @herb_key, @herb_name, @classification, @energy_temp, @allergy_risk,
           @warning_note, @saint_tags, @properties, @notes, @status, @address_label,
           @lat, @lng, @created_at, @updated_at)
      `);

      const migrate = db.transaction((entries: Record<string, unknown>[]) => {
        for (const row of entries) {
          if (typeof row.id !== "string" || typeof row.lat !== "number") continue;
          insert.run({
            id: row.id,
            herb_key: row.herbKey ?? "arruda",
            herb_name: row.herbName ?? "",
            classification: row.classification ?? "erva",
            energy_temp: row.energyTemperature ?? "morna",
            allergy_risk: row.allergyRisk ?? "baixo",
            warning_note: row.warningNote ?? "",
            saint_tags: JSON.stringify(Array.isArray(row.saintTags) ? row.saintTags : []),
            properties: JSON.stringify(Array.isArray(row.properties) ? row.properties : []),
            notes: typeof row.notes === "string" ? row.notes : "",
            status: row.status === "pouca" ? "pouca" : "muita",
            address_label: typeof row.addressLabel === "string" ? row.addressLabel : "",
            lat: row.lat,
            lng: row.lng,
            created_at: typeof row.createdAt === "string" ? row.createdAt : new Date().toISOString(),
            updated_at: typeof row.updatedAt === "string" ? row.updatedAt : new Date().toISOString(),
          });
        }
      });

      migrate(rows);
    }

    renameSync(jsonPath, migratedPath);
  } catch {
    // migration failure is non-fatal; app continues with empty or partial data
  }
}

export default db;
