# Feature Specification: Menu da conta e tela MyFUT

**Feature Branch**: `004-account-menu-myfut`

**Created**: 2026-11-07

**Status**: Draft

**Input**: User description: "Menu da conta e tela MyFUT (frontend apenas). No cabeçalho do Elenco, o botão "Sair" dá lugar ao ícone da conta; tocar nele abre um menu com o e-mail da conta, "MyFUT", "Planos" (desativado, com a etiqueta "Em breve", sem tela) e "Sair". MyFUT é a tela de gestão do grupo (cadastro, nível, posição e remover); o Elenco passa a mostrar os jogadores cadastrados no MyFUT só para o dia do jogo (presença e sorteio). A API e o backend não mudam."

## Clarifications

### Session 2026-11-07

- Q: Onde os jogadores são cadastrados? → A: No MyFUT. O Elenco puxa os jogadores cadastrados no
  MyFUT e serve só para o dia do jogo.
- Q: O que é "Planos"? → A: Fica no menu, sem nada construído ainda ("Em breve").
- Q: Como fica o Elenco? → A: Uma linha por jogador, com posição e nível só para leitura e o botão
  de presença; sem formulário.
- Q: Propostas aprovadas: e-mail da conta no topo do menu; menu fecha ao tocar fora ou com Esc;
  Elenco vazio com botão para o MyFUT; aviso de posição pendente com link "Abrir MyFUT"; jogador sem
  posição aparece com "—" no Elenco. Referência visual: quadros "Elenco · celular", "Elenco · faltam
  jogadores", "Elenco · posição pendente", "MyFUT · celular" e "Conta · menu" do canvas, aprovados
  em 2026-11-07.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Menu da conta (Priority: P1)

No lugar do "Sair", o cabeçalho do Elenco mostra o ícone da conta. Tocar nele abre um menu com o
e-mail da conta, "MyFUT", "Planos" e "Sair".

**Why this priority**: é a porta de entrada do MyFUT e o novo lugar do "Sair".

**Independent Test**: tocar no ícone, conferir o e-mail e as três opções, fechar tocando fora e com
Esc, e sair da conta pelo menu.

**Acceptance Scenarios**:

1. **Given** o Elenco aberto, **When** o organizador toca no ícone da conta, **Then** abre um menu com
   o e-mail da conta, "MyFUT", "Planos" com "Em breve" e "Sair".
2. **Given** o menu aberto, **When** o organizador toca fora dele ou aperta Esc, **Then** o menu fecha
   e o foco volta ao ícone.
3. **Given** o menu aberto, **When** o organizador toca em "Planos", **Then** nada acontece.
4. **Given** o menu aberto, **When** o organizador toca em "Sair", **Then** a sessão acaba e aparece
   a tela "Entrar".

---

### User Story 2 - Cadastrar e editar o grupo no MyFUT (Priority: P2)

Pelo menu, o organizador abre o MyFUT, onde cadastra jogadores com nome, nível e posição, muda o
nível nas estrelas, troca a posição na etiqueta e remove jogadores.

**Why this priority**: tira o cadastro do Elenco, que fica só para o dia do jogo.

**Independent Test**: abrir o MyFUT, cadastrar um jogador, mudar nível e posição, remover outro e
voltar ao Elenco com "← Elenco", conferindo que as mudanças aparecem lá.

**Acceptance Scenarios**:

1. **Given** o menu aberto, **When** o organizador toca em "MyFUT", **Then** abre a tela "MyFUT · N",
   com o formulário (nome, nível e posição) e a lista de jogadores.
2. **Given** o MyFUT, **When** o organizador cadastra "Pedrinho" com 4 estrelas e DEF, **Then** ele
   aparece na lista com 4 estrelas e a etiqueta DEF, e o total sobe para N + 1.
3. **Given** um jogador na lista, **When** o organizador toca na etiqueta, nas estrelas ou em remover,
   **Then** a posição, o nível ou o cadastro mudam como na feature 003.
4. **Given** o MyFUT, **When** o organizador toca em "← Elenco" ou no voltar do aparelho, **Then**
   volta ao Elenco, já com as mudanças.

---

### User Story 3 - Elenco só para o dia do jogo (Priority: P3)

O Elenco mostra os jogadores do MyFUT numa linha cada, com posição e nível só para leitura, e o
botão de presença. O cadastro sai desta tela.

**Why this priority**: deixa a tela do dia do jogo mais curta e simples no celular.

**Independent Test**: abrir o Elenco com 12 jogadores e conferir uma linha por jogador, sem
formulário e sem estrelas tocáveis; com o elenco vazio, conferir o botão para o MyFUT.

