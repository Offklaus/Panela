-- Posição do jogador (specs/003-player-positions/data-model.md). NULL = sem posição, o estado dos
-- jogadores cadastrados antes desta feature.

ALTER TABLE players ADD COLUMN position TEXT CHECK (position IN ('ATA', 'DEF'));
