---

description: "Task list for feature 002-mobile-screens"
---

# Tasks: Telas de celular para Elenco e Times

**Input**: Design documents from `/specs/002-mobile-screens/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/screens.md](contracts/screens.md),
[quickstart.md](quickstart.md)

**Tests**: só para o que é lógica pura no frontend (`utils/`), como pede o Princípio IV. Esta
feature não tem regra de negócio nova e não mexe no backend. Os testes vêm antes da implementação e
devem falhar primeiro. A parte visual é conferida no navegador pelo [quickstart.md](quickstart.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Só `frontend/src/` e `frontend/tests/`. Textos, rotas e nomes acessíveis: sempre os de
  [contracts/screens.md](contracts/screens.md); estado e transições: os de
  [data-model.md](data-model.md).
- Referência visual: quadros "Elenco · celular", "Elenco · faltam jogadores" e "Times · celular" do
  canvas Times de Society, com o ajuste de 360 px de [research.md §10](research.md).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 [P] Change the viewport meta in frontend/index.html to `width=device-width, initial-scale=1, viewport-fit=cover` (research §3)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Write unit tests in frontend/tests/screens.test.js: `hasTeams(null)` and `hasTeams({ teams: [] })` are false, `hasTeams({ teams: [team] })` is true; `routeAfterDraw` returns `'/times'` for a draw with teams and `'/'` for a draw without teams (they must fail before T004)
- [X] T003 [P] Add unit tests to frontend/tests/format.test.js for `presentCountText`: 0 → `'0 presentes'`, 1 → `'1 presente'`, 11 → `'11 presentes'` (they must fail before T005)
- [X] T004 [P] Create frontend/src/utils/screens.js exporting `hasTeams(draw)` and `routeAfterDraw(draw)` (research §5); T002 passes
- [X] T005 [P] Add `presentCountText(count)` to frontend/src/utils/format.js; T003 passes
- [X] T006 Update frontend/src/router.js (research §2 and §8): remember the previous path of the visit on every render; export `goBackTo(path)`, which calls `history.back()` when the previous path is `path` and otherwise `location.replace('#' + path)`; keep the scroll position of `'/'` in an in-memory Map when leaving it and restore it after the `'/'` view mounts; after any view mounts, focus the element with `data-screen-title` (an `h1` with `tabindex="-1"`)
- [X] T007 Create frontend/src/screenActions.js exporting `createScreenActions({ store, navigate })` with `handleError(error)` (UNAUTHENTICATED → `signOut()`, marks `error.handled`; other errors → `showNotice`), `signOut()` (clears organizer, roster, draw and shortfall, then navigates to `/entrar`), `logout()` (moved from frontend/src/homeView.js) and `drawTeams()` (calls `drawApi.createDraw()`, sets `draw` and `shortfall` — `null` when `hasTeams(draw)`, else `draw.missingPlayers` — and returns the draw; on error calls `handleError` and returns `null`)
- [X] T008 Create frontend/src/components/draw-bar/drawBar.js exporting `createDrawBar({ label, onDraw, lastTeamsHref })`: a `<footer class="draw-bar">` with `<p class="draw-bar-notice" role="status" hidden>`, `<button type="button" class="draw-button">` (swap icon, label, `<span class="draw-count">`), and, when `lastTeamsHref` is given, `<a class="draw-bar-link" hidden>Ver últimos times</a>`; `update({ countText, shortfallText, showLastTeams })`; the button stays `disabled` while `onDraw()` is pending (FR-011)
- [X] T009 Update frontend/src/styles/base.css (research §3, §7 and §9): `.screen` (flex column, `min-height: 100dvh`), `.screen-main` (`flex: 1`, width up to 640 px, centered, 16 px side padding), `.draw-bar` (`position: sticky; bottom: 0`, bottom padding `max(16px, env(safe-area-inset-bottom))`, ground background, top border and shadow, content centered up to 640 px), `.draw-button` moved here from teams.css as a full-width 56 px button, `.draw-count`, `.draw-bar-notice` (error colors of the canvas), `.draw-bar-link` (44 px tall); move `.notice` to the top (`top: max(16px, env(safe-area-inset-top))`); remove `.page`, `.container`, `.header-side`, `.header-stats`, `.stat`, `.stat-value` and `.brand-tagline`

**Checkpoint**: `npm test` passes in frontend/ (format, screens, rules, store, vests).

---

## Phase 3: User Story 1 - Elenco como tela inicial, com o sorteio sempre à mão (Priority: P1) 🎯 MVP

**Goal**: depois de entrar, o Elenco aparece sem o resumo, e o botão "Sortear times · N presentes" fica fixo embaixo.

**Independent Test**: em 360 px, entrar numa conta com 30 jogadores, rolar a lista inteira e conferir que o botão fica visível o tempo todo, que o último jogador aparece inteiro e que os quadros "Presentes", "Times" e "Média" não existem.

- [X] T010 [P] [US1] Update frontend/src/components/header/header.js to show only the brand (logo + "Times de Society") and the "Sair" button; remove the stats and the `update` method
- [X] T011 [P] [US1] Update frontend/src/components/roster/rosterRow.js so the row children follow the visual order: player (initials + name), remove button, star rating, presence button (research §10)
- [X] T012 [P] [US1] Update frontend/src/components/player-form/playerForm.js to the order of the canvas: label "Novo jogador"; a row with the name input and "Adicionar"; the error message; a row with "Nível" and the stars (research §11)
- [X] T013 [US1] Update frontend/src/components/roster/roster.js: the title becomes `<h1 id="roster-title" class="display section-title" tabindex="-1" data-screen-title>` "Elenco · N"; "Todos presentes" and "Limpar" sit side by side on their own row, each taking half the width
- [X] T014 [US1] Update frontend/src/styles/roster.css: remove `.columns`; `.roster-row` becomes a two-row grid (areas `player remove` / `stars presence`); presence button `min-width: 104px`; new player form rows; below 400 px wide the roster card has no side margin, side borders or radius (research §10)
- [X] T015 [US1] Create frontend/src/rosterView.js (replaces frontend/src/homeView.js): header, roster card (`createRoster` + `createPlayerForm` with `levels` and `rules.defaultRating`) inside `.screen-main`, and `createDrawBar({ label: 'Sortear times', onDraw })` as the last child of `.screen`; `update` the bar with `presentCountText(roster.summary.presentCount)`; `onDraw` calls `actions.drawTeams()` and, when it returns a draw, `navigate(routeAfterDraw(draw))` only if that is `'/times'`; load the roster on mount; every roster change goes through the existing save flow (store update + draw refresh when a draw exists)
- [X] T016 [US1] Update frontend/src/main.js: add `shortfall: null` to the initial store; route `'/'` to `rosterView`; remove the `homeView` import; delete frontend/src/homeView.js

**Checkpoint**: Elenco funciona sozinho em 360 px e no computador; o botão fica fixo e conta os presentes.

---

## Phase 4: User Story 2 - Ver os times numa tela própria (Priority: P2)

**Goal**: sortear abre "Times da rodada"; "Sortear de novo" fica fixo embaixo; "← Elenco" e o voltar do aparelho levam ao Elenco.

**Independent Test**: com 11 presentes, sortear pelo Elenco, sortear de novo na tela de times, recarregar a página, voltar pelo "← Elenco" e, depois de abrir de novo, pelo voltar do navegador (um segundo voltar não reabre os times).

- [X] T017 [P] [US2] Create frontend/src/components/header/backHeader.js exporting `createBackHeader({ onBack })`: a header with a 44 px button showing an arrow icon and "Elenco", `aria-label="Voltar ao elenco"`
- [X] T018 [US2] Update frontend/src/components/teams/teams.js: `createTeams({ levels, footer })` builds the content of the times screen (the times screen only opens with teams, so the missing-players text is no longer needed here) — `<h1 class="display teams-title" tabindex="-1" data-screen-title>` "Times da rodada", status line, stale warning, balance, team grid and the bench slot — without the draw button
- [X] T019 [US2] Update frontend/src/styles/teams.css: `.teams-screen` paints the dark background on the full width and uses the centered column; drop the card-only rules (`flex` sizes of `.teams-card`, `.teams-header`); dark variant of the draw bar (`.on-dark .draw-bar`: ink background, dark line border)
- [X] T020 [US2] Create frontend/src/teamsView.js: `.screen.teams-screen.on-dark` with `createBackHeader({ onBack: () => goBackTo('/') })`, `createTeams` + `createBench` inside `.screen-main` and `createDrawBar({ label: 'Sortear de novo', onDraw })`; render from `store.draw` at once and refresh it with `drawApi.getDraw()` on mount; when the loaded draw has no teams, `goBackTo('/')` (FR-015); `onDraw` calls `actions.drawTeams()` and stays when the new draw has teams
- [X] T021 [US2] Route `'/times'` to `teamsView` in frontend/src/main.js

**Checkpoint**: US1 e US2 funcionam juntas; recarregar mantém a tela; o histórico não cria ciclo.

---

## Phase 5: User Story 3 - Saber o que falta quando não dá para sortear (Priority: P3)

**Goal**: sem times formados, o organizador fica (ou volta) no Elenco com o aviso de quantos faltam, que some na próxima alteração.

**Independent Test**: com 9 presentes, sortear no Elenco e ver "Falta 1 jogador para fechar 2 times."; marcar mais um presente e ver o aviso sumir; repetir o sorteio sem times a partir da tela de times e voltar ao Elenco com o aviso.

- [X] T022 [US3] In frontend/src/rosterView.js, pass `shortfallText: missingPlayersText(shortfall, rules.minTeams)` to the draw bar when `store.shortfall` is a number, and set `shortfall: null` in every roster or presence change
- [X] T023 [US3] In frontend/src/teamsView.js, when "Sortear de novo" returns a draw without teams, call `goBackTo('/')` so the Elenco shows the shortfall notice (FR-008)

**Checkpoint**: o aviso só aparece depois de um toque em sortear e some como o FR-009 manda.

---

## Phase 6: User Story 4 - Voltar aos últimos times sem sortear de novo (Priority: P4)

**Goal**: o link "Ver últimos times" aparece no Elenco quando o último sorteio tem times.

**Independent Test**: sortear, voltar ao Elenco, recarregar e abrir "Ver últimos times"; mudar a presença de alguém e abrir de novo para ver o aviso de lista alterada.

- [X] T024 [US4] In frontend/src/rosterView.js, create the draw bar with `lastTeamsHref: '#/times'`, load the draw on mount with `drawApi.getDraw()`, and pass `showLastTeams: hasTeams(store.draw)` on every update

**Checkpoint**: todas as histórias funcionam; o link some sem sorteio com times.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T025 [P] Update specs/001-roster-team-draw/quickstart.md: in "Presença (US3)" the summary checks become checks of the count on the draw button, with a note that feature 002 removed the summary
- [X] T026 Update the canvas Times de Society: redraw or remove the "Montar times" artboard (project/Main.dc.html), which still shows the single screen with the summary — confirm with the user which one before changing it (spec, Assumptions)
- [X] T027 Run `npm test` and `npx vite build` in frontend/ and `npm test` in backend/; everything passes
- [X] T028 Run the manual script of specs/002-mobile-screens/quickstart.md in the browser at 360 px and at desktop width, including keyboard navigation; fix what fails

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: T004 depends on T002, T005 on T003; T006–T009 depend only on the existing code — BLOCKS all user stories
- **US1 (Phase 3)**: after Phase 2
- **US2 (Phase 4)**: after Phase 2; T021 after T016 (both edit main.js); to sort from the Elenco into the times screen, needs US1
- **US3 (Phase 5)**: T022 after T015; T023 after T020
- **US4 (Phase 6)**: T024 after T015
- **Polish (Phase 7)**: after the stories you want to ship; T027 and T028 last

### Within Each User Story

- Components ([P]) before the view that assembles them
- The view before the route in main.js

### Parallel Opportunities

- T001, T002, T003 together; then T004 and T005 together
- US1: T010, T011 and T012 together (different files)
- US2: T017 in parallel with T018; T019 in parallel with both
- T025 any time

---

## Parallel Example: User Story 1

```bash
# Components of the Elenco, together:
Task: "T010 header.js only with brand and Sair"
Task: "T011 rosterRow.js in visual order"
Task: "T012 playerForm.js in canvas order"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2
2. Phase 3 (US1)
3. **STOP and VALIDATE**: Elenco at 360 px, fixed button, no summary

### Incremental Delivery

1. Foundation → US1 (Elenco) → US2 (times screen) → US3 (shortfall notice) → US4 (last teams link)
2. Each story keeps the previous ones working
3. Polish: canvas, 001 quickstart, full test run and manual script
