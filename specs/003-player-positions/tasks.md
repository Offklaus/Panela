---

description: "Task list for feature 003-player-positions"
---

# Tasks: Posição dos jogadores e sorteio por posição

**Input**: Design documents from `/specs/003-player-positions/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/api.md](contracts/api.md), [quickstart.md](quickstart.md)

**Tests**: obrigatórios. A constituição (Princípio IV, inegociável) exige teste para cada regra do
sorteio e teste de integração para cada endpoint alterado. Em cada história, os testes vêm antes da
implementação e devem falhar primeiro.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- `backend/src/`, `backend/tests/`, `frontend/src/`, `frontend/tests/`.
- Códigos de erro, campos e textos: sempre os de [contracts/api.md](contracts/api.md); regras: as de
  [data-model.md](data-model.md).
- Referência visual: quadros "Elenco · celular", "Elenco · faltam jogadores", "Elenco · posição
  pendente", "Times · celular" e "Times · falta de posição" do canvas Times de Society.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend/src/database/migrations/002_player_position.sql adding `position TEXT CHECK (position IN ('ATA', 'DEF'))` (nullable) to `players` (research §1)
- [X] T002 [P] Export `POSITIONS = Object.freeze(['ATA', 'DEF'])` from backend/src/config/domain.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Update the existing backend tests so every player they create has a position: helpers and calls in backend/tests/unit/rosterService.test.js, backend/tests/unit/drawService.test.js, backend/tests/unit/teamBalancer.test.js (`makePlayers` alternates ATA and DEF; the FR-024 check becomes "no swap between players of the same position improves the difference"), backend/tests/integration/players.test.js and backend/tests/integration/draw.test.js; the suite must still pass
- [X] T004 Update backend/src/models/playerModel.js: `position` in the SELECT and in `insert`, and a new `updatePosition(db, organizerId, id, position)`

**Checkpoint**: `npm test` passes in backend/ with the migration applied.

---

## Phase 3: User Story 1 - Cadastrar e ajustar a posição de cada jogador (Priority: P1) 🎯 MVP

**Goal**: o cadastro exige ATA ou DEF, a lista mostra a etiqueta e um toque troca a posição; jogadores antigos aparecem "Sem posição".

**Independent Test**: cadastrar sem posição (erro "Escolha a posição."), cadastrar como DEF, trocar para ATA pela etiqueta e ver um jogador antigo "Sem posição".

### Tests for User Story 1

- [X] T005 [P] [US1] Add unit tests to backend/tests/unit/rosterService.test.js: `addPlayer` without position or with an invalid one fails with VALIDATION_ERROR, `field: 'position'`, "Escolha a posição."; with DEF it stores DEF; `updatePlayer` with `{ position: 'ATA' }` changes it and marks the draw stale; a player inserted without position is listed with `position: null`
- [X] T006 [P] [US1] Add integration tests to backend/tests/integration/players.test.js: `POST /api/players` without `position` → 400 with `field: "position"`; with `position: "DEF"` → 201 and the player has `position: "DEF"`; `PATCH /api/players/:id` with `{ position: "ATA" }` → 200; with `{ position: "GOL" }` → 400

### Implementation for User Story 1

- [X] T007 [US1] Add `validatePosition` to backend/src/validators/playerValidator.js (ATA or DEF, message "Escolha a posição.", `field: 'position'`); `validateNewPlayer` requires it and `validatePlayerUpdate` accepts it as optional
- [X] T008 [US1] Update backend/src/services/rosterService.js: `addPlayer` stores the position; `updatePlayer` calls `playerModel.updatePosition` when `position` is present (T005 and T006 pass)
- [X] T009 [P] [US1] Update frontend/src/services/rosterApi.js so `addPlayer` sends `{ name, rating, position }`
- [X] T010 [US1] Update frontend/src/components/player-form/playerForm.js: after "Nível", a "Posição" row with two buttons "ATA" (`aria-label` "ATA (ataque)") and "DEF" ("DEF (defesa)") with `aria-pressed`; the position starts `null`, is sent on submit and is kept after a successful add; a second error element below the "Posição" row shows errors with `field === 'position'` (research §9)
- [X] T011 [US1] Update frontend/src/components/roster/rosterRow.js: the row has two lines — line 1 with initials + name, a 44 px position button (visible tag "ATA", "DEF" or "Sem posição"; `aria-label` "Posição de {nome}: ATA (ataque)" / "DEF (defesa)" / "sem posição") and remove; line 2 with stars and presence; the button calls `onPosition(player)`
- [X] T012 [US1] Pass `onPosition` through frontend/src/components/roster/roster.js and handle it in frontend/src/rosterView.js: next position is DEF when the current one is ATA, otherwise ATA; save with `rosterApi.updatePlayer(player.id, { position })` through the existing save flow
- [X] T013 [US1] Update frontend/src/styles/roster.css: the two-line row (flex lines instead of the grid, so 5 stars + presence still fit 360 px), the position tag (ATA filled ink, DEF outlined, "Sem posição" dashed muted) and the "Posição" button group (selected = ink background), all 44 px touch targets

**Checkpoint**: cadastro com posição e troca pela etiqueta funcionam; os testes do backend passam.

---

## Phase 4: User Story 2 - Sortear times com atacantes e defensores divididos (Priority: P2)

**Goal**: o sorteio espalha ATA e DEF por igual e equilibra as estrelas trocando só jogadores da mesma posição; times e jogadores mostram as posições.

**Independent Test**: com 6 ATA e 4 DEF, sortear várias vezes e ver sempre "3 ATA · 2 DEF" em cada time.

### Tests for User Story 2

- [X] T014 [P] [US2] Add unit tests to backend/tests/unit/teamBalancer.test.js: with 6 ATA and 4 DEF (10 players) every team has 3 ATA and 2 DEF for 30 seeds; with 7 ATA and 8 DEF (15 players) the ATA counts of any two teams differ by at most 1 (same for DEF); for random rosters with positions and many seeds, every player appears once and no swap between same-position players of two teams lowers their difference (FR-013); different seeds can produce different teams
- [X] T015 [P] [US2] Add unit tests to backend/tests/unit/drawService.test.js: `getDraw` returns `position` on every player ref and bench ref, `positions: { ATA, DEF }` on every team and `positionShortage: null` when every position has at least one player per team
- [X] T016 [P] [US2] Add an integration test to backend/tests/integration/draw.test.js: with 10 present players (6 ATA, 4 DEF), `POST /api/draw` returns teams with `positions` `{ ATA: 3, DEF: 2 }` and players with `position`
- [X] T017 [P] [US2] Add tests to frontend/tests/format.test.js for `positionCountText({ ATA: 3, DEF: 2 })` → `'3 ATA · 2 DEF'`

### Implementation for User Story 2

- [X] T018 [US2] Update backend/src/services/teamBalancer.js (research §5 and §6): after the bench, per-position quotas per team (`⌊c/T⌋`, extra ATA slots on randomly chosen teams, extra DEF on the others); the greedy assignment respects those quotas; `refine` only swaps players of the same position (T014 passes)
- [X] T019 [US2] Update backend/src/services/drawService.js `getDraw`: refs carry `position`, each team gets `positions: { ATA, DEF }`, and the draw gets `positionShortage` (the position with fewer players than teams among the team players, with `count` and `teams`, or `null`) (T015 and T016 pass)
- [X] T020 [US2] Add `positionCountText(positions)` to frontend/src/utils/format.js (T017 passes)
- [X] T021 [US2] Update frontend/src/components/teams/teamCard.js (positions line under the team name, position tag before each player's stars), frontend/src/components/bench/bench.js (position in each chip) and frontend/src/styles/teams.css (dark tags: ATA filled, DEF outlined)

**Checkpoint**: sorteios com posição corretos na API e na tela de times.

---

## Phase 5: User Story 3 - Saber o que impede ou limita o sorteio (Priority: P3)

**Goal**: presentes sem posição bloqueiam o sorteio com aviso; o banco não tira jogadores de uma posição no limite; posição em falta aparece na tela de times.

**Independent Test**: 11 presentes com 2 sem posição → aviso no Elenco; 10 presentes com 1 DEF → "Só 1 defensor para 2 times."; 11 presentes com 2 DEF → o banco é sempre um atacante.

### Tests for User Story 3

- [X] T022 [P] [US3] Add unit tests to backend/tests/unit/teamBalancer.test.js: with 11 players (2 DEF, 9 ATA) the bench is always an ATA and each team has 1 DEF, for 30 seeds; with 10 players (1 DEF) the DEF is in a team and the other team has 0 DEF; with 11 players and no position at the limit, each player reaches the bench over many seeds (equal chance kept)
- [X] T023 [P] [US3] Add unit tests to backend/tests/unit/drawService.test.js: with 11 present and 2 without position, `createDraw` fails with 409 POSITIONS_MISSING, "Defina a posição de 2 presentes para sortear.", `extra.missingPositions === 2`, and the previous draw is unchanged; with 9 present and some without position it saves a draw without teams; with 9 ATA and 1 DEF `positionShortage` is `{ position: 'DEF', count: 1, teams: 2 }`
- [X] T024 [P] [US3] Add an integration test to backend/tests/integration/draw.test.js: `POST /api/draw` with a present player without position (inserted directly in the test database) returns 409 with `code: "POSITIONS_MISSING"` and `missingPositions`
- [X] T025 [P] [US3] Add tests to frontend/tests/format.test.js for `pendingPositionsText` (1 → "Defina a posição de 1 presente para sortear.", 2 → "… 2 presentes …") and `positionShortageText` (`{ DEF, 0, 2 }` → "Nenhum defensor para 2 times.", `{ DEF, 1, 2 }` → "Só 1 defensor para 2 times.", `{ ATA, 2, 3 }` → "Só 2 atacantes para 3 times.")

### Implementation for User Story 3

- [X] T026 [US3] Update backend/src/services/teamBalancer.js: the bench walks the shuffled list and only takes a player while his position quota `max(0, count − teams)` is above zero (research §4) (T022 passes)
- [X] T027 [US3] Update backend/src/services/drawService.js `createDraw`: inside the transaction, with at least `MIN_TEAMS × TEAM_SIZE` present players and any without position, throw `AppError(409, 'POSITIONS_MISSING', …, { extra: { missingPositions } })` before saving (T023 and T024 pass)
- [X] T028 [US3] Add `pendingPositionsText(count)` and `positionShortageText(shortage)` to frontend/src/utils/format.js (T025 passes)
- [X] T029 [US3] Carry `missingPositions` in `ApiError` (frontend/src/services/apiClient.js); in frontend/src/screenActions.js `drawTeams` stores `pendingPositions` on POSITIONS_MISSING (no generic notice) and clears it on a draw with teams and on sign out; add `pendingPositions: null` to the store in frontend/src/main.js; in frontend/src/rosterView.js show `pendingPositionsText` in the draw bar (before the shortfall text) and clear it on every roster, presence or position change
- [X] T030 [US3] Show the shortage warning (`role="status"`, `positionShortageText(draw.positionShortage)`) above the balance in frontend/src/components/teams/teams.js

**Checkpoint**: as três histórias funcionam juntas.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T031 [P] Bring the changes of specs/003-player-positions/contracts/api.md into specs/001-roster-team-draw/contracts/api.md (types, `POSITIONS_MISSING`, endpoints), the project's single API contract
- [X] T032 [P] Add `players.position` and `POSITIONS` to specs/001-roster-team-draw/data-model.md, pointing to feature 003
- [X] T033 Run `npm test` in backend/ and frontend/ and `npx vite build` in frontend/; everything passes
- [X] T034 Run the manual script of specs/003-player-positions/quickstart.md in the browser at 360 px; fix what fails

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: after Setup — BLOCKS all user stories
- **US1 (Phase 3)**: after Phase 2
- **US2 (Phase 4)**: after Phase 2; to try it in the app, players need positions (US1)
- **US3 (Phase 5)**: T026 after T018 (same file); T027 after T019; T029 after T012
- **Polish (Phase 6)**: after the stories; T033 and T034 last

### Within Each User Story

- Tests first, failing; then backend; then frontend
- Same file → sequential (teamBalancer.js: T018 then T026; drawService.js: T019 then T027; format.js: T020 then T028)

### Parallel Opportunities

- T001 and T002
- US1: T005, T006 and T009 together
- US2: T014, T015, T016 and T017 together
- US3: T022, T023, T024 and T025 together
- T031 and T032 any time

---

## Parallel Example: User Story 2

```bash
# Tests first, together:
Task: "T014 teamBalancer position split and same-position swaps"
Task: "T015 drawService positions and positionShortage"
Task: "T016 draw endpoint with positions"
Task: "T017 positionCountText"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2
2. Phase 3 (US1): positions can be registered and changed
3. **STOP and VALIDATE**

### Incremental Delivery

1. Foundation → US1 (positions) → US2 (split draw) → US3 (block, bench, shortage)
2. Each story keeps the previous ones working
3. Polish: contracts, data model, full test run and manual script
