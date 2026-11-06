-- Esquema inicial (specs/001-roster-team-draw/data-model.md).

CREATE TABLE organizers (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE sessions (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organizer_id INTEGER NOT NULL REFERENCES organizers (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX sessions_organizer_idx ON sessions (organizer_id);

CREATE TABLE password_resets (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organizer_id INTEGER NOT NULL REFERENCES organizers (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);

CREATE INDEX password_resets_organizer_idx ON password_resets (organizer_id, created_at);

CREATE TABLE login_throttle (
  email TEXT PRIMARY KEY,
  failed_count INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE players (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organizer_id INTEGER NOT NULL REFERENCES organizers (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_key TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  present BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL,
  UNIQUE (organizer_id, name_key)
);

CREATE TABLE draws (
  organizer_id INTEGER PRIMARY KEY REFERENCES organizers (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL,
  teams_json JSONB NOT NULL,
  bench_json JSONB NOT NULL,
  stale BOOLEAN NOT NULL DEFAULT FALSE
);

-- O backend conecta como dono das tabelas e não é afetado pelo RLS. Sem políticas, a API pública
-- que o Supabase expõe sobre o schema public não consegue ler nem alterar nada.
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_throttle ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
