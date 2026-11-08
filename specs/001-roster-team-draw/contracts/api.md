# API Contract: Elenco, presença e sorteio de times

**Feature**: `001-roster-team-draw` | **Date**: 2026-11-01 | **Plan**: [../plan.md](../plan.md)

## Convenções

- Base: `/api`, mesma origem do frontend ([research.md §15](../research.md)).
- Corpo em JSON. `POST`, `PUT`, `PATCH` e `DELETE` com corpo exigem
  `Content-Type: application/json`; caso contrário, `415 UNSUPPORTED_MEDIA_TYPE`.
- Autenticação: cookie `sid` (`HttpOnly`, `SameSite=Lax`, `Secure` em produção), criado em
  `signup`, `login` e removido em `logout`. Rotas marcadas com 🔒 respondem
  `401 UNAUTHENTICATED` sem sessão válida.
- Um recurso de outro organizador responde `404 NOT_FOUND`, nunca 403, para não revelar que
  existe (FR-007).
- Campos JSON em inglês; mensagens para o usuário em pt-BR.

## Formato de erro (único em toda a API)

```json
{
  "error": {
    "code": "NAME_TAKEN",
    "message": "Já existe um jogador com esse nome no elenco.",
    "field": "name"
  }
}
```

`field` só aparece em erros de validação de um campo.

| Código | HTTP | Quando |
|--------|------|--------|
| `VALIDATION_ERROR` | 400 | Campo ausente ou inválido |
| `INVALID_JSON` | 400 | Corpo não é JSON válido |
| `INVALID_RESET_TOKEN` | 400 | Link de recuperação vencido, usado ou inexistente |
| `UNAUTHENTICATED` | 401 | Sem sessão válida |
| `INVALID_CREDENTIALS` | 401 | "E-mail ou senha incorretos." (FR-002) |
| `NOT_FOUND` | 404 | Recurso inexistente ou de outro organizador |
| `EMAIL_TAKEN` | 409 | E-mail já tem conta (FR-001) |
| `NAME_TAKEN` | 409 | Nome repetido no elenco (FR-011) |
| `ROSTER_FULL` | 409 | Elenco já tem 100 jogadores (FR-011) |
| `CLUB_EXISTS` | 409 | A conta já tem time (feature 005) |
| `CLUB_REQUIRED` | 409 | A conta não tem time e pediu para mudar o elenco ou sortear (feature 005) |
| `POSITIONS_MISSING` | 409 | Sorteio com 10 ou mais presentes e algum sem posição; inclui `missingPositions` (feature 003) |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Falta `Content-Type: application/json` |
| `LOGIN_LOCKED` | 429 | 5 falhas seguidas; inclui `retryAfterSeconds` (FR-003) |
| `INTERNAL_ERROR` | 500 | Falha inesperada; mensagem genérica |

## Tipos

```text
Rules       { ratingMin: number, ratingMax: number, defaultRating: number,
              passwordMinLength: number, minTeams: number, clubIcons: ClubIcon[] }
ClubIcon    "ball" | "shield" | "bolt" | "star" | "crown" | "flame" | "trophy" | "target"
Club        { name: string, icon: ClubIcon }
Organizer   { id: number, email: string }
Player      { id: number, name: string, rating: 1..5, present: boolean, position: "ATA" | "DEF" | null }
Summary     { presentCount: number, possibleTeams: number, averageRating: number | null }
RosterState { players: Player[], summary: Summary, drawStale: boolean }
PlayerRef   { id: number, name: string, rating: 1..5, position: "ATA" | "DEF" }
Team        { letter: "A".."T", vest: VestKey, players: PlayerRef[], total: number, average: number,
              positions: { ATA: number, DEF: number } }
VestKey     "green" | "white" | "orange" | "blue" | "pink" | "purple" | "yellow" | "cyan"
Draw        { createdAt: string, stale: boolean, teamSize: 5, teams: Team[], bench: PlayerRef[],
              difference: number | null, missingPlayers: number,
              positionShortage: null | { position: "ATA" | "DEF", count: number, teams: number } }
```

- `RosterState.players` vem na ordem de cadastro (FR-015).
- `Team.players` vem do maior para o menor nível (FR-026).
- `averageRating` e `Team.average` vêm sem arredondar; o frontend mostra uma casa com vírgula.
- `Draw.missingPlayers` é 0 quando há times; com menos de 10 presentes, `teams` é `[]` e `bench`
  traz todos os presentes (FR-022).
- Posição (feature 003): `position` é obrigatória no cadastro (ATA ou DEF) e `null` só para jogadores
  antigos; o sorteio divide atacantes e defensores por igual e `positionShortage` indica a posição com
  menos jogadores do que times. Detalhes em [003/contracts/api.md](../../003-player-positions/contracts/api.md).

## Regras

Pública, porque a tela de criar conta precisa dela antes do login. O frontend lê estes valores ao
abrir e não guarda cópia deles no código (constituição, Princípio II).

