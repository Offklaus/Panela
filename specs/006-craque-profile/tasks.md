---

description: "Task list for feature 006-craque-profile"
---

# Tasks: Craque — o perfil de jogador da conta

**Input**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/api.md](contracts/api.md),
[contracts/screens.md](contracts/screens.md), [quickstart.md](quickstart.md)

**Tests**: obrigatórios no backend (Princípio IV): serviço do perfil, funções de data e rotas; no
frontend, os textos novos de `format.js`. As telas são conferidas pelo [quickstart.md](quickstart.md).

## Phase 1: Foundational - perfil no backend (bloqueia US1 e US2)

- [x] T001 Add `DOMINANT_FEET`, `NICKNAME_MAX_LENGTH`, `PROFILE_MIN_AGE`, `PROFILE_MAX_AGE` and `APP_TIME_ZONE` to backend/src/config/domain.js
- [x] T002 Create backend/src/database/migrations/004_profile.sql (table `profiles` keyed by `organizer_id`, position and foot CHECKs, RLS)
- [x] T003 [P] Create backend/src/utils/dates.js (`localDate`, `isValidDate`, `ageOn`) with backend/tests/unit/dates.test.js
- [x] T004 [P] Create backend/src/validators/profileValidator.js (nickname, birthDate with today, position, foot)
- [x] T005 [P] Create backend/src/models/profileModel.js (`findByOrganizer`, `upsert` with `ON CONFLICT DO UPDATE`, date read with `to_char`)
- [x] T006 Create backend/src/services/profileService.js (`getProfile`, `saveProfile`, age from today in `APP_TIME_ZONE`)
- [x] T007 Create backend/src/controllers/profileController.js and backend/src/routes/profileRoutes.js (`GET`/`PUT /profile`, auth) and register them in backend/src/routes/index.js
- [x] T008 Add `dominantFeet` to backend/src/controllers/rulesController.js
- [x] T009 [P] Write backend/tests/unit/profileService.test.js and add `profiles` to backend/tests/unit/testDb.js
- [x] T010 [P] Write backend/tests/integration/profile.test.js (401, `null`, 200, 400 by field, isolation) and update backend/tests/integration/rules.test.js

## Phase 2: User Story 1 - Montar o perfil (Priority: P1)

- [x] T011 [P] [US1] Create frontend/src/services/profileApi.js (`getProfile`, `saveProfile`)
- [x] T012 [P] [US1] Add `ageText` and `footText` to frontend/src/utils/format.js with tests in frontend/tests/format.test.js
- [x] T013 [US1] Create frontend/src/components/craque/profileForm.js (nickname, date, position group, foot group, inline errors, create and edit modes)
- [x] T014 [US1] Create frontend/src/craqueView.js (back header to `/`, loads the profile, form or card) and route `'/craque'` with `profile` in the store (frontend/src/main.js) cleared on sign-out (frontend/src/screenActions.js)
- [x] T015 [US1] Add "Craque" (`#/craque`) below "MyTeam" in frontend/src/components/header/accountMenu.js
- [x] T016 [US1] Create frontend/src/styles/craque.css and import it in frontend/src/main.js

## Phase 3: User Story 2 - Ver e editar (Priority: P2)

- [x] T017 [US2] Create frontend/src/components/craque/profileCard.js (initials, nickname, e-mail, Posição/Idade/Perna list, "Editar perfil") with `pencilIcon` in frontend/src/assets/icons/icons.js
- [x] T018 [US2] Add the edit mode to frontend/src/craqueView.js (filled form, "Cancelar" back to the card, focus on "Editar perfil")

## Phase 4: Polish

- [x] T019 Add the profile routes, `Profile`, `DominantFoot` and `dominantFeet` to specs/001-roster-team-draw/contracts/api.md
- [x] T020 Run `npm test` in backend/ and frontend/ and `npx vite build`; everything passes
- [x] T021 Run the manual script of specs/006-craque-profile/quickstart.md at 360 px; fix what fails