**Acceptance Scenarios**:

1. **Given** jogadores cadastrados, **When** o organizador abre o Elenco, **Then** cada jogador
   aparece numa linha com iniciais, nome, posição ("ATA", "DEF" ou "—"), nível ("★ 4") e presença.
2. **Given** o Elenco, **When** o organizador procura o formulário de novo jogador, **Then** ele não
   existe nesta tela.
3. **Given** um elenco vazio, **When** o organizador abre o Elenco, **Then** vê "Nenhum jogador
   ainda." com um botão que abre o MyFUT.
4. **Given** presentes sem posição, **When** o organizador tenta sortear, **Then** o aviso "Defina a
   posição de N presentes para sortear." traz o link "Abrir MyFUT".

---

### Edge Cases

- Menu aberto e o organizador rola a tela: o menu continua preso ao cabeçalho fixo.
- Teclado: Tab percorre as opções do menu; Esc fecha e devolve o foco ao ícone.
- Recarregar o MyFUT mantém o organizador no MyFUT.
- Abrir o MyFUT sem sessão leva a "Entrar", como as outras telas.
- Nome longo: cortado com reticências nas duas telas, sem rolagem horizontal em 360 px.

## Requirements *(mandatory)*

### Functional Requirements

**Menu da conta**

- **FR-001**: O cabeçalho do Elenco MUST mostrar o ícone da conta no lugar do botão "Sair".
- **FR-002**: Tocar no ícone MUST abrir um menu com, nesta ordem: o e-mail da conta, "MyFUT",
  "Planos" com a etiqueta "Em breve" e "Sair".
- **FR-003**: "Planos" MUST aparecer desativado e não abrir nada.
- **FR-004**: "Sair" MUST encerrar a sessão, como o botão "Sair" de antes.
- **FR-005**: O menu MUST fechar ao tocar fora dele, ao apertar Esc ou ao escolher uma opção; ao
  fechar com Esc ou tocando fora, o foco MUST voltar ao ícone.

**MyFUT**

- **FR-006**: "MyFUT" MUST abrir a tela de gestão do grupo, com "← Elenco" no topo, título
  "MyFUT · N" (N = total de jogadores), o formulário de novo jogador (nome, nível e posição) e a
  lista com etiqueta de posição, estrelas de nível e remover.
- **FR-007**: O MyFUT MUST manter as regras de cadastro e edição das features 001 e 003 (nome,
  níveis, posição obrigatória, troca de posição, remoção) e MUST NOT mostrar presença nem botão de
  sortear.
- **FR-008**: "← Elenco" e o voltar do aparelho MUST levar ao Elenco; recarregar MUST manter o MyFUT.

**Elenco**

- **FR-009**: O Elenco MUST mostrar os jogadores cadastrados no MyFUT, um por linha, com iniciais,
  nome, posição ("ATA", "DEF" ou "—" para sem posição) e nível ("★ N") só para leitura, e o botão de
  presença.
- **FR-010**: O Elenco MUST NOT ter formulário de cadastro, estrelas tocáveis, troca de posição nem
  remover; "Todos presentes", "Limpar" e o botão fixo de sortear continuam.
- **FR-011**: Com o elenco vazio, o Elenco MUST mostrar "Nenhum jogador ainda." e um botão "Abrir
  MyFUT".
- **FR-012**: O aviso de posição pendente MUST trazer o link "Abrir MyFUT".
- **FR-013**: As telas MUST seguir os quadros aprovados no canvas e os requisitos de interface das
  features anteriores (pt-BR, 360 px sem rolagem horizontal, alvos de 44 × 44 px, teclado, nomes
  acessíveis).

### Relação com features anteriores

- **002 FR-003 (cabeçalho do Elenco)**: o "Sair" vira o ícone da conta com menu (FR-001 a FR-005).
- **001 FR-010 a FR-015 e 003 FR-002 a FR-005 (cadastro e edição)**: passam a acontecer no MyFUT; no
  Elenco, posição e nível são só leitura (FR-009, FR-010).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Do Elenco ao MyFUT em 2 toques (ícone e "MyFUT").
- **SC-002**: Sair da conta em 2 toques (ícone e "Sair").
- **SC-003**: Em 360 px, cada jogador do Elenco ocupa uma linha só, sem rolagem horizontal.
- **SC-004**: Cadastrar um jogador no MyFUT continua levando menos de 15 segundos.

## Assumptions

- Escopo técnico (exigência da constituição): esta feature mexe só no frontend; a API e o backend
  não mudam.
- "Planos" não tem tela nem regra nesta versão.
- O nome "MyFUT" é usado como está, no menu e no título da tela.