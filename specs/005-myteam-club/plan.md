# Implementation Plan: MyTeam — o time do grupo

**Branch**: `005-myteam-club` | **Date**: 2026-11-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-myteam-club/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Cada conta ganha no máximo um time (nome e ícone), guardado numa tabela nova `clubs` com a conta
como chave primária. A API ganha `GET /api/club` e `POST /api/club`, e `GET /api/rules` passa a
devolver a lista de ícones. No frontend, o MyFUT vira o elenco do time (`#/myteam/elenco`), aberto
pelo card do time em `#/myteam`, que mostra "Criar time" quando a conta ainda não tem time. Os
jogadores continuam ligados à conta, mas o elenco e o sorteio passam a exigir o time (US4): sem
time, `GET /api/roster` vem vazio, `GET /api/draw` vem `null`, e mudar o elenco ou sortear responde
`409 CLUB_REQUIRED`; o Elenco mostra "Você ainda não tem um time." com "Criar time"
([research.md](research.md) §11 e §12).

## Technical Context

**Language/Version**: JavaScript (ES Modules) em Node.js 22.9 ou superior no backend; JavaScript
puro (ES2022) no navegador.

**Primary Dependencies**: nenhuma nova. Backend: Express 5, pg. Frontend: Vite.

**Storage**: PostgreSQL 17; migração `003_club.sql` (tabela `clubs`).

**Testing**: `node:test` + `node:assert`; backend com Postgres embutido (unitários e integração
HTTP); frontend com testes de `utils/`.

**Target Platform**: servidor Node.js; navegadores atuais a partir de 360 px.

**Project Type**: aplicação web (frontend + backend separados); esta feature mexe nos dois.

**Performance Goals**: as duas rotas novas fazem uma consulta cada.

**Constraints**: o backend continua a única fonte das regras (Princípio II): nome, limite e lista de
ícones são validados lá, e a tela lê a lista em `GET /api/rules`; alvos de toque de 44 px.

**Scale/Scope**: 1 tabela, 2 rotas, 2 códigos de erro, 3 telas (uma delas reaproveitada da 004) e
1 estado novo do Elenco.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio / seção | Como o plano atende | Antes | Depois do design |
|-------------------|---------------------|-------|------------------|
| I. Frontend e Backend Separados | Time criado e lido só pela API, via `services/clubApi.js` | ✅ | ✅ |
| II. Backend como Fonte da Verdade | Nome, limite, ícones válidos e "um por conta" ficam no backend; a tela só desenha os ícones que `GET /api/rules` lista | ✅ | ✅ |
| II (US4) | "Sem time não há elenco nem sorteio" fica nos serviços do elenco e do sorteio; a tela só lê o time e o elenco | ✅ | ✅ |
| III. Sorteio Justo e Verificável | As regras do sorteio não mudam; ele só passa a exigir o time (FR-018) | ✅ | ✅ |
| IV. Testes nas Regras de Negócio | Unitários do serviço do time (validação, padrão do ícone, um por conta, isolamento) e integração das rotas (sucesso + erros) e das regras; elenco e sorteio sem time nos unitários e na integração | ✅ | ✅ |
| V. Interface fiel, acessível, pt-BR | Quadros desenhados e aprovados no canvas antes do código; grade de ícones com `aria-pressed` e nomes acessíveis | ✅ | ✅ |
| VI. Simplicidade | Sem dependência nova; uma tabela; jogadores sem coluna nova | ✅ | ✅ |
| Restrições Técnicas | Novo código de erro no formato único; contrato em `contracts/` e no contrato único da 001 | ✅ | ✅ |
| Fluxo de Desenvolvimento | Spec diz "frontend e backend"; contrato antes da implementação | ✅ | ✅ |

