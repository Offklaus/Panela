# Data Model: Craque — o perfil de jogador da conta

**Feature**: `006-craque-profile` | **Date**: 2026-11-08 | **Plan**: [plan.md](plan.md)

Mudanças em relação ao [data-model da 005](../005-myteam-club/data-model.md).

## Constantes de domínio novas

| Constante | Valor | Origem |
|-----------|-------|--------|
| `DOMINANT_FEET` | `right`, `left`, `both` | FR-004 |
| `NICKNAME_MAX_LENGTH` | 40 | FR-002 |
| `PROFILE_MIN_AGE` | 5 | FR-003 |
| `PROFILE_MAX_AGE` | 100 | FR-003 |
| `APP_TIME_ZONE` | `America/Sao_Paulo` | FR-005 |

Ficam em `backend/src/config/domain.js`, com as demais. As posições são as `POSITIONS` da 003.

## Banco

### profiles (tabela nova)

| Campo | Tipo | Regras |
|-------|------|--------|
| `organizer_id` | INTEGER, chave primária, `REFERENCES organizers (id) ON DELETE CASCADE` | Um perfil por conta (FR-001) |
| `nickname` | TEXT NOT NULL | Sem espaços nas pontas, 1 a 40 caracteres (FR-002) |
| `birth_date` | DATE NOT NULL | Não pode ser no futuro; idade de 5 a 100 anos (FR-003) |
| `position` | TEXT NOT NULL, `CHECK (position IN ('ATA', 'DEF'))` | FR-004 |
| `foot` | TEXT NOT NULL, `CHECK (foot IN ('right', 'left', 'both'))` | FR-004 |
| `updated_at` | TIMESTAMPTZ NOT NULL | Último salvamento |

RLS ligado, como nas outras tabelas. Migração: `backend/src/database/migrations/004_profile.sql`,
aplicada ao subir o backend. Nenhuma conta ganha perfil automaticamente.

## Perfil na API

```text
Profile { nickname: string, birthDate: "YYYY-MM-DD", age: integer, position: "ATA" | "DEF",
          foot: "right" | "left" | "both" }
```

`age` não é guardada: o serviço calcula a cada leitura (research §3).

## Estado de tela no frontend

| Campo | Tipo | Origem | Muda quando |
|-------|------|--------|-------------|
| `profile` | `undefined \| null \| Profile` | **novo**: `GET /api/profile` e `PUT /api/profile` | lido ao abrir `#/craque`; recebe o perfil salvo; volta a `undefined` ao sair |
| `rules.dominantFeet` | `string[]` | `GET /api/rules` | lido uma vez ao abrir o app |
