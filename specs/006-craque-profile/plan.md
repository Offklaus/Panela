# Implementation Plan: Craque — o perfil de jogador da conta

**Branch**: `006-craque-profile` | **Date**: 2026-11-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-craque-profile/spec.md`

## Summary

Cada conta ganha no máximo um perfil de Craque (apelido, data de nascimento, posição e perna
dominante), guardado numa tabela nova `profiles` com a conta como chave primária. A API ganha
`GET /api/profile` e `PUT /api/profile`; a resposta traz a idade, calculada no backend pela data de
hoje em `America/Sao_Paulo`. `GET /api/rules` passa a listar as pernas. No frontend, o menu da conta
ganha "Craque", que abre `#/craque`: formulário sem perfil, card com os três blocos com perfil e o
mesmo formulário preenchido para editar ([research.md](research.md)).

## Technical Context

**Language/Version**: JavaScript (ES Modules) em Node.js 22.9 ou superior no backend; JavaScript
puro (ES2022) no navegador.

**Primary Dependencies**: nenhuma nova. Backend: Express 5, pg. Frontend: Vite. A data no fuso de
Brasília usa `Intl.DateTimeFormat`, que já vem no Node.

**Storage**: PostgreSQL 17; migração `004_profile.sql` (tabela `profiles`).

**Testing**: `node:test` + `node:assert`; backend com Postgres embutido (unitários e integração
HTTP); frontend com testes de `utils/`.

**Target Platform**: servidor Node.js; navegadores atuais a partir de 360 px.

**Project Type**: aplicação web (frontend + backend separados); esta feature mexe nos dois.

**Performance Goals**: as duas rotas novas fazem uma consulta cada.

**Constraints**: o backend continua a única fonte das regras (Princípio II): apelido, data,
limites de idade, posições, pernas e o cálculo da idade ficam lá; a tela só mostra o que a API
devolve. Alvos de toque de 44 px.

**Scale/Scope**: 1 tabela, 2 rotas, 1 tela com três estados, 1 item no menu.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio / seção | Como o plano atende | Antes | Depois do design |
|-------------------|---------------------|-------|------------------|
| I. Frontend e Backend Separados | Perfil lido e salvo só pela API, via `services/profileApi.js` | ✅ | ✅ |
| II. Backend como Fonte da Verdade | Validação, limites de idade e a idade calculada ficam no backend; a tela lê as pernas em `GET /api/rules` | ✅ | ✅ |
| III. Sorteio Justo e Verificável | Sorteio não muda; o Craque não entra no elenco | ✅ | ✅ |
| IV. Testes nas Regras de Negócio | Unitários do serviço do perfil e das funções de data; integração das rotas (sucesso + erros) e das regras | ✅ | ✅ |
| V. Interface fiel, acessível, pt-BR | Quadros aprovados no canvas antes do código; grupos com `aria-pressed`, rótulos e erros ligados aos campos | ✅ | ✅ |
| VI. Simplicidade | Sem dependência nova; uma tabela; uma pasta de componentes nova registrada abaixo | ✅ | ✅ |
| Restrições Técnicas | Erros no formato único; contrato em `contracts/` e no contrato único da 001 | ✅ | ✅ |
| Fluxo de Desenvolvimento | Spec diz "frontend e backend"; contrato antes da implementação | ✅ | ✅ |

**Resultado**: aprovado; a pasta nova está em Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/006-craque-profile/
├── plan.md              # Este arquivo
├── research.md          # Fase 0: decisões técnicas
├── data-model.md        # Fase 1: tabela, constantes e estado de tela
├── quickstart.md        # Fase 1: testes e roteiro manual
├── contracts/
│   ├── api.md           # Fase 1: rotas do perfil e regras
│   └── screens.md       # Fase 1: tela Craque e menu
├── checklists/
│   └── requirements.md  # Checklist de qualidade da spec
└── tasks.md             # Fase 2 (/speckit-tasks)
```

### Source Code (repository root)

Só arquivos que esta feature cria (+) ou altera (~):

```text
backend/
├── src/
│   ├── config/domain.js                       # ~ DOMINANT_FEET, NICKNAME_MAX_LENGTH, PROFILE_MIN_AGE, PROFILE_MAX_AGE, APP_TIME_ZONE
│   ├── database/migrations/004_profile.sql    # + tabela profiles
│   ├── utils/dates.js                         # + localDate, isValidDate, ageOn
│   ├── validators/profileValidator.js         # + apelido, data, posição e perna
│   ├── models/profileModel.js                 # + busca e grava (ON CONFLICT DO UPDATE)
│   ├── services/profileService.js             # + getProfile, saveProfile (com a idade)
│   ├── controllers/profileController.js       # + GET e PUT
│   ├── controllers/rulesController.js         # ~ dominantFeet
│   ├── routes/profileRoutes.js                # + /profile
│   └── routes/index.js                        # ~ registra as rotas do perfil
└── tests/
    ├── unit/dates.test.js                     # + data no fuso, data válida, idade
    ├── unit/profileService.test.js            # + regras do perfil
    ├── unit/testDb.js                         # ~ limpa profiles
    ├── integration/profile.test.js            # + rotas do perfil
    └── integration/rules.test.js              # ~ dominantFeet

frontend/
├── src/
│   ├── main.js                                # ~ profile no store; rota /craque; craque.css
│   ├── router.js                              # ~ comentário com as rotas
│   ├── screenActions.js                       # ~ sair limpa o perfil
│   ├── craqueView.js                          # + formulário, card ou edição
│   ├── services/profileApi.js                 # + getProfile, saveProfile
│   ├── assets/icons/icons.js                  # ~ pencilIcon
│   ├── components/
│   │   ├── craque/                            # + pasta nova
│   │   │   ├── profileForm.js                 # + apelido, data, posição, perna; criar ou editar
│   │   │   └── profileCard.js                 # + iniciais, apelido, e-mail, blocos e "Editar perfil"
│   │   └── header/accountMenu.js              # ~ "Craque"
│   ├── styles/craque.css                      # + estilos do Craque
│   └── utils/format.js                        # ~ ageText, footText
└── tests/format.test.js                       # ~ ageText, footText
```

**Structure Decision**: mesma estrutura "Web application". Entra a pasta `components/craque/`, como
as das outras telas.

## Complexity Tracking

| Mudança | Por quê | Alternativa mais simples rejeitada |
|---------|---------|-------------------------------------|
| Pasta `frontend/src/components/craque/` | O formulário e o card do Craque são de uma tela nova, e cada tela tem a sua pasta de componentes (`myteam/`, `roster/`, `teams/`) | Pôr em `myteam/` misturaria o perfil da conta com o time |
