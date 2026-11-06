# Research: Telas de celular para Elenco e Times

**Feature**: `002-mobile-screens` | **Date**: 2026-11-05 | **Plan**: [plan.md](plan.md)

Decisões técnicas da Fase 0. Só o frontend muda; o backend, a API e o banco ficam como na feature
001 ([contrato da API](../001-roster-team-draw/contracts/api.md)).

## 1. Navegação entre as telas

- **Decisão**: duas rotas no roteador por hash que já existe: `#/` é o Elenco e `#/times` é a tela
  de times. Cada rota tem a sua view; as duas leem e escrevem no mesmo store.
- **Por quê**: cada tela ganha um endereço, então o voltar do navegador e do celular funciona
  sozinho (FR-012) e recarregar a página mantém a tela (FR-016). Não precisa de dependência nova.
- **Alternativas descartadas**: uma view só, trocando o conteúdo por estado (o voltar do celular
  sairia do app e recarregar sempre voltaria ao Elenco); rotas por caminho com a History API (o
  backend teria de devolver o `index.html` para `/times`, e a constituição pede simplicidade).

## 2. Voltar sem bagunçar o histórico

- **Decisão**: o roteador guarda a rota anterior da visita. "← Elenco" e a volta automática do
  FR-008 usam `history.back()` quando a tela anterior foi o Elenco; senão (a pessoa abriu
  `#/times` direto ou recarregou), trocam o endereço com `location.replace('#/')`, sem criar entrada
  nova. O mesmo vale para o FR-015 (tela de times sem sorteio com times).
- **Por quê**: navegar com `location.hash = '#/'` empilharia Elenco → Times → Elenco, e o voltar do
  celular levaria de novo aos times.
- **Alternativas descartadas**: link simples `<a href="#/">` (cria a pilha acima); sempre
  `history.back()` (sai do app quando a pessoa chegou direto em `#/times`).

## 3. Rodapé fixo com o botão de sortear

- **Decisão**: cada tela é uma coluna com altura mínima de `100dvh`: cabeçalho, conteúdo
  (`flex: 1`) e rodapé com `position: sticky; bottom: 0` como último filho. O rodapé soma
  `env(safe-area-inset-bottom)` ao espaçamento de baixo, e o `index.html` passa a ter
  `viewport-fit=cover`.
- **Por quê**: o rodapé `sticky` ocupa o próprio espaço no fluxo, então o último jogador e o fim do
  banco nunca ficam atrás dele (FR-017) sem medir alturas. Com pouco conteúdo, a coluna empurra o
  rodapé para o pé da tela.
- **Alternativas descartadas**: `position: fixed` com um espaço reservado da mesma altura (o espaço
  teria de acompanhar a altura do rodapé, que muda quando o aviso de jogadores faltando aparece).

## 4. Aviso de jogadores faltando

- **Decisão**: um campo de estado de tela, `shortfall`, guarda o número de jogadores faltando que a
  API devolve em `draw.missingPlayers` quando um `POST /api/draw` não forma times. O Elenco mostra
  o aviso enquanto `shortfall` tiver valor. Qualquer alteração do elenco ou da presença, um sorteio
  com times e o "Sair" limpam o campo (FR-009). Ele não sobrevive a recarregar a página.
- **Por quê**: o aviso é a resposta a um toque em sortear. Derivá-lo do último sorteio salvo
  (`teams` vazio) mostraria o aviso ao abrir o app, sem toque, e ele não sumiria depois de marcar
  um presente, porque o sorteio salvo continua o mesmo até o próximo.
- **Princípio II**: o número vem pronto da API; o frontend só decide se mostra.

## 5. Para qual tela ir depois do sorteio

- **Decisão**: duas funções puras em `frontend/src/utils/screens.js`: `hasTeams(draw)` (o sorteio
  existe e tem times) e `routeAfterDraw(draw)` (`'/times'` com times, `'/'` sem). Elas decidem o
  FR-007, o FR-008, o link "Ver últimos times" (FR-010) e o FR-015.
