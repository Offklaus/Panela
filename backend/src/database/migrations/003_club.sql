-- Time do MyTeam (specs/005-myteam-club/data-model.md): no máximo um por conta. Os jogadores
-- continuam ligados à conta, então o elenco do time é o elenco da conta.

CREATE TABLE clubs (
  organizer_id INTEGER PRIMARY KEY REFERENCES organizers (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL CHECK (icon IN ('ball', 'shield', 'bolt', 'star', 'crown', 'flame', 'trophy', 'target')),
  created_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;