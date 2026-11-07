# Data Model: Posição dos jogadores e sorteio por posição

**Feature**: `003-player-positions` | **Date**: 2026-11-06 | **Plan**: [plan.md](plan.md)

Mudanças em relação ao [data-model da 001](../001-roster-team-draw/data-model.md).

## Constante de domínio nova

| Constante | Valor | Origem |
|-----------|-------|--------|
| `POSITIONS` | `ATA`, `DEF` | FR-001 |

Fica em `backend/src/config/domain.js`, com as demais (Princípio III).

## Banco

### players (coluna nova)

| Campo | Tipo | Regras |
|-------|------|--------|
| `position` | TEXT NULL, `CHECK (position IN ('ATA', 'DEF'))` | `NULL` = sem posição, só para jogadores cadastrados antes desta feature (FR-001). Obrigatório no cadastro (FR-002). Depois de definido, só alterna entre ATA e DEF (FR-005) |

Migração: `backend/src/database/migrations/002_player_position.sql`, aplicada ao subir o backend.
Os jogadores existentes ficam com `NULL`.

### draws

Sem mudança. As contagens por posição e a posição em falta são calculadas na leitura
([research.md §7](research.md)).

## Regras do sorteio (substituem a parte correspondente da 001)

Com `T` times e `B` jogadores no banco:

1. **Bloqueio** (FR-007): com `T ≥ 2` possível e algum presente sem posição, não há sorteio.
2. **Banco** (FR-010, FR-011): sorteado; um jogador não vai para o banco se a posição dele ficaria
   com menos de `T` jogadores. Cota de banco por posição: `max(0, presentes da posição − T)`.
3. **Divisão** (FR-012): as quantidades de ATA de dois times quaisquer diferem em no máximo 1, e o
   mesmo vale para DEF; todo time tem 5 jogadores.
4. **Equilíbrio** (FR-013): nenhuma troca entre jogadores da mesma posição de dois times diminui a
   diferença de estrelas entre eles.
5. **Posição em falta** (FR-017): a posição com menos jogadores do que `T` nos times, se houver.

## Estado de tela no frontend

| Campo | Tipo | Origem | Muda quando |
|-------|------|--------|-------------|
| `pendingPositions` | `number \| null` | **novo**: `missingPositions` do erro `POSITIONS_MISSING` | recebe o número no sorteio bloqueado; volta a `null` em qualquer alteração do elenco, da presença ou da posição, num sorteio com times e ao sair |

O formulário guarda a última posição escolhida só em memória, dentro do componente; recarregar a
página volta a `null` (FR-003).