- **Por quê**: ficam testáveis com `node:test` sem navegador, como pede o Princípio IV para
  `utils/`. Elas só leem o resultado da API, sem recalcular regra do sorteio (Princípio II).

## 6. Número de presentes no botão

- **Decisão**: o botão usa `roster.summary.presentCount`, que a API já devolve, formatado por
  `presentCountText(n)` em `utils/format.js` ("1 presente", "N presentes").
- **Por quê**: o resumo continua calculado no backend; só deixa de ter os três quadros no topo.

## 7. Aviso global de erro

- **Decisão**: o aviso (`.notice`) sai do pé da tela e passa para o topo, respeitando
  `env(safe-area-inset-top)`.
- **Por quê**: no pé ele cobriria o botão de sortear, que agora fica fixo ali.

## 8. Foco e rolagem ao trocar de tela

- **Decisão**: ao abrir uma tela, o foco vai para o título dela (`h1` com `tabindex="-1"`), para
  quem usa leitor de tela saber que a tela mudou. O roteador guarda em memória a posição de rolagem
  do Elenco ao sair dele e a devolve ao voltar; a tela de times abre no topo.
- **Por quê**: "volta ao Elenco como ele estava" (US2) inclui o ponto da lista em que o organizador
  estava. Guardar em memória respeita o Princípio II (nada do elenco no `localStorage`).

## 9. Computador

- **Decisão**: as duas telas usam a mesma coluna, centralizada, com até 640 px de conteúdo. A tela
  de times pinta o fundo escuro na largura toda e centraliza a coluna dentro dele.
- **Alternativa descartada**: manter elenco e times lado a lado em telas largas (o usuário pediu as
  mesmas telas do celular).

## 10. Linha do jogador em 360 px

- **Decisão**: a linha vira uma grade de duas linhas, como no canvas: em cima, iniciais, nome e
  remover; embaixo, as 5 estrelas e o botão de presença. A ordem no HTML segue a ordem visual
  (nome, remover, estrelas, presença), para o Tab seguir o que se vê. Abaixo de 400 px de largura,
  o cartão do elenco perde a margem lateral e as bordas laterais.
- **Por quê**: 5 estrelas de 44 px (220 px) mais o botão de presença (104 px) somam 324 px; com a
  margem do canvas, sobram só 308 px numa tela de 360 px. Sem a margem, sobram 332 px. O canvas foi
  desenhado em 390 px, onde a margem cabe.
- **Alternativa descartada**: estrelas mais estreitas (ficariam abaixo dos 44 px que a constituição
  exige).

## 11. Formulário de novo jogador

- **Decisão**: o HTML passa a ter, nesta ordem, o rótulo, a linha com o campo de nome e
  "Adicionar", a mensagem de erro e a linha "Nível" com as estrelas.
- **Por quê**: é a ordem do canvas, e mudar o HTML é mais simples que reordenar com CSS.

## 12. Organização do código

- **Decisão**: `homeView.js` dá lugar a `rosterView.js` (Elenco) e `teamsView.js` (Times). O que as
  duas fazem igual (tratar sessão vencida, sortear, sair) vai para `screenActions.js`. Componentes
  novos: `components/draw-bar/drawBar.js` (rodapé fixo, usado nas duas telas) e
  `components/header/backHeader.js` ("← Elenco"). `header.js` perde os quadros do resumo, e
  `teams.js` perde o botão de sortear e passa a montar o conteúdo da tela de times.
- **Carregamento**: as duas telas desenham na hora com o que já está no store e atualizam pela API
  ao abrir. O Elenco busca o elenco e o sorteio (para o link do FR-010); a tela de times busca o
  sorteio e, sem times, volta ao Elenco (FR-015).

## Dependências

Nenhuma nova. O frontend continua só com o Vite em desenvolvimento.
