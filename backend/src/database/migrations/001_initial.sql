-- Esquema inicial (specs/001-roster-team-draw/data-model.md). Datas em ISO 8601 UTC.

CREATE TABLE organizers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organizer_id INTEGER NOT NULL REFERENCES organizers (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX sessions_organizer_idx ON sessions (organizer_id);

CREATE TABLE password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organizer_id INTEGER NOT NULL REFERENCES organizers (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT
);

CREATE INDEX password_resets_organizer_idx ON password_resets (organizer_id, created_at);

CREATE TABLE login_throttle (
  email TEXT PRIMARY KEY,
  failed_count INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organizer_id INTEGER NOT NULL REFERENCES organizers (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_key TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  present INTEGER NOT NULL DEFAULT 1 CHECK (present IN (0, 1)),
  created_at TEXT NOT NULL,
  UNIQUE (organizer_id, name_key)
);

CREATE TABLE draws (
  organizer_id INTEGER PRIMARY KEY REFERENCES organizers (id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  teams_json TEXT NOT NULL,
  bench_json TEXT NOT NULL,
  stale INTEGER NOT NULL DEFAULT 0 CHECK (stale IN (0, 1))
);
