export const SQLITE_DDL = [
`CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id TEXT NOT NULL,
  dataset_id TEXT NOT NULL,
  decision TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL
)`,
`CREATE TABLE IF NOT EXISTS rate_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  at INTEGER NOT NULL
)`,
];

export const PG_DDL = [
`CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  owner_id TEXT NOT NULL,
  dataset_id TEXT NOT NULL,
  decision TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL
)`,
`CREATE TABLE IF NOT EXISTS rate_events (
  id SERIAL PRIMARY KEY,
  owner_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  at INTEGER NOT NULL
)`,
];
