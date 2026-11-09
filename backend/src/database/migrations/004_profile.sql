-- Craque, o perfil de jogador da conta (specs/006-craque-profile/data-model.md): no máximo um por
-- conta. A idade não é guardada; o backend calcula a partir de birth_date.

CREATE TABLE profiles (
  organizer_id INTEGER PRIMARY KEY REFERENCES organizers (id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  birth_date DATE NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('ATA', 'DEF')),
  foot TEXT NOT NULL CHECK (foot IN ('right', 'left', 'both')),
  updated_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
