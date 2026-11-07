---

description: "Task list for feature 004-account-menu-myfut"
---

# Tasks: Menu da conta e tela MyFUT

**Input**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[contracts/screens.md](contracts/screens.md), [quickstart.md](quickstart.md)

**Tests**: sem regra nova; as suítes atuais devem continuar passando e a parte visual é conferida
pelo [quickstart.md](quickstart.md) (Princípio IV).

## Phase 1: User Story 1 - Menu da conta (Priority: P1)

- [x] T001 [P] [US1] Create frontend/src/components/header/accountMenu.js (disclosure button "Conta" with `aria-expanded`; panel with the e-mail, link "MyFUT" `#/myfut`, disabled "Planos" with "Em breve" and "Sair"; closes on outside `pointerdown`, Esc and choice; focus back to the button on Esc/outside)
- [x] T002 [US1] Update frontend/src/components/header/header.js to `createHeader({ email, onLogout })` with the account menu instead of "Sair", and pass `store.getState().organizer?.email` from frontend/src/rosterView.js
- [x] T003 [P] [US1] Add the account button and menu styles to frontend/src/styles/base.css

## Phase 2: User Story 2 - MyFUT (Priority: P2)

- [x] T004 [P] [US2] Create frontend/src/components/myfut/myfutRow.js (two lines: initials, name, position button, remove; star rating) from the current editable row
- [x] T005 [US2] Create frontend/src/components/myfut/myfut.js (card with `h1` "MyFUT · N" (`data-screen-title`), the player form, the list and the empty message)
- [x] T006 [US2] Create frontend/src/myfutView.js (back header to `/`, roster load, add/rating/position/remove save flow moved from rosterView.js, error handling through screenActions) and route `'/myfut'` in frontend/src/main.js
- [x] T007 [US2] Move the two-line row styles to `.myfut-row` in frontend/src/styles/roster.css and give `.back-button` a light hover outside `.on-dark`

## Phase 3: User Story 3 - Elenco do dia do jogo (Priority: P3)

- [x] T008 [US3] Rewrite frontend/src/components/roster/rosterRow.js as one read-only line (initials, name, small position tag "ATA"/"DEF"/"—" with `aria-label`, "★ N" with "Nível N de 5", presence)
- [x] T009 [US3] Update frontend/src/components/roster/roster.js (no form; empty state "Nenhum jogador ainda." with link "Abrir MyFUT") and frontend/src/rosterView.js (only presence and draw)
- [x] T010 [US3] Add an optional `noticeLink` to frontend/src/components/draw-bar/drawBar.js and use it for "Abrir MyFUT" in the pending-positions notice
- [x] T011 [US3] Add the one-line row styles (small tag, rating, presence 96 px) to frontend/src/styles/roster.css

## Phase 4: Polish

- [x] T012 Run `npm test` in backend/ and frontend/ and `npx vite build`; everything passes
- [x] T013 Run the manual script of specs/004-account-menu-myfut/quickstart.md at 360 px; fix what fails