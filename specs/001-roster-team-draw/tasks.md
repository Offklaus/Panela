---

description: "Task list for feature 001-roster-team-draw"
---

# Tasks: Elenco, presença e sorteio de times

**Input**: Design documents from `/specs/001-roster-team-draw/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/api.md](contracts/api.md), [quickstart.md](quickstart.md)

**Tests**: obrigatórios. O template trata testes como opcionais, mas a constituição (Princípio IV,
inegociável) exige testes unitários para todo serviço do backend e teste de integração para todo
endpoint. Em cada história, os testes vêm antes da implementação e devem falhar primeiro.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `backend/tests/`, `frontend/src/`, `frontend/tests/` (ver
  [plan.md](plan.md#project-structure))
- Constantes, formatos e códigos de erro: sempre os de [data-model.md](data-model.md) e
  [contracts/api.md](contracts/api.md); não inventar outros.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend/package.json with `"type": "module"`, `"engines": { "node": ">=22" }` and scripts `dev` (`node --watch --env-file=.env src/server.js`), `start` (`node src/server.js`), `test` (`node --test`), `test:unit` (`node --test "tests/unit/**/*.test.js"`), `test:integration` (`node --test "tests/integration/**/*.test.js"`); install `express@5`, `better-sqlite3`, `nodemailer`, `helmet`, `cookie-parser`
- [X] T002 [P] Create frontend/package.json with `"type": "module"` and scripts `dev`, `build`, `preview` (Vite) and `test` (`node --test`); install `vite` as devDependency
- [X] T003 [P] Create backend/.env.example (PORT, NODE_ENV, DATABASE_PATH, APP_URL, FRONTEND_DIST_DIR, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, with comments in pt-BR) and backend/.gitignore (`node_modules/`, `.env`, `data/`)
- [X] T004 [P] Create frontend/.gitignore (`node_modules/`, `dist/`)
- [X] T005 [P] Create frontend/vite.config.js with dev server proxy `/api` → `http://localhost:3000`
- [X] T006 [P] Create frontend/index.html (`lang="pt-BR"`, viewport meta, title "Times de Society", `<div id="app"></div>`, `<script type="module" src="/src/main.js">`)
- [X] T007 [P] Add Barlow (400, 500, 600, 700) and Barlow Condensed (600, 700, 800) woff2 files (SIL Open Font License) to frontend/src/assets/fonts/ and declare them with `@font-face` in frontend/src/styles/fonts.css
- [X] T008 [P] Create frontend/src/styles/tokens.css with the canvas colors as CSS variables (#F5F5F1, #0D1B12, #33FF00, #E4E9E4, #4A5A4F, #C9D3CA, #F4F4F3, #ECF7F0, #16281C, #24402D, #3C5A45, #B9C6BC, #7A877C and the 8 vest colors) and frontend/src/styles/base.css (body background and font, `:focus-visible` outline, button reset, 44 px minimum touch targets)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 [P] Create backend/src/config/domain.js exporting every constant of the "Constantes de domínio" table in data-model.md (TEAM_SIZE, MIN_TEAMS, MAX_PLAYERS, NAME_MAX_LENGTH, RATING_MIN, RATING_MAX, DEFAULT_RATING, PASSWORD_MIN_LENGTH, SESSION_DAYS, LOGIN_MAX_FAILURES, LOGIN_LOCK_MINUTES, RESET_TOKEN_MINUTES, RESET_MAX_PER_HOUR, VESTS)
- [X] T010 [P] Create backend/src/config/env.js that reads and validates environment variables (defaults: PORT 3000, DATABASE_PATH `data/panela.sqlite`; when NODE_ENV=production, throw at startup if APP_URL or any SMTP_* / MAIL_FROM is missing)
- [X] T011 [P] Create backend/src/utils/AppError.js (class with `status`, `code`, `message`, optional `field` and optional `extra` object merged into the error body)
- [X] T012 [P] Write unit tests in backend/tests/unit/random.test.js (seeded rng is deterministic, values in [0,1), shuffle keeps the same elements and does not mutate input) and backend/tests/unit/crypto.test.js (hash/verify round-trip, wrong password fails, stored format `scrypt$N$r$p$salt$hash`, generateToken is 43-char base64url, hashToken is stable SHA-256 hex)
- [X] T013 [P] Create backend/src/utils/random.js exporting `defaultRng` (Math.random), `createSeededRng(seed)` (mulberry32) and `shuffle(list, rng)` (Fisher–Yates on a copy)
- [X] T014 [P] Create backend/src/utils/crypto.js exporting `hashPassword`, `verifyPassword` (crypto.scrypt N=2^17, r=8, p=1, maxmem 256 MiB, 16-byte salt, timingSafeEqual), `generateToken` (32 random bytes, base64url) and `hashToken` (SHA-256 hex)
- [X] T015 [P] Create backend/src/database/migrations/001_initial.sql with tables organizers, sessions, password_resets, login_throttle, players and draws exactly as in data-model.md (`ON DELETE CASCADE`, `UNIQUE(organizer_id, name_key)`, `CHECK (rating BETWEEN 1 AND 5)`, `present` default 1, `stale` default 0)
- [X] T016 Create backend/src/database/connection.js exporting `createDatabase(path)` (better-sqlite3, supports `:memory:`, `PRAGMA foreign_keys = ON`, `journal_mode = WAL` for files, creates the parent folder of the file)
- [X] T017 Create backend/src/database/migrate.js exporting `migrate(db)` that applies backend/src/database/migrations/*.sql in name order, each inside a transaction, and records it in `schema_migrations`
- [X] T018 [P] Create backend/src/middlewares/requireJson.js (POST, PUT and PATCH without `Content-Type: application/json` → AppError 415 `UNSUPPORTED_MEDIA_TYPE`)
- [X] T019 [P] Create backend/src/middlewares/errorHandler.js (AppError → `{ error: { code, message, field?, ...extra } }`; JSON parse error → 400 `INVALID_JSON`; anything else → 500 `INTERNAL_ERROR` with a generic pt-BR message and the stack logged on the server)
- [X] T020 [P] Create backend/tests/integration/testServer.js helper: `startTestServer()` builds createApp with an in-memory database (migrated), `createSeededRng(42)` and a fake mailer that records sent messages; listens on port 0; returns `baseUrl`, `mailer`, `close()` and `createClient()` (keeps the `sid` cookie, sends JSON)
- [X] T021 [P] Write integration tests in backend/tests/integration/app.test.js: unknown `/api/...` route → 404 JSON `NOT_FOUND`; POST without JSON content type → 415 `UNSUPPORTED_MEDIA_TYPE`; malformed JSON body → 400 `INVALID_JSON`
- [X] T022 Create backend/src/routes/index.js exporting `createApiRouter(deps)` (empty Express router for now; each story registers its routes here)
- [X] T023 Create backend/src/app.js exporting `createApp({ db, rng, mailer, env })`: helmet, `express.json()`, cookie-parser, requireJson and `createApiRouter` under `/api`, JSON 404 `NOT_FOUND` for unknown `/api` routes, static `FRONTEND_DIST_DIR` with `index.html` fallback when the variable is set, errorHandler last
- [X] T024 Create backend/src/server.js: read env, `createDatabase(DATABASE_PATH)`, `migrate`, `createApp` with `defaultRng`, listen on PORT and log the URL
- [X] T025 [P] Write unit tests in frontend/tests/format.test.js (`formatDecimal(3.4)` → "3,4", `formatDecimal(null)` → "–", `initials`, `starsText(1)` → "1 estrela", `starsText(3)` → "3 estrelas", `missingPlayersText(1)` → "Falta 1 jogador para fechar 2 times.", `missingPlayersText(3)` → "Faltam 3 jogadores para fechar 2 times.") and frontend/tests/store.test.js (setState merges, subscribers are notified, unsubscribe stops notifications)
- [X] T026 [P] Create frontend/src/utils/format.js (`formatDecimal`, `initials`, `starsText`, `missingPlayersText`)
- [X] T027 [P] Create frontend/src/state/store.js exporting `createStore(initialState)` with `getState`, `setState(partial)` and `subscribe(listener)` returning an unsubscribe function
- [X] T028 [P] Create frontend/src/utils/dom.js exporting `h(tag, props, ...children)` (createElement, textContent for strings, `on*` props as event listeners, `aria-*`/`class`/attributes; never innerHTML) and `clear(node)`
- [X] T029 [P] Create frontend/src/utils/notice.js: a single `aria-live="polite"` region with `showNotice(message)` and `clearNotice()`, used for save errors (FR-035)
- [X] T030 [P] Create frontend/src/services/apiClient.js exporting `request(method, path, body)` and `ApiError` (same-origin credentials; JSON content type on POST/PUT/PATCH; error body → ApiError with `status`, `code`, `message`, `field`, `retryAfterSeconds`; network failure → code `NETWORK_ERROR`, message "Não foi possível salvar. Verifique a conexão.")
- [X] T031 Create frontend/src/router.js: hash routes `#/entrar`, `#/criar-conta`, `#/esqueci-senha`, `#/nova-senha` and `#/`, query parsing inside the hash (`#/nova-senha?token=...`), `navigate(path)` and a `beforeEach` guard hook
- [X] T032 Create frontend/src/main.js: import the styles, create the store, start the router mounting the current view into `#app`

**Checkpoint**: `npm test` passes in backend/ (random, crypto, app) and frontend/ (format, store); backend starts and creates the SQLite file.

---

## Phase 3: User Story 1 - Entrar com a própria conta (Priority: P1)

**Goal**: o organizador cria conta, entra, sai e recupera a senha; cada conta é isolada.

**Independent Test**: criar duas contas, sair e entrar de novo em cada uma; errar a senha 5 vezes
e ver o bloqueio; recuperar a senha pelo link do log; reusar o link e ver a recusa.

### Pré-requisito de design (Princípio V)

- [X] T033 [US1] Design the artboards "Entrar", "Criar conta", "Esqueci a senha" and "Nova senha" in the canvas "Times de Society" (https://claude.ai/artifact/U1GkVhnNWnChkpdAkkT7Cg, new `project/*.dc.html` artboards) in the same style as the main screen; T051–T055 must not start before this

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T034 [P] [US1] Write unit tests in backend/tests/unit/authService.test.js: signup normalizes e-mail (trim + lowercase), rejects duplicate (`EMAIL_TAKEN`), invalid e-mail and password under 8 chars (`VALIDATION_ERROR`); login ok; wrong password → `INVALID_CREDENTIALS`; 5 consecutive failures → `LOGIN_LOCKED` with `retryAfterSeconds` for 15 min, also for e-mails without account; success resets the counter
- [X] T035 [P] [US1] Write unit tests in backend/tests/unit/sessionService.test.js: creates a session valid for 30 days storing only the token hash; resolves organizer by token; expired session resolves to null and is deleted; logout deletes it; `endAllSessions` removes every session of the organizer
- [X] T036 [P] [US1] Write unit tests in backend/tests/unit/passwordResetService.test.js: request for existing account sends one e-mail with `<APP_URL>/#/nova-senha?token=...`; request for unknown e-mail sends nothing and does not fail; 4th request in one hour sends nothing; token expires after 60 min; token works once; confirm changes the password and ends all sessions
- [X] T037 [P] [US1] Write integration tests in backend/tests/integration/auth.test.js for every auth endpoint in contracts/api.md: signup 201 + `sid` cookie (`HttpOnly`, `SameSite=Lax`) / 400 / 409; login 200 / 401 with message "E-mail ou senha incorretos." / 429; logout 204 and cookie cleared / 401; me 200 / 401; password-reset/request always 202; password-reset/confirm 204 / 400 `INVALID_RESET_TOKEN`

### Implementation for User Story 1

- [X] T038 [P] [US1] Create backend/src/models/organizerModel.js (`create`, `findByEmail`, `findById`, `updatePasswordHash`)
- [X] T039 [P] [US1] Create backend/src/models/sessionModel.js (`create`, `findValidByTokenHash`, `deleteByTokenHash`, `deleteAllForOrganizer`, `deleteExpired`)
- [X] T040 [P] [US1] Create backend/src/models/passwordResetModel.js (`create`, `findByTokenHash`, `markUsed`, `countCreatedSince`)
- [X] T041 [P] [US1] Create backend/src/models/loginThrottleModel.js (`get`, `registerFailure` that sets `locked_until` on the 5th failure, `reset`)
- [X] T042 [P] [US1] Create backend/src/validators/authValidator.js (normalize and validate e-mail, password ≥ PASSWORD_MIN_LENGTH, reset token string) throwing AppError `VALIDATION_ERROR` with `field`
- [X] T043 [P] [US1] Create backend/src/services/mailService.js exporting `createMailer(env)` (nodemailer SMTP transport when SMTP_HOST is set; otherwise logs the e-mail text with the link to the console) with `sendPasswordReset(to, link)` in pt-BR, and pass it to createApp in backend/src/server.js
- [X] T044 [US1] Create backend/src/services/sessionService.js (`createSession`, `resolveSession`, `endSession`, `endAllSessions`) using sessionModel and utils/crypto
- [X] T045 [US1] Create backend/src/services/authService.js (`signup`, `login` with login_throttle rules from research.md §6) using organizerModel, loginThrottleModel, authValidator and utils/crypto
- [X] T046 [US1] Create backend/src/services/passwordResetService.js (`requestReset`, `confirmReset`) following research.md §7 and using mailService and sessionService
- [X] T047 [US1] Create backend/src/middlewares/requireAuth.js: read the `sid` cookie, resolve the session, set `req.organizer`, otherwise AppError 401 `UNAUTHENTICATED`
- [X] T048 [US1] Create backend/src/controllers/authController.js (signup, login, logout, me, requestReset, confirmReset; cookie `sid` with `httpOnly`, `sameSite: 'lax'`, `secure` when NODE_ENV=production, `maxAge` 30 days, `path: '/'`)
- [X] T049 [US1] Create backend/src/routes/authRoutes.js with the 6 `/auth` routes of contracts/api.md (requireAuth on logout and me) and register it in backend/src/routes/index.js
- [X] T050 [P] [US1] Create frontend/src/services/authApi.js (`signup`, `login`, `logout`, `me`, `requestPasswordReset`, `confirmPasswordReset`) using apiClient
- [X] T051 [P] [US1] Create frontend/src/styles/auth.css following the artboards from T033
- [X] T052 [P] [US1] Create frontend/src/components/auth/loginView.js (labeled e-mail and password fields, "Entrar" button, field and general error messages including `LOGIN_LOCKED`, links to `#/criar-conta` and `#/esqueci-senha`)
- [X] T053 [P] [US1] Create frontend/src/components/auth/signupView.js (e-mail, password with "mínimo 8 caracteres" hint, `EMAIL_TAKEN` message, link to `#/entrar`)
- [X] T054 [P] [US1] Create frontend/src/components/auth/forgotPasswordView.js (e-mail field; after submit always shows the same confirmation text)
- [X] T055 [P] [US1] Create frontend/src/components/auth/resetPasswordView.js (reads `token` from the hash query; new password field; `INVALID_RESET_TOKEN` message with link to `#/esqueci-senha`; success → `#/entrar`)
- [X] T056 [US1] Create frontend/src/components/header/header.js with the logo, the title "Times de Society" and a "Sair" button that calls logout and goes to `#/entrar`
- [X] T057 [US1] Wire authentication in frontend/src/router.js and frontend/src/main.js: call `GET /api/auth/me` on start and store the organizer; unauthenticated users go to `#/entrar`; authenticated users on auth routes go to `#/`; `#/` shows the header for now

**Checkpoint**: User Story 1 works on its own (independent test above) and its tests pass.

---

## Phase 4: User Story 2 - Montar o elenco com níveis (Priority: P2)

**Goal**: cadastrar, mudar o nível e remover jogadores, com o elenco salvo por organizador.

**Independent Test**: cadastrar 3 jogadores, mudar o nível de um, remover outro, sair, entrar e
conferir o elenco; " pedrinho " repetido é recusado; outra conta não vê esses jogadores.

### Tests for User Story 2 ⚠️

- [X] T058 [P] [US2] Write unit tests in backend/tests/unit/rosterService.test.js: addPlayer trims the name, stores `name_key`, enters present with the given rating; rejects empty, only spaces, over 40 chars (`VALIDATION_ERROR`), duplicate ignoring case and edge spaces (`NAME_TAKEN`), 101st player (`ROSTER_FULL`); setRating 1–5; removePlayer; list in registration order; player of another organizer → `NOT_FOUND`; summary of `getRosterState` (`presentCount`, `possibleTeams`, `averageRating`)
- [X] T059 [P] [US2] Write integration tests in backend/tests/integration/players.test.js: `GET /api/roster` 200; `POST /api/players` 201 / 400 / 409 `NAME_TAKEN` / 409 `ROSTER_FULL`; `PATCH /api/players/:id` with rating 200 / 400 / 404; `DELETE /api/players/:id` 200 / 404; every route 401 without session; organizer B gets 404 on A's player and does not see A's players (FR-007, SC-007)

### Implementation for User Story 2

- [X] T060 [P] [US2] Create backend/src/models/playerModel.js (`listByOrganizer` ordered by id, `countByOrganizer`, `findByIdForOrganizer`, `insert`, `updateRating`, `remove`)
- [X] T061 [P] [US2] Create backend/src/validators/playerValidator.js (name 1–40 chars after trim, rating integer 1–5, `:id` positive integer) throwing AppError `VALIDATION_ERROR` with `field`
- [X] T062 [US2] Create backend/src/services/rosterService.js: `getRosterState(organizerId)` returning `{ players, summary, drawStale: false }` with the summary rules of data-model.md; `addPlayer` (count check and insert in one transaction), `setRating`, `removePlayer`, each returning the new RosterState
- [X] T063 [US2] Create backend/src/controllers/playerController.js (getRoster, addPlayer → 201, updatePlayer with rating, removePlayer)
- [X] T064 [US2] Create backend/src/routes/playerRoutes.js (`GET /roster`, `POST /players`, `PATCH /players/:id`, `DELETE /players/:id`, all behind requireAuth) and register it in backend/src/routes/index.js
- [X] T065 [P] [US2] Create frontend/src/services/rosterApi.js (`getRoster`, `addPlayer`, `updatePlayer`, `removePlayer`)
- [X] T066 [P] [US2] Create frontend/src/components/star-rating/starRating.js (5 `<button type="button">` with 44 px targets, filled/empty star SVG with `aria-hidden`, `aria-label` like "Pedrinho: 3 estrelas", `onChange(rating)`)
- [X] T067 [P] [US2] Create frontend/src/styles/roster.css following the "Elenco" section of the canvas
- [X] T068 [US2] Create frontend/src/components/player-form/playerForm.js ("Novo jogador" label + input "Nome ou apelido", star rating with 3 preselected, "Adicionar" submit, field error under the input, clears on success)
- [X] T069 [US2] Create frontend/src/components/roster/roster.js and frontend/src/components/roster/rosterRow.js ("Elenco · N" title, rows in received order with initials, name, starRating and a remove button with `aria-label` "Remover <nome>", empty message "Nenhum jogador ainda. Adicione o primeiro acima.")
- [X] T070 [US2] Create frontend/src/homeView.js with the canvas layout (header, "Elenco" section, placeholder for "Times da rodada"), load `GET /api/roster` into the store, call rosterApi on actions and replace the roster state with each response, show failures with notice.js; route `#/` to it in frontend/src/router.js

**Checkpoint**: User Stories 1 and 2 work; elenco salvo e isolado por conta.

---

## Phase 5: User Story 3 - Marcar quem veio (Priority: P3)

**Goal**: alternar presença, "Todos presentes", "Limpar" e resumo no topo.

**Independent Test**: com 12 jogadores, "Limpar", marcar 7 e conferir 7 / 1 / média com vírgula;
"Todos presentes" e conferir de novo.

### Tests for User Story 3 ⚠️

- [X] T071 [P] [US3] Add unit tests to backend/tests/unit/rosterService.test.js: setPresent toggles one player; setAllPresent(true/false) affects every player of the organizer only; summary with 7 present → `possibleTeams` 1 and the right average; nobody present → `averageRating` null
- [X] T072 [P] [US3] Add integration tests to backend/tests/integration/players.test.js: `PATCH /api/players/:id` with `present` 200 / 400 (non-boolean, empty body) / 404; `PUT /api/players/presence` 200 / 400

### Implementation for User Story 3

- [X] T073 [US3] Add `updatePresent` and `setAllPresent` to backend/src/models/playerModel.js
- [X] T074 [P] [US3] Extend backend/src/validators/playerValidator.js: `present` must be boolean; PATCH body needs at least one of `rating` or `present`
- [X] T075 [US3] Add `setPresent` and `setAllPresent` to backend/src/services/rosterService.js, returning the new RosterState
- [X] T076 [US3] Handle `present` in `PATCH /players/:id` and add `PUT /players/presence` in backend/src/controllers/playerController.js and backend/src/routes/playerRoutes.js
- [X] T077 [P] [US3] Add `setPresence(id, present)` and `setAllPresence(present)` to frontend/src/services/rosterApi.js
- [X] T078 [US3] Add the presence toggle to frontend/src/components/roster/rosterRow.js ("Presente" with check icon and `aria-pressed="true"`, "Ausente" with `aria-pressed="false"`, row background #ECF7F0 when present) and the "Todos presentes" and "Limpar" buttons to frontend/src/components/roster/roster.js
- [X] T079 [US3] Add the summary cards "Presentes", "Times" and "Média ★" (formatDecimal) to frontend/src/components/header/header.js, fed by `summary` from the store

**Checkpoint**: User Stories 1–3 work; o resumo muda a cada alteração.

---

## Phase 6: User Story 4 - Sortear times equilibrados (Priority: P4)

**Goal**: sortear times de 5 equilibrados, banco aleatório, diferença e "Sortear de novo".

**Independent Test**: 11 presentes → Time A e B com 5, 1 no banco, ninguém repetido, nenhum
ausente, nenhuma troca melhora a diferença; 9 presentes → "Falta 1 jogador...".

### Tests for User Story 4 ⚠️

- [X] T080 [P] [US4] Write unit tests in backend/tests/unit/teamBalancer.test.js with `createSeededRng`: fewer than 10 present → no teams, all on the bench; 10 → 2 teams, no bench; 11 → 1 on bench; 14 → 4 on bench; 15 → 3 teams; every team has exactly TEAM_SIZE; every present player appears exactly once; for 200 random rosters no swap between any two teams lowers their difference (FR-024, SC-005); all equal ratings → difference 0; over 2,000 seeded runs with 11 players each player lands on the bench between 6% and 12% of the time (FR-021); same seed → same result; different seeds → at least 2 different compositions (FR-025); 100 present players finish in under 2 s (SC-006)
- [X] T081 [P] [US4] Write unit tests in backend/tests/unit/drawService.test.js: createDraw uses only present players, stores team and bench ids with `stale` 0 and replaces the previous draw; getDraw returns null without a draw and otherwise letters A, B, C..., vests in VESTS order wrapping after the 8th, players by rating descending, `total`, `average`, `difference` and `missingPlayers` as in contracts/api.md
- [X] T082 [P] [US4] Write integration tests in backend/tests/integration/draw.test.js: `GET /api/draw` → `{ draw: null }` then the saved draw; `POST /api/draw` with 11 present → 201, 2 teams, 1 on bench; with 9 present → `teams: []`, `missingPlayers: 1`; 401 without session; organizer B never sees A's draw

### Implementation for User Story 4

- [X] T083 [P] [US4] Create backend/src/services/teamBalancer.js exporting the pure function `balanceTeams(players, { teamSize, minTeams, rng })` → `{ teams: number[][], bench: number[] }` following research.md §9 (random bench, greedy split with random tie-breaks, swap refinement until no swap lowers a pair's difference)
- [X] T084 [P] [US4] Create backend/src/models/drawModel.js (`upsert`, `findByOrganizer`, `setStale`)
- [X] T085 [US4] Create backend/src/services/drawService.js (`createDraw(organizerId)` loads present players, calls balanceTeams with the injected rng and upserts; `getDraw(organizerId)` builds the Draw object of contracts/api.md from current player data)
- [X] T086 [US4] Create backend/src/controllers/drawController.js and backend/src/routes/drawRoutes.js (`GET /draw`, `POST /draw` → 201, both behind requireAuth) and register them in backend/src/routes/index.js
- [X] T087 [P] [US4] Write unit tests in frontend/tests/vests.test.js (each VestKey maps to its color and label, e.g. `green` → accent color and "Colete verde")
- [X] T088 [P] [US4] Create frontend/src/services/drawApi.js (`getDraw`, `createDraw`)
- [X] T089 [P] [US4] Create frontend/src/utils/vests.js mapping each VestKey to color (green → #33FF00, white → #F5F5F1, orange → #FFB020, blue → #4DA3FF, pink → #FF5C8A, purple → #B18CFF, yellow → #FFE14D, cyan → #5CE1E6) and pt-BR label
- [X] T090 [P] [US4] Create frontend/src/styles/teams.css following the "Times da rodada" section of the canvas
- [X] T091 [US4] Create frontend/src/components/teams/teamCard.js (vest color bar, vest label, "Time X", "★ total", "média X,X", players with mini stars and `role="img"` label) and frontend/src/components/teams/teams.js ("Times da rodada" title, status line of FR-029, button "Montar times" / "Sortear de novo" (FR-030), balance tag "Equilíbrio perfeito" or "Diferença de N estrelas" (FR-027), team grid, empty state "Jogadores insuficientes" with missingPlayersText (FR-022))
- [X] T092 [P] [US4] Create frontend/src/components/bench/bench.js ("Próximos · aguardando vaga" with name and "★ N" chips; renders nothing when the bench is empty)
- [X] T093 [US4] In frontend/src/homeView.js load `GET /api/draw` on start, render teams.js and bench.js in the "Times da rodada" section, and call `POST /api/draw` from the button

**Checkpoint**: User Stories 1–4 work: o produto entrega o sorteio de ponta a ponta.

---

## Phase 7: User Story 5 - Saber que a lista mudou depois do sorteio (Priority: P5)

**Goal**: aviso de lista alterada depois do sorteio, sem desmontar os times.

**Independent Test**: sortear com 11, marcar mais um presente → aviso aparece e os times ficam;
remover um sorteado → some do time; sortear de novo → aviso some.

### Tests for User Story 5 ⚠️

- [X] T094 [P] [US5] Add unit tests to backend/tests/unit/rosterService.test.js: with a draw saved, addPlayer, removePlayer, setRating, setPresent and setAllPresent each set `stale` to 1 and `getRosterState` returns `drawStale: true`; without a draw nothing fails and `drawStale` is false
- [X] T095 [P] [US5] Add unit tests to backend/tests/unit/drawService.test.js: a removed player disappears from teams and bench and totals are recomputed (FR-032); a new createDraw sets `stale` back to 0 (FR-033)
- [X] T096 [P] [US5] Add integration tests to backend/tests/integration/draw.test.js: after `POST /api/draw`, `PATCH /api/players/:id` presence → `GET /api/draw` has `stale: true` and the same teams; `POST /api/draw` again → `stale: false`

### Implementation for User Story 5

- [X] T097 [P] [US5] In backend/src/services/rosterService.js call `drawModel.setStale(organizerId)` inside every roster mutation transaction and read `drawStale` from drawModel in `getRosterState`
- [X] T098 [P] [US5] In backend/src/services/drawService.js make `getDraw` skip ids that no longer exist and recompute total, average and difference
- [X] T099 [P] [US5] In frontend/src/components/teams/teams.js show the `role="status"` warning "A lista mudou depois do sorteio. Toque em **Sortear de novo** para atualizar os times." when the draw is stale
- [X] T100 [P] [US5] In frontend/src/homeView.js, after every roster mutation, refetch `GET /api/draw` when a draw exists so stale state and removed players come from the backend

**Checkpoint**: all user stories are independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T101 [P] Accessibility and responsive pass over every screen in frontend/src/styles/ and frontend/src/components/: no horizontal scroll at 360 px, full keyboard use, text contrast ≥ 4,5:1, `aria-label` on every icon-only button (FR-037)
- [X] T102 [P] Security review in backend/src/app.js and backend/src/controllers/authController.js: helmet CSP allows only self-hosted fonts, cookie `Secure` in production, no stack traces in responses
- [X] T103 [P] Create README.md at the repository root with a short project description and how to run, linking to specs/001-roster-team-draw/quickstart.md
- [X] T104 Run `npm run build` in frontend/ and check that backend/ serves frontend/dist on the same origin with `FRONTEND_DIST_DIR` set
- [X] T105 Run `npm test` in backend/ and frontend/ and the whole manual script of specs/001-roster-team-draw/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies; start immediately.
- **Foundational (Phase 2)**: depends on Setup; blocks every user story.
- **User Stories (Phase 3–7)**: run in priority order. Each one builds on files and data of the
  previous one (see below).
- **Polish (Phase 8)**: after the desired stories are complete.

### User Story Dependencies

- **US1 (P1)**: after Foundational. T051–T055 wait for the canvas design T033.
- **US2 (P2)**: needs `requireAuth` and sessions from US1.
- **US3 (P3)**: extends files created in US2 (playerModel, playerValidator, rosterService,
  playerController, playerRoutes, rosterApi, roster components, header).
- **US4 (P4)**: needs players with presence (US3). Exception: T080 and T083 (`teamBalancer`) are
  pure and depend only on Phase 2, so they can be done right after Foundational.
- **US5 (P5)**: needs the draw from US4.

### Within Each User Story

- Tests MUST be written and FAIL before implementation (Princípio IV).
- Models before services; services before controllers and routes; API service before components.
- Story complete (checkpoint) before moving to the next priority.

### Parallel Opportunities

- Setup: T002–T008 in parallel after T001 (or alongside it).
- Foundational: T009–T015, T018–T021 and T025–T030 in parallel; then T016 → T017, T022 → T023 →
  T024, T031 → T032.
- US1: tests T034–T037 together; models and validator T038–T043 together; frontend views
  T050–T055 together (after T033).
- US4: T080 + T083 can start as soon as Phase 2 ends, in parallel with US1–US3.
- Within each story, every task marked [P] touches a different file.

---

## Parallel Example: User Story 1

```bash
# Tests first, together:
Task: "Write unit tests in backend/tests/unit/authService.test.js"
Task: "Write unit tests in backend/tests/unit/sessionService.test.js"
Task: "Write unit tests in backend/tests/unit/passwordResetService.test.js"
Task: "Write integration tests in backend/tests/integration/auth.test.js"

# Then models and validator, together:
Task: "Create backend/src/models/organizerModel.js"
Task: "Create backend/src/models/sessionModel.js"
Task: "Create backend/src/models/passwordResetModel.js"
Task: "Create backend/src/models/loginThrottleModel.js"
Task: "Create backend/src/validators/authValidator.js"
```

## Parallel Example: User Story 4

```bash
# Pure algorithm, can start right after Phase 2:
Task: "Write unit tests in backend/tests/unit/teamBalancer.test.js"
Task: "Create backend/src/services/teamBalancer.js"

# Frontend pieces, together:
Task: "Create frontend/src/services/drawApi.js"
Task: "Create frontend/src/utils/vests.js"
Task: "Create frontend/src/styles/teams.css"
Task: "Create frontend/src/components/bench/bench.js"
```

---

## Implementation Strategy

### MVP First

O valor do produto é o sorteio, então o MVP é **US1 + US2 + US3 + US4**:

1. Phase 1: Setup
2. Phase 2: Foundational (blocks all stories)
3. Phase 3: US1 → **STOP and VALIDATE** login sozinho
4. Phase 4: US2 → validate elenco
5. Phase 5: US3 → validate presença e resumo
6. Phase 6: US4 → **STOP and VALIDATE** o sorteio de ponta a ponta (MVP pronto)
7. Phase 7: US5 → aviso de lista alterada
8. Phase 8: Polish

### Incremental Delivery

Cada checkpoint deixa o app funcionando até ali: conta → elenco → presença → sorteio → aviso.
Nenhuma história nova pode quebrar os testes das anteriores.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Verify tests fail before implementing
- Stop at any checkpoint to validate the story independently
- O projeto ainda não usa git; quando usar, fazer commit a cada tarefa ou grupo lógico
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
