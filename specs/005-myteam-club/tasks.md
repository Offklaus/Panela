---

description: "Task list for feature 005-myteam-club"
---

# Tasks: MyTeam — o time do grupo

**Input**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/api.md](contracts/api.md),
[contracts/screens.md](contracts/screens.md), [quickstart.md](quickstart.md)

**Tests**: obrigatórios no backend (Princípio IV): serviço do time e rotas; no frontend, o texto novo
de `format.js`. As telas são conferidas pelo [quickstart.md](quickstart.md).

## Phase 1: Foundational - time no backend (bloqueia US1 e US2)

- [x] T001 Add `CLUB_ICONS`, `DEFAULT_CLUB_ICON` and `CLUB_NAME_MAX_LENGTH` to backend/src/config/domain.js
- [x] T002 Create backend/src/database/migrations/003_club.sql (table `clubs` keyed by `organizer_id`, icon CHECK, RLS)
- [x] T003 [P] Create backend/src/validators/clubValidator.js (name trim/required/40, icon from list with default)
- [x] T004 [P] Create backend/src/models/clubModel.js (`findByOrganizer`, `insert` with `ON CONFLICT DO NOTHING RETURNING`)
- [x] T005 Create backend/src/services/clubService.js (`getClub`, `createClub` with `409 CLUB_EXISTS`)
- [x] T006 Create backend/src/controllers/clubController.js and backend/src/routes/clubRoutes.js (`GET`/`POST /club`, auth) and register them in backend/src/routes/index.js
- [x] T007 Add `clubIcons` to backend/src/controllers/rulesController.js
- [x] T008 [P] Write backend/tests/unit/clubService.test.js (validation, default icon, one per account, isolation) and add `clubs` to backend/tests/unit/testDb.js
- [x] T009 [P] Write backend/tests/integration/club.test.js (401, `null`, 201, 400 name/icon, 409) and update backend/tests/integration/rules.test.js

## Phase 2: User Story 1 - Criar o time (Priority: P1)

- [x] T010 [P] [US1] Create frontend/src/services/clubApi.js (`getClub`, `createClub`)
- [x] T011 [P] [US1] Create frontend/src/assets/icons/clubIcons.js (8 drawings, pt-BR names, ball fallback)
- [x] T012 [US1] Create frontend/src/components/myteam/clubForm.js (name field, 4-column icon group with `aria-pressed`, inline errors, `CLUB_EXISTS` callback)
- [x] T013 [US1] Create frontend/src/components/myteam/clubCard.js (link to `#/myteam/elenco` with icon, name, player count, chevron)
- [x] T014 [US1] Create frontend/src/myteamView.js (back header to `/`, loads club and roster, form or card) and route `'/myteam'` with `club` in the store (frontend/src/main.js) cleared on sign-out (frontend/src/screenActions.js)
- [x] T015 [P] [US1] Add `playerCountText` to frontend/src/utils/format.js with tests in frontend/tests/format.test.js

## Phase 3: User Story 2 - Elenco do time (Priority: P2)

- [x] T016 [US2] Move frontend/src/components/myfut/ to frontend/src/components/myteam/ as clubRoster.js and clubRosterRow.js; title with the club icon and "{nome} · N"; disabled "Convocar jogador" with "Em breve"
- [x] T017 [US2] Let frontend/src/components/header/backHeader.js take the label and accessible name
- [x] T018 [US2] Replace frontend/src/myfutView.js with frontend/src/clubRosterView.js (back to `/myteam`, redirect without club) and route `'/myteam/elenco'` instead of `'/myfut'` in frontend/src/main.js
- [x] T019 [US2] Add the club form, icon grid, card and roster title styles to frontend/src/styles/roster.css

## Phase 4: User Story 3 - Menu e atalhos (Priority: P3)

- [x] T020 [US3] Rename the menu item to "MyTeam" (`#/myteam`) in frontend/src/components/header/accountMenu.js, the empty roster button to "Abrir MyTeam" in frontend/src/components/roster/roster.js and the notice link to `#/myteam/elenco` in frontend/src/rosterView.js

## Phase 5: Polish

- [x] T021 Add the club routes, `CLUB_EXISTS` and `clubIcons` to specs/001-roster-team-draw/contracts/api.md
- [x] T022 Run `npm test` in backend/ and frontend/ and `npx vite build`; everything passes
- [x] T023 Run the manual script of specs/005-myteam-club/quickstart.md at 360 px; fix what fails

## Phase 6: User Story 4 - Sorteio só com o time (Priority: P2)

- [x] T024 [US4] Add `hasClub` and `requireClub` (`409 CLUB_REQUIRED`) to backend/src/services/clubService.js
- [x] T025 [US4] Require the club in backend/src/services/rosterService.js (empty `RosterState` without club; changes refused inside the transaction) and backend/src/services/drawService.js (`getDraw` null; `createDraw` refused)
- [x] T026 [P] [US4] Add `insertClub` to backend/tests/unit/testDb.js, give the accounts in rosterService.test.js and drawService.test.js a club and add the no-club tests
- [x] T027 [P] [US4] Create the club in the helpers of backend/tests/integration/players.test.js and draw.test.js and add the no-club route tests to backend/tests/integration/club.test.js
- [x] T028 [US4] Show the no-club state in frontend/src/components/roster/roster.js and frontend/src/rosterView.js (reads the club; hides actions, list and draw bar) with styles in frontend/src/styles/roster.css
- [x] T029 [US4] Re-read the roster after creating the club in frontend/src/myteamView.js
- [x] T030 [US4] Add `CLUB_REQUIRED` to specs/001-roster-team-draw/contracts/api.md, run the tests and the build and the quickstart at 360 px