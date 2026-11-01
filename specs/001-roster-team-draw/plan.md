# Implementation Plan: Elenco, presença e sorteio de times

**Branch**: `001-roster-team-draw` | **Date**: 2026-11-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-roster-team-draw/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

O organizador cria uma conta, cadastra o elenco com níveis de 1 a 5 estrelas, marca quem veio
e sorteia times de 5 equilibrados, com banco aleatório para quem sobra. O backend Express guarda
tudo em SQLite, calcula resumo e sorteio e expõe uma API REST JSON sob `/api` com sessão por
cookie. O frontend em JavaScript puro com Vite só chama a API e mostra o resultado. O sorteio
usa banco aleatório, divisão gulosa e refinamento por trocas até nenhuma troca entre dois times
diminuir a diferença entre eles ([research.md §9](research.md)).

## Technical Context

**Language/Version**: JavaScript (ES Modules) em Node.js 22 LTS no backend; JavaScript puro
(ES2022) no navegador.

**Primary Dependencies**: backend: Express 5, better-sqlite3, nodemailer, helmet,
cookie-parser. Frontend: Vite (só desenvolvimento e build). Justificativas em
[research.md](research.md#dependências-justificativa-exigida-pelo-princípio-vi).

**Storage**: SQLite em arquivo (`backend/data/`, não versionado); em memória nos testes.

**Testing**: `node:test` + `node:assert` nos dois projetos; integração HTTP com o app em porta
efêmera e `fetch` nativo.

**Target Platform**: servidor Node.js 22 (Linux ou Windows) com disco persistente; navegadores
atuais (Chrome, Safari iOS, Firefox, Edge), a partir de 360 px de largura.

**Project Type**: aplicação web (frontend + backend separados).

**Performance Goals**: times na tela em menos de 2 s com até 100 presentes (SC-006); demais
respostas da API abaixo de 300 ms em uso normal.

**Constraints**: frontend e API na mesma origem (cookie `SameSite=Lax`); sem CORS; nenhum dado
do elenco no `localStorage`; nenhum dado do usuário via `innerHTML`.

**Scale/Scope**: dezenas de organizadores, até 100 jogadores cada; 5 telas (entrar, criar conta,
esqueci a senha, nova senha, principal); 13 endpoints.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio / seção | Como o plano atende | Antes | Depois do design |
|-------------------|---------------------|-------|------------------|
| I. Frontend e Backend Separados | Dois `package.json`; só HTTP/JSON entre eles; camadas `routes → controllers → services → models`; no frontend, só `services/` chama a API | ✅ | ✅ |
| II. Backend como Fonte da Verdade | Resumo, sorteio, banco e validação no backend; frontend só formata; sessão em cookie `HttpOnly`, nada do elenco no `localStorage` | ✅ | ✅ |
| III. Sorteio Justo e Verificável | `TEAM_SIZE` só em `config/domain.js`; mínimo 2 times; cada presente uma vez; diferença na resposta; `rng` injetável | ✅ | ✅ |
| IV. Testes nas Regras de Negócio | Testes unitários para cada serviço e para cada regra do sorteio; integração para cada endpoint (sucesso + erro) | ✅ | ✅ |
| V. Interface fiel, acessível, pt-BR | Tela principal segue o canvas; telas de conta **devem ser desenhadas no canvas antes de implementadas** (vira tarefa); controles nativos, 44 px, 4,5:1, 360 px | ⚠ condicionado | ⚠ condicionado |
| VI. Simplicidade | Sem framework de UI; 5 dependências de backend e 1 de frontend, todas justificadas; pastas novas registradas em Complexity Tracking | ✅ | ✅ |
| Restrições Técnicas | Node 22, ES Modules, Express sob `/api`, formato único de erro em [contracts/api.md](contracts/api.md), código em inglês, `.env` fora do repositório, banco escolhido (SQLite) | ✅ | ✅ |
| Fluxo de Desenvolvimento | Spec diz "frontend e backend"; contratos antes da implementação; estrutura "Web application" | ✅ | ✅ |

**Resultado**: aprovado. O item V não é violação: ele só impede implementar as telas de conta
antes de desenhá-las no canvas, e o `/speckit-tasks` precisa incluir essa tarefa antes delas.

## Project Structure

### Documentation (this feature)

```text
specs/001-roster-team-draw/
├── plan.md              # Este arquivo
├── research.md          # Fase 0: decisões técnicas
├── data-model.md        # Fase 1: tabelas, constantes e estados
├── quickstart.md        # Fase 1: como subir e validar
├── contracts/
│   └── api.md           # Fase 1: contrato da API REST
├── checklists/
│   └── requirements.md  # Checklist de qualidade da spec
└── tasks.md             # Fase 2 (/speckit-tasks; ainda não criado)
```

### Source Code (repository root)

```text
backend/
├── package.json
├── .env.example
├── data/                          # arquivo SQLite (não versionado)
├── src/
│   ├── server.js                  # sobe o HTTP
│   ├── app.js                     # monta o Express (usado também nos testes)
│   ├── config/
│   │   ├── env.js                 # lê e valida variáveis de ambiente
│   │   └── domain.js              # TEAM_SIZE e demais constantes do data-model
│   ├── database/
│   │   ├── connection.js
│   │   ├── migrate.js
│   │   └── migrations/
│   │       └── 001_initial.sql
│   ├── routes/                    # authRoutes, playerRoutes, drawRoutes, index
│   ├── controllers/               # authController, playerController, drawController
│   ├── services/
│   │   ├── authService.js         # cadastro, login, bloqueio
│   │   ├── sessionService.js
│   │   ├── passwordResetService.js
│   │   ├── mailService.js
│   │   ├── rosterService.js       # elenco, presença, resumo, marca sorteio como stale
│   │   ├── drawService.js         # monta e lê o sorteio
│   │   └── teamBalancer.js        # algoritmo puro do sorteio (research §9)
│   ├── models/                    # organizer, session, passwordReset, loginThrottle, player, draw
│   ├── middlewares/               # requireAuth, requireJson, errorHandler
│   ├── validators/                # authValidator, playerValidator
│   └── utils/                     # crypto (scrypt, tokens), random (rng, shuffle, seeded), AppError
└── tests/
    ├── unit/                      # teamBalancer, drawService, rosterService, authService, ...
    └── integration/               # auth, players, draw

frontend/
├── package.json
├── vite.config.js                 # proxy /api → http://localhost:3000
├── index.html
├── public/
├── src/
│   ├── main.js
│   ├── router.js                  # rotas por hash
│   ├── assets/
│   │   ├── fonts/                 # Barlow e Barlow Condensed (woff2)
│   │   └── icons/
│   ├── styles/                    # tokens.css (cores do canvas), base.css
│   ├── components/
│   │   ├── auth/                  # entrar, criar conta, esqueci a senha, nova senha
│   │   ├── header/                # logo + resumo
│   │   ├── roster/                # elenco e linha do jogador
│   │   ├── player-form/           # "Novo jogador"
│   │   ├── star-rating/           # estrelas 1–5
│   │   ├── teams/                 # "Times da rodada", card do time, aviso de lista alterada
│   │   └── bench/                 # "Próximos · aguardando vaga"
│   ├── services/                  # apiClient, authApi, rosterApi, drawApi
│   ├── state/                     # store com assinantes
│   └── utils/                     # dom (h()), format (vírgula, iniciais, plural), vests
└── tests/                         # format, store
```

**Structure Decision**: estrutura "Web application", usando as pastas `frontend/` e `backend/`
já criadas. As pastas novas estão justificadas abaixo, conforme o Princípio VI.

## Complexity Tracking

Não há violações. A tabela registra as pastas fora da estrutura original, como pede o
Princípio VI.

| Pasta nova | Por que é necessária | Alternativa mais simples descartada porque |
|------------|----------------------|--------------------------------------------|
| `backend/src/database/migrations/` | Versionar o esquema do SQLite | SQL dentro do código mistura esquema e lógica de conexão |
| `backend/data/` | Guardar o arquivo do banco fora de `src/` | Dentro de `src/` o arquivo de dados se misturaria ao código |
| `backend/tests/unit/` e `backend/tests/integration/` | Separar testes rápidos dos que sobem o servidor | Uma pasta só não deixa rodar os grupos separadamente |
| `frontend/tests/` | Testes de `utils/` e `state/` (Princípio IV) | Testes dentro de `src/` iriam para o build |
| `frontend/src/components/auth/` | 4 telas de conta exigidas pela US1 | Espalhar as telas de conta nas pastas da tela principal confundiria responsabilidades |
