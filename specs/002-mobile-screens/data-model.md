# Data Model: Telas de celular para Elenco e Times

**Feature**: `002-mobile-screens` | **Date**: 2026-11-05 | **Plan**: [plan.md](plan.md)

O banco, os tipos da API e as regras de domínio não mudam
([data-model da 001](../001-roster-team-draw/data-model.md)). Esta feature só acrescenta estado de
tela no frontend.

## Estado no store do frontend

| Campo | Tipo | Origem | Muda quando |
|-------|------|--------|-------------|
| `organizer` | `Organizer \| null` | API (`/auth/me`, `login`, `signup`) | entrar, sair, sessão vencida |
| `rules` | `Rules` | API (`GET /api/rules`) | ao abrir o app |
| `roster` | `RosterState \| null` | API (`/roster`, `/players`) | cada leitura ou alteração do elenco |
| `draw` | `Draw \| null` | API (`/draw`) | ao abrir uma tela e a cada sorteio |
| `shortfall` | `number \| null` | **novo**: `draw.missingPlayers` de um sorteio sem times | ver abaixo |

`shortfall`:

- recebe `draw.missingPlayers` quando um sorteio feito pelo organizador volta sem times;
- volta a `null` em qualquer alteração do elenco ou da presença, num sorteio com times e ao sair;
- não é salvo em lugar nenhum: recarregar a página começa com `null`.

O botão de sortear mostra `roster.summary.presentCount`. Os campos `possibleTeams` e
`averageRating` do resumo continuam vindo da API, mas não aparecem mais na tela.

## Telas e transições

| De | Evento | Para | Histórico |
|----|--------|------|-----------|
| Entrar / Criar conta | entrou | Elenco (`#/`) | como hoje |
| Elenco | sorteio com times | Times (`#/times`) | nova entrada |
| Elenco | sorteio sem times | Elenco, com o aviso de `shortfall` | nenhuma |
| Elenco | "Ver últimos times" | Times | nova entrada |
| Times | "← Elenco" ou voltar do aparelho | Elenco, na mesma rolagem | volta uma entrada, ou troca a atual se não veio do Elenco |
| Times | "Sortear de novo" com times | Times, com o novo sorteio | nenhuma |
| Times | "Sortear de novo" sem times | Elenco, com o aviso de `shortfall` | como "← Elenco" |
| Times | aberta sem sorteio com times | Elenco | troca a atual |
| qualquer | sessão vencida | Entrar | como hoje |
| Elenco | "Sair" | Entrar | como hoje |

"Sorteio com times" e "sem times" são decididos por `hasTeams(draw)`
([research.md §5](research.md#5-para-qual-tela-ir-depois-do-sorteio)), lendo só o que a API
devolveu.
