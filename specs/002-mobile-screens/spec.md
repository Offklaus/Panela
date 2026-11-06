# Feature Specification: Telas de celular para Elenco e Times

**Feature Branch**: `002-mobile-screens`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Layout para celular com telas separadas de Elenco e Times (frontend apenas). Ao entrar, o resumo do topo (presentes, times, média) deixa de aparecer. A tela inicial depois do login é o Elenco: cabeçalho só com logo e "Sair", lista de jogadores, formulário de novo jogador, "Todos presentes" e "Limpar", e um rodapé fixo com o botão "Sortear times · N presentes" (N vem do resumo da API) e, quando já existe sorteio com times, o link "Ver últimos times". Ao sortear com times formados, o app abre a tela Times (#/times). Com menos presentes que o necessário, o organizador fica no Elenco e vê o aviso "Falta 1 jogador para fechar 2 times." acima do botão. A tela Times tem "← Elenco" no topo (o voltar do celular também volta ao elenco), título "Times da rodada", linha de status, aviso de lista alterada, equilíbrio, cartões dos times, banco e um rodapé fixo com "Sortear de novo". No computador, as mesmas duas telas numa coluna centralizada. Estrelas e botão de presença com alvo de toque de 44 px. Referência visual aprovada: quadros "Elenco · celular", "Elenco · faltam jogadores" e "Times · celular" do canvas Times de Society. A API e o backend não mudam."

## Clarifications

### Session 2026-11-05

- Q: Como o organizador passa do elenco para os times? → A: Uma tela leva à outra: sortear abre
  os times, e os times têm um "voltar" para o elenco. Abas fixas embaixo foram descartadas.
- Q: O que some ao entrar? → A: O resumo do topo (presentes, times e média). O número de presentes
  continua visível só no botão de sortear.
- Q: E no computador? → A: As mesmas duas telas, numa coluna centralizada.
- Q: Referência visual? → A: Os quadros "Elenco · celular", "Elenco · faltam jogadores" e
  "Times · celular" do canvas, aprovados pelo usuário em 2026-11-05.

### Session 2026-11-06

- Q: Manter o link "Ver últimos times" abaixo do botão de sortear? → A: Não; o usuário pediu para
  tirar. Para rever os últimos times, sorteia-se de novo ou usa-se o avançar do navegador.
- Q: O cabeçalho fica fixo? → A: Sim: a marca e "Sair" ficam presos no alto, como o botão de
  sortear fica embaixo. O topo da tela de times ("← Elenco") segue o mesmo padrão.

## User Scenarios & Testing *(mandatory)*

O app tende a ser usado no celular, na hora do jogo, por quem organiza. Hoje elenco e times
dividem uma tela só: no celular eles ficam empilhados e o botão de sortear fica no fim de uma lista
longa. Esta feature separa as duas coisas e deixa o botão de sortear sempre à mão.

### User Story 1 - Elenco como tela inicial, com o sorteio sempre à mão (Priority: P1)

Ao entrar, o organizador cai direto no elenco, sem o resumo no topo. Ele marca quem veio,
cadastra e ajusta jogadores, e o botão de sortear fica preso na parte de baixo da tela, com o
número de presentes, por mais longa que seja a lista.

**Why this priority**: é a tela em que o organizador passa a maior parte do tempo, e o botão de
sortear fora de alcance é o principal incômodo no celular hoje.

**Independent Test**: num celular de 360 px, entrar numa conta com 30 jogadores, rolar a lista de
ponta a ponta e conferir que o cabeçalho e o botão de sortear ficam visíveis o tempo todo e que o
resumo do topo não aparece.

**Acceptance Scenarios**:

1. **Given** uma conta com elenco cadastrado, **When** o organizador entra, **Then** a primeira
   tela é o Elenco, com cabeçalho só com a marca e "Sair", e sem os quadros de presentes, times e
   média.
2. **Given** um elenco maior que a tela, **When** o organizador rola a lista até o fim, **Then** o
   cabeçalho com a marca e "Sair" continua visível no alto, o botão "Sortear times" continua
   visível na parte de baixo e o último jogador pode ser visto inteiro, sem ficar atrás do botão.
3. **Given** 11 presentes, **When** o Elenco é exibido, **Then** o botão mostra
   "Sortear times · 11 presentes"; com 1 presente, mostra "Sortear times · 1 presente".
4. **Given** 11 presentes, **When** o organizador marca mais um como presente, **Then** o botão
   passa a mostrar "· 12 presentes" assim que a alteração é salva.

---

### User Story 2 - Ver os times numa tela própria (Priority: P2)

Com presentes suficientes, o organizador toca em "Sortear times" e o app abre a tela dos times.
Ali ele vê o resultado completo e, se quiser, sorteia de novo sem sair da tela. Para voltar ao
elenco, usa "← Elenco" ou o voltar do celular.

**Why this priority**: é o resultado que o organizador mostra ao grupo; numa tela só para isso,
ele cabe sem disputar espaço com a lista.

**Independent Test**: com 11 presentes, sortear pelo Elenco, conferir a tela de times, sortear de
novo nela, voltar ao Elenco pelo "← Elenco" e, depois, pelo voltar do navegador.

**Acceptance Scenarios**:

1. **Given** 11 presentes no Elenco, **When** o organizador toca em "Sortear times", **Then** abre
   a tela "Times da rodada" com "Time A" e "Time B" de 5 jogadores cada, 1 jogador em
   "Próximos · aguardando vaga" e a linha "2 times de 5 · 1 aguardando".
2. **Given** a tela de times aberta, **When** o organizador toca em "← Elenco" ou no voltar do
   celular, **Then** volta ao Elenco como ele estava.
3. **Given** a tela de times aberta, **When** o organizador toca em "Sortear de novo", **Then** um
   novo sorteio com os presentes atuais substitui o anterior e a tela continua a de times.
4. **Given** a tela de times aberta, **When** o organizador recarrega a página, **Then** continua
   na tela de times, com o último sorteio.
5. **Given** a tela de times com uma lista longa de times, **When** o organizador rola até o fim,
   **Then** o botão "Sortear de novo" continua visível e o banco pode ser visto inteiro.
6. **Given** um sorteio feito, **When** o organizador volta ao Elenco, muda a presença de alguém e
   usa o avançar do navegador, **Then** a tela de times mostra o aviso de que a lista mudou.

---

### User Story 3 - Saber o que falta quando não dá para sortear (Priority: P3)

Com menos presentes do que o necessário para 2 times, o organizador toca em sortear e continua no
elenco, com um aviso logo acima do botão dizendo quantos jogadores faltam. Assim ele marca quem
falta sem trocar de tela.

**Why this priority**: evita abrir uma tela de times vazia; é um caso comum no começo do jogo,
quando ainda está chegando gente.

**Independent Test**: com 9 presentes, tocar em "Sortear times", conferir o aviso no Elenco, marcar
mais um presente e conferir que o aviso some.

**Acceptance Scenarios**:

1. **Given** 9 presentes, **When** o organizador toca em "Sortear times", **Then** ele continua no
   Elenco e vê, acima do botão, "Falta 1 jogador para fechar 2 times."
2. **Given** 7 presentes, **When** o organizador sorteia, **Then** o aviso diz "Faltam 3 jogadores
   para fechar 2 times."
3. **Given** o aviso visível, **When** o organizador muda a presença, cadastra, remove ou muda o
   nível de um jogador, **Then** o aviso some.
4. **Given** a tela de times aberta e só 9 presentes depois de uma mudança, **When** o organizador
   toca em "Sortear de novo", **Then** o app volta ao Elenco e mostra o aviso de quantos faltam.

---

### Edge Cases

- Elenco vazio ou ninguém presente: o botão mostra "Sortear times · 0 presentes"; ao tocar, o
  aviso diz "Faltam 10 jogadores para fechar 2 times."
- Endereço da tela de times aberto sem um último sorteio com times (favorito, link antigo): o app
  leva ao Elenco.
- Toque duplo no botão de sortear: enquanto o sorteio está em andamento, o botão fica indisponível
  e só um sorteio é feito.
- Falha ao sortear (por exemplo, sem conexão): o organizador continua na tela em que estava e vê o
  aviso de falha; nada muda nos times exibidos.
- Sessão vencida em qualquer das duas telas: o app vai para "Entrar", como hoje.
- Nome de jogador muito longo: a linha corta o nome com reticências e não cria rolagem horizontal.
- Muitos times (por exemplo, 8 times com 40 presentes): os cartões ficam um embaixo do outro e
  rolam; o botão "Sortear de novo" continua visível.
- Teclado: a navegação por Tab alcança os botões fixos e o "← Elenco", com o foco visível.

## Requirements *(mandatory)*

### Functional Requirements

**Elenco**

- **FR-001**: Depois de entrar, a primeira tela MUST ser o Elenco.
- **FR-002**: O resumo com número de presentes, times possíveis e média de estrelas MUST NOT
  aparecer no topo de nenhuma tela. O número de presentes aparece só no botão de sortear (FR-005).
- **FR-003**: O cabeçalho do Elenco MUST mostrar só a marca "Times de Society" e o botão "Sair".
- **FR-004**: O Elenco MUST manter tudo o que a feature 001 define para o elenco e a presença:
  total de jogadores, "Todos presentes", "Limpar", cadastro com 3 estrelas pré-selecionadas,
  mudança de nível, presença, remoção, ordem de cadastro e a mensagem de elenco vazio.
- **FR-005**: O Elenco MUST ter, fixo na parte de baixo da tela e visível durante toda a rolagem,
  o botão "Sortear times" seguido do número de presentes, no singular ("· 1 presente") ou no plural
  ("· N presentes").
- **FR-006**: O número de presentes no botão MUST refletir cada alteração assim que ela é salva.

**Sorteio e navegação**

- **FR-007**: Quando um sorteio formar times, o app MUST abrir a tela de times com o resultado.
- **FR-008**: Quando um sorteio não formar times, o organizador MUST ficar no Elenco (ou voltar a
  ele, se sorteou pela tela de times) e ver, logo acima do botão de sortear, a mensagem de
  jogadores faltando: "Falta 1 jogador para fechar 2 times." ou "Faltam N jogadores para fechar
  2 times."
- **FR-009**: A mensagem do FR-008 MUST sumir na próxima alteração do elenco ou da presença, ou
  quando um sorteio formar times.
- **FR-010**: O cabeçalho das duas telas (marca e "Sair" no Elenco, "← Elenco" na tela de times)
  MUST ficar fixo no alto e visível durante toda a rolagem. O Elenco MUST NOT mostrar atalho para
  os últimos times abaixo do botão de sortear (removido em 2026-11-06).
- **FR-011**: Enquanto um sorteio estiver em andamento, os botões de sortear MUST ficar
  indisponíveis, para que um toque duplo não faça dois sorteios.

**Tela de times**

- **FR-012**: A tela de times MUST mostrar no topo "← Elenco", que volta ao Elenco. O voltar do
  navegador ou do celular MUST ter o mesmo efeito.
- **FR-013**: A tela de times MUST mostrar o título "Times da rodada", a linha de status, o aviso
  de lista alterada quando houver, o equilíbrio, os times e o banco, com as regras de exibição da
  feature 001 (FR-026 a FR-029 e FR-031 a FR-033).
- **FR-014**: A tela de times MUST ter, fixo na parte de baixo e visível durante toda a rolagem, o
  botão "Sortear de novo", que faz um novo sorteio com os presentes atuais. Com times formados, o
  resultado substitui o anterior na mesma tela; sem times, vale o FR-008.
- **FR-015**: Abrir a tela de times sem um último sorteio com times MUST levar ao Elenco.

**Comportamento geral**

- **FR-016**: Recarregar a página MUST manter o organizador na tela em que estava, Elenco ou
  times.
- **FR-017**: Nenhum conteúdo MUST ficar escondido atrás do cabeçalho ou do rodapé fixos: o
  último jogador do elenco e o fim do banco MUST poder ser vistos inteiros rolando a tela.
- **FR-018**: Em telas largas, como as de computador, as duas telas MUST aparecer numa coluna
  centralizada, com o mesmo conteúdo e a mesma ordem do celular.
- **FR-019**: As estrelas de nível e os botões de presença MUST ter área de toque de pelo menos
  44 × 44 px.
- **FR-020**: As telas MUST seguir os quadros aprovados no canvas: "Elenco · celular",
  "Elenco · faltam jogadores" e "Times · celular".
- **FR-021**: Continuam valendo os requisitos de interface da feature 001: aviso quando uma
  alteração não puder ser salva (FR-035), texto em português do Brasil (FR-036) e telas que
  funcionam em 360 px sem rolagem horizontal, operáveis por teclado e com nome acessível nos
  botões só com ícone (FR-037).

### Relação com a feature 001

Esta feature muda os seguintes requisitos de `specs/001-roster-team-draw/spec.md`:

- **FR-018 (resumo)**: os valores continuam calculados como antes, mas o resumo deixa de ser
  exibido; só o número de presentes aparece, no botão de sortear.
- **FR-022 e FR-029 (jogadores faltando)**: a mensagem de quantos faltam passa a aparecer no
  Elenco, acima do botão, e não na área de times.
- **FR-030 (nome do botão)**: o botão do Elenco se chama sempre "Sortear times"; o da tela de
  times se chama sempre "Sortear de novo".

Os demais requisitos da 001 continuam valendo sem mudança.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Num celular de 360 px, o cabeçalho e o botão de sortear ficam visíveis em 100% das
  posições de rolagem do Elenco, com até 100 jogadores.
- **SC-002**: Com a presença marcada, o organizador chega aos times com 1 toque.
- **SC-003**: Da tela de times, o organizador volta ao Elenco com 1 toque ou com o voltar do
  aparelho.
- **SC-004**: Quando chega um atrasado, o organizador sai da tela de times, marca o jogador e vê os
  times novos em até 3 toques e menos de 15 segundos.
- **SC-005**: Em 100% das recargas de página, o organizador continua na mesma tela.
- **SC-006**: Nenhuma tela tem rolagem horizontal em 360 px de largura.
- **SC-007**: 100% das estrelas de nível e dos botões de presença têm área de toque de pelo menos
  44 × 44 px.

## Assumptions

- Escopo técnico (exigência da constituição): esta feature mexe só no frontend. A API e o backend
  não mudam; o número de presentes vem do resumo que o backend já calcula.
- "Sair" fica só no cabeçalho do Elenco; a tela de times tem apenas "← Elenco" no topo.
- O quadro "Montar times" do canvas, com a tela única e o resumo, deixou de ser a referência da
  tela principal e foi removido do canvas em 2026-11-06, a pedido do usuário.
- As telas de conta (entrar, criar conta, esqueci a senha, nova senha) não mudam.
- Uma versão instalável (PWA) ou publicada nas lojas fica fora desta feature.
