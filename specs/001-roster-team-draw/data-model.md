# Data Model: Elenco, presença e sorteio de times

**Feature**: `001-roster-team-draw` | **Date**: 2026-11-01 | **Plan**: [plan.md](plan.md)

Banco PostgreSQL 17 ([research.md §1](research.md)). Datas em `TIMESTAMPTZ`; a API as devolve em ISO 8601 UTC
(`2026-11-01T18:00:00.000Z`). Ids são `INTEGER GENERATED ALWAYS AS IDENTITY`. Toda tabela com
`organizer_id` usa `ON DELETE CASCADE`. Todas têm RLS ligado, sem políticas: o backend conecta como dono das
tabelas e a API pública do Supabase não lê nada.

## Constantes de domínio

Ficam só em `backend/src/config/domain.js` (Princípio III). A tela recebe as que precisa por
`GET /api/rules` ([contracts/api.md](contracts/api.md)).

| Constante | Valor | Origem |
|-----------|-------|--------|
| `TEAM_SIZE` | 5 | spec, Assumptions |
| `MIN_TEAMS` | 2 | FR-020, FR-022 |
| `MAX_PLAYERS` | 100 | FR-011 |
| `NAME_MAX_LENGTH` | 40 | FR-010 |
| `RATING_MIN` / `RATING_MAX` / `DEFAULT_RATING` | 1 / 5 / 3 | FR-010 |
| `PASSWORD_MIN_LENGTH` | 8 | FR-001 |
| `SESSION_DAYS` | 30 | FR-004 |
| `LOGIN_MAX_FAILURES` / `LOGIN_LOCK_MINUTES` | 5 / 15 | FR-003 |
| `RESET_TOKEN_MINUTES` / `RESET_MAX_PER_HOUR` | 60 / 3 | FR-006, research §7 |
| `VESTS` | `green, white, orange, blue, pink, purple, yellow, cyan` | FR-026 |

## Entidades

### organizers (Organizador)

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | INTEGER PK | |
| `email` | TEXT NOT NULL UNIQUE | Guardado sem espaços nas pontas e em minúsculas; formato de e-mail válido (FR-001) |
| `password_hash` | TEXT NOT NULL | Formato scrypt de research §3; a senha nunca é guardada (FR-008) |
| `created_at` | TIMESTAMPTZ NOT NULL | |

### sessions

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | INTEGER PK | |
| `organizer_id` | INTEGER NOT NULL FK → organizers | |
| `token_hash` | TEXT NOT NULL UNIQUE | SHA-256 do token do cookie `sid` |
| `created_at` | TIMESTAMPTZ NOT NULL | |
| `expires_at` | TIMESTAMPTZ NOT NULL | `created_at` + 30 dias |

Sessão vencida é tratada como inexistente e apagada na leitura.

### password_resets

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | INTEGER PK | |
| `organizer_id` | INTEGER NOT NULL FK → organizers | |
| `token_hash` | TEXT NOT NULL UNIQUE | SHA-256 do token do link |
| `created_at` | TIMESTAMPTZ NOT NULL | Usado no limite de 3 por hora |
| `expires_at` | TIMESTAMPTZ NOT NULL | `created_at` + 60 min |
| `used_at` | TIMESTAMPTZ NULL | Preenchido no uso; token usado é rejeitado |

### login_throttle

| Campo | Tipo | Regras |
|-------|------|--------|
| `email` | TEXT PK | E-mail normalizado, com ou sem conta |
| `failed_count` | INTEGER NOT NULL DEFAULT 0 | Falhas seguidas |
| `locked_until` | TIMESTAMPTZ NULL | Preenchido na 5ª falha |
| `updated_at` | TIMESTAMPTZ NOT NULL | |

### players (Jogador)

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | INTEGER PK | A ordem do id é a ordem de cadastro (FR-015) |
| `organizer_id` | INTEGER NOT NULL FK → organizers | Cada organizador só vê os seus (FR-007) |
| `name` | TEXT NOT NULL | Sem espaços nas pontas; de 1 a 40 caracteres (FR-010) |
| `name_key` | TEXT NOT NULL | `name` em minúsculas (pt-BR); `UNIQUE(organizer_id, name_key)` (FR-011) |
| `rating` | SMALLINT NOT NULL | `CHECK (rating BETWEEN 1 AND 5)` |
| `present` | BOOLEAN NOT NULL DEFAULT TRUE | Jogador novo entra presente (FR-012) |
| `created_at` | TIMESTAMPTZ NOT NULL | |

O limite de 100 jogadores por organizador é conferido no serviço, dentro da mesma transação do
cadastro (FR-011).

### draws (Sorteio)

| Campo | Tipo | Regras |
|-------|------|--------|
| `organizer_id` | INTEGER PK FK → organizers | Um sorteio por organizador; um novo substitui o anterior |
| `created_at` | TIMESTAMPTZ NOT NULL | |
| `teams_json` | JSONB NOT NULL | Array de arrays de ids de jogador, na ordem dos times (A, B, ...) |
| `bench_json` | JSONB NOT NULL | Array de ids de jogador no banco |
| `stale` | BOOLEAN NOT NULL DEFAULT FALSE | `TRUE` depois de qualquer alteração no elenco (FR-031) |

**Time** não é tabela: na leitura, cada posição de `teams_json` vira um time com letra
(`A` + índice), colete (`VESTS[índice mod 8]`), jogadores atuais ordenados por nível
decrescente, total e média. Ids que não existem mais no elenco são omitidos (FR-032).

## Valores derivados (calculados no backend)

- **Resumo** (FR-018): `presentCount` = jogadores com `present` verdadeiro; `possibleTeams` =
  `floor(presentCount / TEAM_SIZE)`; `averageRating` = média dos níveis dos presentes, ou `null`
  sem presentes.
- **Diferença** (FR-027): maior total menos menor total entre os times; `null` sem times.
- **Jogadores faltando** (FR-022): `max(0, MIN_TEAMS × TEAM_SIZE − presentCount)`.

## Transições de estado

```text
Jogador.present:  presente ⇄ ausente   (toque, "Todos presentes", "Limpar")

Sorteio:          (nenhum) ──sortear──▶ atual (stale falso)
                  atual ──alteração no elenco──▶ desatualizado (stale verdadeiro)
                  desatualizado ──sortear──▶ atual (stale falso)

login_throttle:   livre ──falha──▶ n falhas ──5ª falha──▶ bloqueado (15 min)
                  bloqueado ──prazo vence──▶ livre;  qualquer estado ──login certo──▶ livre

password_resets:  válido ──uso──▶ usado;  válido ──60 min──▶ vencido
```

As alterações no elenco que ligam `stale`: cadastrar, remover, mudar o nível, mudar a presença
de um jogador, "Todos presentes" e "Limpar".
