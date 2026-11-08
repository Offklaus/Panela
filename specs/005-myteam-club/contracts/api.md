# API Contract: time do MyTeam

**Feature**: `005-myteam-club` | **Date**: 2026-11-07 | **Plan**: [../plan.md](../plan.md)

Mudanças sobre o [contrato da API da 001](../../001-roster-team-draw/contracts/api.md). O que não
aparece aqui continua igual.

## Tipos

```text
ClubIcon    "ball" | "shield" | "bolt" | "star" | "crown" | "flame" | "trophy" | "target"
Club        { name: string, icon: ClubIcon }
Rules       { ..., clubIcons: ClubIcon[] }
```

## Erros novos

| Código | HTTP | Quando |
|--------|------|--------|
| `CLUB_EXISTS` | 409 | A conta já tem time (FR-004); o time existente não muda |
| `CLUB_REQUIRED` | 409 | A conta não tem time e pediu para mudar o elenco ou sortear (FR-018); nada muda |

## Regras

`GET /api/rules` passa a devolver `clubIcons`, na ordem da grade:

```json
{ "rules": { "ratingMin": 1, "ratingMax": 5, "defaultRating": 3, "passwordMinLength": 8, "minTeams": 2,
  "clubIcons": ["ball", "shield", "bolt", "star", "crown", "flame", "trophy", "target"] } }
```

## Time 🔒

| Método e rota | Corpo | Sucesso | Erros |
|---------------|-------|---------|-------|
| `GET /api/club` | — | `200 { club: Club \| null }` | `UNAUTHENTICATED` |
| `POST /api/club` | `{ name, icon? }` | `201 { club: Club }` | `UNAUTHENTICATED`, `VALIDATION_ERROR`, `CLUB_EXISTS` |

- `name`: obrigatório; os espaços das pontas saem; até 40 caracteres. Erros com `field: "name"`:
  "Informe o nome do time." e "O nome do time pode ter no máximo 40 caracteres.".
- `icon`: opcional; sem ele, `ball`. Fora da lista: `field: "icon"`, "Escolha um ícone da lista.".
- `CLUB_EXISTS`: "Você já tem um time.".

```json
{ "club": { "name": "Os Boleiros", "icon": "shield" } }
```

## Elenco e sorteio sem time (US4)

As rotas do elenco e do sorteio da 001 passam a exigir o time da conta:

| Rota | Sem time |
|------|----------|
| `GET /api/roster` | `200` com `players: []`, resumo zerado e `drawStale: false` |
| `GET /api/draw` | `200 { draw: null }`, mesmo que haja um sorteio antigo guardado |
| `POST /api/players`, `PATCH /api/players/:id`, `DELETE /api/players/:id`, `PUT /api/players/presence`, `POST /api/draw` | `409 CLUB_REQUIRED`, "Crie o seu time no MyTeam primeiro."; nada muda |

- Os erros de validação (`VALIDATION_ERROR`) vêm antes de `CLUB_REQUIRED`.
- Com o time criado, as rotas voltam a mostrar os jogadores já cadastrados na conta, com a presença
  que tinham, e o último sorteio.