**Resultado**: aprovado, sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/005-myteam-club/
├── plan.md              # Este arquivo
├── research.md          # Fase 0: decisões técnicas
├── data-model.md        # Fase 1: tabela, constantes e estado de tela
├── quickstart.md        # Fase 1: testes e roteiro manual
├── contracts/
│   ├── api.md           # Fase 1: rotas do time e regras
│   └── screens.md       # Fase 1: telas do MyTeam
├── checklists/
│   └── requirements.md  # Checklist de qualidade da spec
└── tasks.md             # Fase 2 (/speckit-tasks)
```

### Source Code (repository root)

Só arquivos que esta feature cria (+), altera (~), move (→) ou apaga (−):

```text
backend/
├── src/
│   ├── config/domain.js                       # ~ CLUB_ICONS, DEFAULT_CLUB_ICON, CLUB_NAME_MAX_LENGTH
│   ├── database/migrations/003_club.sql       # + tabela clubs
│   ├── validators/clubValidator.js            # + nome e ícone
│   ├── models/clubModel.js                    # + busca e cria (ON CONFLICT DO NOTHING)
│   ├── services/clubService.js                # + getClub, createClub (CLUB_EXISTS), hasClub, requireClub (CLUB_REQUIRED)
│   ├── services/rosterService.js              # ~ elenco vazio e mudanças recusadas sem time
│   ├── services/drawService.js                # ~ sem sorteio e sortear recusado sem time
│   ├── controllers/clubController.js          # + GET e POST
│   ├── controllers/rulesController.js         # ~ clubIcons
│   ├── routes/clubRoutes.js                   # + /club
│   └── routes/index.js                        # ~ registra as rotas do time
└── tests/
    ├── unit/clubService.test.js               # + regras do time
    ├── unit/testDb.js                         # ~ limpa clubs; insertClub
    ├── unit/rosterService.test.js             # ~ contas com time; casos sem time
    ├── unit/drawService.test.js               # ~ contas com time; casos sem time
    ├── integration/club.test.js               # + rotas do time; elenco e sorteio sem time
    ├── integration/players.test.js            # ~ contas com time
    ├── integration/draw.test.js               # ~ contas com time
    └── integration/rules.test.js              # ~ clubIcons

frontend/
├── src/
│   ├── main.js                                # ~ club no store; rotas /myteam e /myteam/elenco; sem /myfut
│   ├── screenActions.js                       # ~ sair limpa o time
│   ├── myteamView.js                          # + card do time ou "Criar time"; relê o elenco ao criar
│   ├── clubRosterView.js                      # + elenco do time (era myfutView.js)
│   ├── myfutView.js                           # − substituído por clubRosterView.js
│   ├── rosterView.js                          # ~ aviso com "Abrir MyTeam"; lê o time; sem time, sem rodapé
│   ├── services/clubApi.js                    # + getClub, createClub
│   ├── assets/icons/clubIcons.js              # + os 8 desenhos e seus nomes em pt-BR
│   ├── components/
│   │   ├── myfut/ → myteam/                   # → pasta renomeada
│   │   │   ├── clubForm.js                    # + nome e grade de ícones
│   │   │   ├── clubCard.js                    # + card do time
│   │   │   ├── clubRoster.js                  # → era myfut.js; título com ícone e "Convocar jogador"
│   │   │   └── clubRosterRow.js               # → era myfutRow.js
│   │   ├── header/accountMenu.js              # ~ "MyTeam"
│   │   ├── header/backHeader.js               # ~ texto e nome acessível configuráveis
│   │   └── roster/roster.js                   # ~ "Abrir MyTeam"; estado "sem time"
│   ├── styles/roster.css                      # ~ formulário, grade, card, título do time e Elenco sem time
│   └── utils/format.js                        # ~ playerCountText
└── tests/format.test.js                       # ~ playerCountText
```

**Structure Decision**: mesma estrutura "Web application". A pasta `components/myfut/` da 004 passa a
se chamar `components/myteam/`; nenhuma pasta nova além dessa troca de nome.

## Complexity Tracking

| Mudança | Por quê | Alternativa mais simples rejeitada |
|---------|---------|-------------------------------------|
| `components/myfut/` renomeada para `components/myteam/` | O nome MyFUT sai do app (FR-006) e a pasta junta as três telas do MyTeam | Manter `myfut/` deixaria o nome antigo no código |