# Data Model: MyTeam — o time do grupo

**Feature**: `005-myteam-club` | **Date**: 2026-11-07 | **Plan**: [plan.md](plan.md)

Mudanças em relação ao [data-model da 001](../001-roster-team-draw/data-model.md) e ao da
[003](../003-player-positions/data-model.md).

## Constantes de domínio novas

| Constante | Valor | Origem |
|-----------|-------|--------|
| `CLUB_ICONS` | `ball`, `shield`, `bolt`, `star`, `crown`, `flame`, `trophy`, `target` | FR-003 |
| `DEFAULT_CLUB_ICON` | `ball` | FR-003 |
| `CLUB_NAME_MAX_LENGTH` | 40 | FR-002 |

Ficam em `backend/src/config/domain.js`, com as demais.

## Banco

### clubs (tabela nova)

| Campo | Tipo | Regras |
|-------|------|--------|
| `organizer_id` | INTEGER, chave primária, `REFERENCES organizers (id) ON DELETE CASCADE` | Um time por conta (FR-001) |
| `name` | TEXT NOT NULL | Sem espaços nas pontas, 1 a 40 caracteres (FR-002) |
| `icon` | TEXT NOT NULL, `CHECK (icon IN (…8 ids…))` | Um dos `CLUB_ICONS` (FR-003) |
| `created_at` | TIMESTAMPTZ NOT NULL | Momento da criação |

RLS ligado, como nas outras tabelas. Migração: `backend/src/database/migrations/003_club.sql`,
aplicada ao subir o backend. Nenhuma conta ganha time automaticamente.

### players

Sem mudança: o elenco do time é o elenco da conta ([research.md §3](research.md)).

## Estado de tela no frontend

| Campo | Tipo | Origem | Muda quando |
|-------|------|--------|-------------|
| `club` | `undefined \| null \| { name, icon }` | **novo**: `GET /api/club` e `POST /api/club` | lido ao abrir `#/myteam` e `#/myteam/elenco`; recebe o time criado; volta a `undefined` ao sair |
| `rules.clubIcons` | `string[]` | `GET /api/rules` | lido uma vez ao abrir o app |