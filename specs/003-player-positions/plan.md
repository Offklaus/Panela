# Implementation Plan: Posição dos jogadores e sorteio por posição

**Branch**: `003-player-positions` | **Date**: 2026-11-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-player-positions/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Cada jogador passa a ter uma posição (ATA ou DEF; `NULL` para os antigos), guardada numa coluna
nova de `players`. O sorteio é bloqueado com `POSITIONS_MISSING` se algum presente não tiver
posição; senão, o balanceador escolhe o banco sem tirar jogadores de uma posição no limite, espalha
atacantes e defensores por igual entre os times e equilibra as estrelas trocando só jogadores da
mesma posição ([research.md](research.md)). A API passa a devolver a posição dos jogadores, as
contagens por time e a posição em falta; as duas telas mostram isso como nos quadros aprovados do
canvas.

## Technical Context

**Language/Version**: JavaScript (ES Modules) em Node.js 22.9 ou superior no backend; JavaScript
puro (ES2022) no navegador.

**Primary Dependencies**: nenhuma nova. Backend: Express 5, pg. Frontend: Vite.

**Storage**: PostgreSQL 17; migração `002_player_position.sql` (coluna `players.position`).

**Testing**: `node:test` + `node:assert`; backend com Postgres embutido (unitários e integração
HTTP); frontend com testes de `utils/`.

**Target Platform**: servidor Node.js; navegadores atuais a partir de 360 px.

**Project Type**: aplicação web (frontend + backend separados); esta feature mexe nos dois.

**Performance Goals**: times em menos de 2 s com até 100 presentes (SC-007); o balanceador continua
polinomial (guloso + trocas).

**Constraints**: o backend continua a única fonte das regras (Princípio II); `rng` injetável para
testes determinísticos (Princípio III); alvos de toque de 44 px.

**Scale/Scope**: 1 coluna nova, 1 código de erro novo, 3 campos novos na resposta do sorteio,
cerca de 15 arquivos alterados entre backend e frontend.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio / seção | Como o plano atende | Antes | Depois do design |
|-------------------|---------------------|-------|------------------|
| I. Frontend e Backend Separados | Posição validada e usada no backend; o frontend só envia e mostra, por `services/` | ✅ | ✅ |
| II. Backend como Fonte da Verdade | Bloqueio, banco, divisão, contagens e posição em falta calculados no backend; o frontend só formata os textos | ✅ | ✅ |
| III. Sorteio Justo e Verificável | Regras novas em `teamBalancer.js` com `rng` injetável; `POSITIONS` em `domain.js`; resultado continua com diferença e agora contagens | ✅ | ✅ |
| IV. Testes nas Regras de Negócio | Testes unitários para cada regra nova do sorteio (divisão, banco, equilíbrio na posição, falta) e para validação e bloqueio; integração para os endpoints alterados (sucesso + erro) | ✅ | ✅ |
| V. Interface fiel, acessível, pt-BR | Quadros desenhados e aprovados no canvas antes do código; etiquetas com 44 px e nome acessível | ✅ | ✅ |
| VI. Simplicidade | Sem dependência nova; uma coluna; sem tabela nova | ✅ | ✅ |
| Restrições Técnicas | Novo código de erro no formato único; contrato atualizado em `contracts/` | ✅ | ✅ |
| Fluxo de Desenvolvimento | Spec diz "frontend e backend"; contrato antes da implementação | ✅ | ✅ |

**Resultado**: aprovado, sem violações. O contrato da API da 001
(`specs/001-roster-team-draw/contracts/api.md`) é o contrato único do projeto e precisa receber as
mudanças de [contracts/api.md](contracts/api.md) (tarefa de polimento).

## Project Structure

### Documentation (this feature)

```text
specs/003-player-positions/
├── plan.md              # Este arquivo
├── research.md          # Fase 0: decisões técnicas
├── data-model.md        # Fase 1: coluna, constante, regras e estado de tela
├── quickstart.md        # Fase 1: testes e roteiro manual
├── contracts/
│   └── api.md           # Fase 1: mudanças na API e nas telas
├── checklists/
│   └── requirements.md  # Checklist de qualidade da spec
└── tasks.md             # Fase 2 (/speckit-tasks)
```

### Source Code (repository root)

Só arquivos que esta feature cria (+) ou altera (~):

```text
backend/
├── src/
│   ├── config/domain.js                       # ~ POSITIONS
│   ├── database/migrations/002_player_position.sql  # + coluna players.position
│   ├── validators/playerValidator.js          # ~ validatePosition; cadastro exige, PATCH aceita
│   ├── models/playerModel.js                  # ~ position no SELECT, no INSERT e updatePosition
│   ├── services/
│   │   ├── rosterService.js                   # ~ grava e altera a posição
│   │   ├── teamBalancer.js                    # ~ banco com cota, divisão por posição, trocas na mesma posição
│   │   └── drawService.js                     # ~ POSITIONS_MISSING; positions e positionShortage na leitura
└── tests/
    ├── unit/teamBalancer.test.js              # ~ posição nos jogadores; regras novas
    ├── unit/rosterService.test.js             # ~ cadastro e PATCH com posição
    ├── unit/drawService.test.js               # ~ bloqueio e campos novos
    ├── integration/players.test.js            # ~ position no corpo; erro sem posição
    └── integration/draw.test.js               # ~ POSITIONS_MISSING; contagens

frontend/
├── src/
│   ├── services/apiClient.js                  # ~ ApiError.missingPositions
│   ├── screenActions.js                       # ~ trata POSITIONS_MISSING (pendingPositions)
│   ├── main.js                                # ~ pendingPositions no store
│   ├── rosterView.js                          # ~ troca de posição; aviso de posição pendente
│   ├── components/
│   │   ├── player-form/playerForm.js          # ~ grupo "Posição"
│   │   ├── roster/rosterRow.js                # ~ etiqueta de posição
│   │   ├── roster/roster.js                   # ~ repassa onPosition
│   │   ├── teams/teamCard.js                  # ~ contagem e etiqueta por jogador
│   │   ├── teams/teams.js                     # ~ aviso de posição em falta
│   │   └── bench/bench.js                     # ~ posição no banco
│   ├── styles/roster.css, teams.css           # ~ etiquetas e grupo de posição
│   └── utils/format.js                        # ~ positionCountText, positionShortageText, pendingPositionsText
└── tests/format.test.js                       # ~ testes dos textos novos
```

**Structure Decision**: mesma estrutura "Web application". Nenhuma pasta nova.

## Complexity Tracking

Não há violações nem pastas novas.
