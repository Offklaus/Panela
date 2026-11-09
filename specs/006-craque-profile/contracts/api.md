# API Contract: perfil do Craque

**Feature**: `006-craque-profile` | **Date**: 2026-11-08 | **Plan**: [../plan.md](../plan.md)

Mudanças sobre o [contrato da API da 001](../../001-roster-team-draw/contracts/api.md). O que não
aparece aqui continua igual. Nenhum código de erro novo.

## Tipos

```text
DominantFoot  "right" | "left" | "both"
Profile       { nickname: string, birthDate: string ("YYYY-MM-DD"), age: integer,
                position: "ATA" | "DEF", foot: DominantFoot }
Rules         { ..., dominantFeet: DominantFoot[] }
```

## Regras

`GET /api/rules` passa a devolver `dominantFeet`, na ordem dos botões:

```json
{ "rules": { "ratingMin": 1, "ratingMax": 5, "defaultRating": 3, "passwordMinLength": 8, "minTeams": 2,
  "clubIcons": ["ball", "shield", "bolt", "star", "crown", "flame", "trophy", "target"],
  "dominantFeet": ["right", "left", "both"] } }
```

## Perfil 🔒

| Método e rota | Corpo | Sucesso | Erros |
|---------------|-------|---------|-------|
| `GET /api/profile` | — | `200 { profile: Profile \| null }` | `UNAUTHENTICATED` |
| `PUT /api/profile` | `{ nickname, birthDate, position, foot }` | `200 { profile: Profile }`; cria ou substitui | `UNAUTHENTICATED`, `VALIDATION_ERROR` |

Os erros de `VALIDATION_ERROR` vêm um por vez, nesta ordem, com `field`:

| `field` | Mensagens |
|---------|-----------|
| `nickname` | "Informe o apelido."; "O apelido pode ter no máximo 40 caracteres." |
| `birthDate` | "Informe a data de nascimento."; "Data de nascimento inválida."; "A data de nascimento não pode ser no futuro."; "Confira a data: a idade precisa ficar entre 5 e 100 anos." |
| `position` | "Escolha a posição." |
| `foot` | "Escolha a perna dominante." |

- `nickname`: os espaços das pontas saem.
- `birthDate`: texto `YYYY-MM-DD`; "hoje" é a data em `America/Sao_Paulo`.
- `age`: idade completa em anos nessa data; não é aceita no corpo.
- Um pedido com erro não muda o perfil.

```json
{ "profile": { "nickname": "Pedrinho", "birthDate": "1998-04-12", "age": 28, "position": "ATA", "foot": "right" } }
```
