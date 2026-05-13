import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { dirname } from "path";
import { CONFIG } from "./config.js";

mkdirSync(dirname(CONFIG.DB_PATH), { recursive: true });

const db = new Database(CONFIG.DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS token_usage (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id         TEXT UNIQUE NOT NULL,
    model              TEXT NOT NULL,
    prompt_tokens      INTEGER NOT NULL DEFAULT 0,
    completion_tokens  INTEGER NOT NULL DEFAULT 0,
    cache_hit_tokens   INTEGER NOT NULL DEFAULT 0,
    cache_miss_tokens  INTEGER NOT NULL DEFAULT 0,
    total_tokens       INTEGER NOT NULL DEFAULT 0,
    actual_cost        REAL DEFAULT 0,
    recorded_at        TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_recorded_at ON token_usage(recorded_at);
  CREATE INDEX IF NOT EXISTS idx_model ON token_usage(model);
`);

// Add columns if they don't exist (for migration from old schema)
for (const col of ["cache_hit_tokens", "cache_miss_tokens", "actual_cost"]) {
  try { db.exec(`ALTER TABLE token_usage ADD COLUMN ${col} INTEGER NOT NULL DEFAULT 0`); } catch { /* already exists */ }
}

export default db;
