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
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Falta `Content-Type: application/json` |
| `LOGIN_LOCKED` | 429 | 5 falhas seguidas; inclui `retryAfterSeconds` (FR-003) |
| `INTERNAL_ERROR` | 500 | Falha inesperada; mensagem genérica |

## Tipos

```text
Organizer   { id: number, email: string }
Player      { id: number, name: string, rating: 1..5, present: boolean }
Summary     { presentCount: number, possibleTeams: number, averageRating: number | null }
RosterState { players: Player[], summary: Summary, drawStale: boolean }
PlayerRef   { id: number, name: string, rating: 1..5 }
Team        { letter: "A".."T", vest: VestKey, players: PlayerRef[], total: number, average: number }
VestKey     "green" | "white" | "orange" | "blue" | "pink" | "purple" | "yellow" | "cyan"
Draw        { createdAt: string, stale: boolean, teamSize: 5, teams: Team[], bench: PlayerRef[],
              difference: number | null, missingPlayers: number }
```

- `RosterState.players` vem na ordem de cadastro (FR-015).
- `Team.players` vem do maior para o menor nível (FR-026).
- `averageRating` e `Team.average` vêm sem arredondar; o frontend mostra uma casa com vírgula.
- `Draw.missingPlayers` é 0 quando há times; com menos de 10 presentes, `teams` é `[]` e `bench`
  traz todos os presentes (FR-022).

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

## Elenco e presença 🔒

Toda alteração devolve o `RosterState` completo e liga `drawStale` se já houver sorteio
(FR-031).

| Método e rota | Corpo | Sucesso | Erros |
|---------------|-------|---------|-------|
| `GET /api/roster` | — | `200 RosterState` | — |
| `POST /api/players` | `{ name, rating }` | `201 RosterState` | `VALIDATION_ERROR`, `NAME_TAKEN`, `ROSTER_FULL` |
| `PATCH /api/players/:id` | `{ rating? , present? }` (ao menos um) | `200 RosterState` | `VALIDATION_ERROR`, `NOT_FOUND` |
| `DELETE /api/players/:id` | — | `200 RosterState` | `NOT_FOUND` |
| `PUT /api/players/presence` | `{ present: boolean }` | `200 RosterState` | `VALIDATION_ERROR` |

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
| `POST /api/draw` | `{}` | `201 { draw: Draw }`; substitui o anterior e zera `stale` | — |

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