| Método e rota | Corpo | Sucesso | Erros |
|---------------|-------|---------|-------|
| `GET /api/rules` | — | `200 { rules: Rules }` | — |

```json
{
  "rules": {
    "ratingMin": 1,
    "ratingMax": 5,
    "defaultRating": 3,
    "passwordMinLength": 8,
    "minTeams": 2,
    "clubIcons": ["ball", "shield", "bolt", "star", "crown", "flame", "trophy", "target"]
  }
}
```

## Conta e acesso

| Método e rota | Corpo | Sucesso | Erros |
|---------------|-------|---------|-------|
| `POST /api/auth/signup` | `{ email, password }` | `201 { organizer }` + cookie | `VALIDATION_ERROR`, `EMAIL_TAKEN` |
| `POST /api/auth/login` | `{ email, password }` | `200 { organizer }` + cookie | `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `LOGIN_LOCKED` |
| `POST /api/auth/logout` 🔒 | — | `204`, cookie apagado | `UNAUTHENTICATED` |
| `GET /api/auth/me` 🔒 | — | `200 { organizer }` | `UNAUTHENTICATED` |
| `POST /api/auth/password-reset/request` | `{ email }` | `202 { message }`, sempre (FR-006) | `VALIDATION_ERROR` (formato) |
| `POST /api/auth/password-reset/confirm` | `{ token, password }` | `204`; encerra as sessões do organizador | `VALIDATION_ERROR`, `INVALID_RESET_TOKEN` |

Exemplo de `LOGIN_LOCKED`:

```json
{
  "error": {
    "code": "LOGIN_LOCKED",
    "message": "Muitas tentativas. Tente de novo em 15 minutos.",
    "retryAfterSeconds": 900
  }
}
```

## Time 🔒

Um time por conta, com nome e ícone (feature 005). Os jogadores continuam ligados à conta; o
elenco do time é o elenco da conta. Sem time, o elenco vem vazio, o sorteio vem `null` e as rotas que
mudam o elenco ou sorteiam respondem `CLUB_REQUIRED`. Detalhes em
[005/contracts/api.md](../../005-myteam-club/contracts/api.md).

| Método e rota | Corpo | Sucesso | Erros |
|---------------|-------|---------|-------|
| `GET /api/club` | — | `200 { club: Club \| null }` | — |
| `POST /api/club` | `{ name, icon? }` | `201 { club: Club }` | `VALIDATION_ERROR`, `CLUB_EXISTS` |

## Elenco e presença 🔒

Toda alteração devolve o `RosterState` completo e liga `drawStale` se já houver sorteio
(FR-031).

| Método e rota | Corpo | Sucesso | Erros |
|---------------|-------|---------|-------|
| `GET /api/roster` | — | `200 RosterState` | — |
| `POST /api/players` | `{ name, rating, position }` | `201 RosterState` | `VALIDATION_ERROR`, `CLUB_REQUIRED`, `NAME_TAKEN`, `ROSTER_FULL` |
| `PATCH /api/players/:id` | `{ rating?, present?, position? }` (ao menos um) | `200 RosterState` | `VALIDATION_ERROR`, `CLUB_REQUIRED`, `NOT_FOUND` |
| `DELETE /api/players/:id` | — | `200 RosterState` | `CLUB_REQUIRED`, `NOT_FOUND` |
| `PUT /api/players/presence` | `{ present: boolean }` | `200 RosterState` | `VALIDATION_ERROR`, `CLUB_REQUIRED` |

Exemplo de `RosterState`:

```json
{
  "players": [
    { "id": 1, "name": "Pedrinho", "rating": 4, "present": true },
    { "id": 2, "name": "Jogador 02", "rating": 3, "present": false }
  ],
  "summary": { "presentCount": 1, "possibleTeams": 0, "averageRating": 4 },
  "drawStale": false
}
```

## Sorteio 🔒

| Método e rota | Corpo | Sucesso | Erros |
|---------------|-------|---------|-------|
| `GET /api/draw` | — | `200 { draw: Draw \| null }` | — |
| `POST /api/draw` | `{}` | `201 { draw: Draw }`; substitui o anterior e zera `stale` | `CLUB_REQUIRED`, `POSITIONS_MISSING` |

Exemplo de `Draw` com 11 presentes:

```json
{
  "draw": {
    "createdAt": "2026-11-01T18:00:00.000Z",
    "stale": false,
    "teamSize": 5,
    "teams": [
      { "letter": "A", "vest": "green", "total": 17, "average": 3.4,
        "players": [ { "id": 3, "name": "Jogador 03", "rating": 5 } ] },
      { "letter": "B", "vest": "white", "total": 17, "average": 3.4,
        "players": [ { "id": 7, "name": "Jogador 07", "rating": 5 } ] }
    ],
    "bench": [ { "id": 11, "name": "Jogador 11", "rating": 3 } ],
    "difference": 0,
    "missingPlayers": 0
  }
}
```

(Times abreviados no exemplo; cada time real tem 5 jogadores.)
