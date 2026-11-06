# Implementation Plan: Telas de celular para Elenco e Times

**Branch**: `002-mobile-screens` | **Date**: 2026-11-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-mobile-screens/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

A tela única da feature 001 vira duas: o Elenco, primeira tela depois de entrar, sem o resumo no
topo, e a tela de times, aberta pelo sorteio. Cada uma tem um rodapé fixo com o botão de sortear.
Só o frontend muda: duas rotas por hash no roteador atual (`#/` e `#/times`), um rodapé `sticky`
compartilhado, um campo de estado novo para o aviso de jogadores faltando e duas funções puras que
decidem a tela depois do sorteio ([research.md](research.md)). A API, o backend e o banco não
mudam.

## Technical Context

**Language/Version**: JavaScript puro (ES2022) no navegador; Node.js 22.9 ou superior para os
testes.

**Primary Dependencies**: nenhuma nova. Frontend: Vite (só desenvolvimento e build).

**Storage**: nenhum novo. Estado de tela só em memória; nada do elenco no `localStorage`.

**Testing**: `node:test` + `node:assert` para `utils/` e `state/`; conferência visual e de teclado
no navegador, pelo [quickstart.md](quickstart.md).

**Target Platform**: navegadores atuais (Chrome Android, Safari iOS, Firefox, Edge), a partir de
360 px de largura.

**Project Type**: aplicação web (frontend + backend separados); esta feature mexe só no frontend.

**Performance Goals**: trocar de tela sem esperar a rede (desenha com o store e atualiza depois);
times na tela em menos de 2 s depois do toque, como na 001 (SC-006 da 001).

**Constraints**: alvos de toque de 44 × 44 px; sem rolagem horizontal em 360 px; voltar do aparelho
leva ao Elenco sem criar ciclo no histórico; nenhum dado do usuário via `innerHTML`.

**Scale/Scope**: 2 telas, 1 rota nova, 2 componentes novos, cerca de 10 arquivos alterados no
frontend.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio / seção | Como o plano atende | Antes | Depois do design |
|-------------------|---------------------|-------|------------------|
| I. Frontend e Backend Separados | Só o frontend muda; continua falando com a API só por `services/` | ✅ | ✅ |
| II. Backend como Fonte da Verdade | Resumo, sorteio e jogadores faltando vêm da API; o frontend só decide qual tela mostrar a partir do resultado; estado de tela só em memória | ✅ | ✅ |
| III. Sorteio Justo e Verificável | O sorteio não muda | ✅ | ✅ |
| IV. Testes nas Regras de Negócio | Sem regra de negócio nova; `utils/screens.js` e `presentCountText` ganham testes unitários (DEVERIA para `utils/`) | ✅ | ✅ |
| V. Interface fiel, acessível, pt-BR | Telas desenhadas e aprovadas no canvas antes do código; 44 px, 360 px, foco no título, pt-BR. Ajuste registrado: em menos de 400 px a lista perde a margem lateral (research §10) | ✅ | ✅ |
| VI. Simplicidade | Sem dependência nova; uma pasta nova (`components/draw-bar/`), registrada abaixo | ✅ | ✅ |
| Restrições Técnicas | Nada muda na API, no formato de erro ou no `.env` | ✅ | ✅ |
| Fluxo de Desenvolvimento | Spec diz "só frontend"; canvas aprovado; contrato de telas em `contracts/` antes da implementação | ✅ | ✅ |

**Resultado**: aprovado, sem violações. O quadro "Montar times" do canvas fica desatualizado com
esta feature e precisa ser atualizado ou removido (tarefa da fase de polimento), porque a
constituição usa o canvas como referência.

## Project Structure

### Documentation (this feature)

```text
specs/002-mobile-screens/
├── plan.md              # Este arquivo
├── research.md          # Fase 0: decisões técnicas
├── data-model.md        # Fase 1: estado de tela e transições
├── quickstart.md        # Fase 1: testes e roteiro manual
├── contracts/
│   └── screens.md       # Fase 1: contrato das telas
├── checklists/
│   └── requirements.md  # Checklist de qualidade da spec
└── tasks.md             # Fase 2 (/speckit-tasks)
```

### Source Code (repository root)

Só arquivos que esta feature cria (+), altera (~) ou remove (−):

```text
frontend/
├── index.html                       # ~ viewport-fit=cover
├── src/
│   ├── main.js                      # ~ rotas '/' e '/times'; shortfall no store
│   ├── router.js                    # ~ guarda a rota anterior e a rolagem do Elenco; back()
│   ├── homeView.js                  # − substituído pelas duas views abaixo
│   ├── rosterView.js                # + tela Elenco
│   ├── teamsView.js                 # + tela Times
│   ├── screenActions.js             # + sessão vencida, sortear, sair (comum às duas telas)
│   ├── components/
│   │   ├── header/
│   │   │   ├── header.js            # ~ só marca e "Sair"
│   │   │   └── backHeader.js        # + "← Elenco"
│   │   ├── draw-bar/
│   │   │   └── drawBar.js           # + rodapé fixo: aviso, botão de sortear, "Ver últimos times"
│   │   ├── player-form/playerForm.js  # ~ nova ordem: nome + Adicionar, depois Nível
│   │   ├── roster/rosterRow.js      # ~ ordem: nome, remover, estrelas, presença
│   │   └── teams/teams.js           # ~ conteúdo da tela de times, sem o botão
│   ├── styles/
│   │   ├── base.css                 # ~ coluna das telas, rodapé fixo, aviso no topo; sem .header-stats
│   │   ├── roster.css               # ~ linha em duas linhas; lista sem margem abaixo de 400 px
│   │   └── teams.css                # ~ tela de times em fundo escuro
│   └── utils/
│       ├── format.js                # ~ presentCountText
│       └── screens.js               # + hasTeams, routeAfterDraw
└── tests/
    ├── format.test.js               # ~ presentCountText
    └── screens.test.js              # + hasTeams, routeAfterDraw
```

**Structure Decision**: mesma estrutura "Web application" da 001. As views continuam na raiz de
`frontend/src/`, como o `homeView.js` hoje. A única pasta nova é `components/draw-bar/`.

## Complexity Tracking

Não há violações. A tabela registra a pasta nova, como pede o Princípio VI.

| Pasta nova | Por que é necessária | Alternativa mais simples descartada porque |
|------------|----------------------|--------------------------------------------|
| `frontend/src/components/draw-bar/` | O rodapé fixo é usado pelas duas telas | Deixá-lo em `teams/` ou `roster/` faria uma tela depender da pasta da outra |
