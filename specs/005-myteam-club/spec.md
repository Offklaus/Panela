# Feature Specification: MyTeam — o time do grupo

**Feature Branch**: `005-myteam-club`

**Created**: 2026-11-07

**Status**: Draft

**Input**: User description: "mude o MyFUT para MyTeam, quando clicar em myteam, ira aparecer o nome do "Time" ao clicar ai vai aparecer todo o elenco (da forma que ja esta). Se não tiver nenhum Time cadastrado, ira aparecer criar time (onde ira colocar o nome, pode colocar um icone). quero poder deixar que o usuário coloca manualmente os jogadores no elenco da forma que já está. mas também ele pode convidar Jogador que terá o nome de Convocar jogador (esse convidar jogador não precisa criar nenhuma tela, deixar igual o planos)"

## Clarifications

### Session 2026-11-07

- Q: Cada conta tem um time ou vários? → A: Um time por conta. Os jogadores já cadastrados entram no
  time quando ele é criado; o Elenco do dia do jogo e o sorteio não mudam.
- Q: Como o ícone é escolhido? → A: De uma lista de 8 ícones prontos (Bola, Escudo, Raio, Estrela,
  Coroa, Chama, Troféu, Alvo), com a Bola já marcada. Sem envio de imagem.
- Q: Onde fica "Convocar jogador"? → A: No elenco do time, logo abaixo do título, desativado com
  "Em breve", como "Planos". O cadastro manual continua como está.
- Q: Referência visual → quadros "MyTeam · criar time", "MyTeam · com time", "MyTeam · elenco do
  time", "Conta · menu" e "Elenco · posição pendente" do canvas, aprovados em 2026-11-07.
- Q: Quem aparece na tela de sorteio (Elenco)? → A: "na tela de sorteio, que é a tela inicial, só
  irá aparecer os jogadores que tiver no time em MyTeam". Sem time, o Elenco não mostra jogadores e
  leva a "Criar time" (quadro "Elenco · sem time"). Substitui a parte da 1ª resposta que dizia que
  o Elenco do dia e o sorteio não mudavam.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar o time (Priority: P1)

Pelo menu da conta, o organizador abre o MyTeam. Sem time, a tela pede o nome do time e um ícone da
lista; "Criar time" grava o time e mostra o card dele.

**Why this priority**: sem time não há o que abrir no MyTeam; é a porta de entrada da feature.

**Independent Test**: com uma conta sem time, abrir o MyTeam, tentar criar sem nome (erro), criar
"Os Boleiros" com o ícone Escudo e conferir o card com o escudo, o nome e o total de jogadores.

**Acceptance Scenarios**:

1. **Given** uma conta sem time, **When** o organizador toca em "MyTeam" no menu, **Then** vê
   "MyTeam", o campo "Nome do time", a grade de 8 ícones com a Bola marcada e o botão "Criar time".
2. **Given** o formulário, **When** o organizador toca em "Criar time" sem nome, **Then** vê "Informe o
   nome do time." e nada é criado.
3. **Given** o formulário, **When** o organizador escolhe o Escudo, digita "Os Boleiros" e toca em
   "Criar time", **Then** o time é criado e a tela mostra o card com o escudo, "Os Boleiros" e o total
   de jogadores da conta.

---

### User Story 2 - Abrir o elenco do time (Priority: P2)

Com o time criado, o MyTeam mostra o card do time. Tocar nele abre o elenco do time, com o
cadastro manual de jogadores como já está e "Convocar jogador" desativado.

**Why this priority**: é onde o organizador cadastra e edita o grupo.

**Independent Test**: com um time e 12 jogadores, abrir o MyTeam, tocar no card, conferir o título
com ícone e "Os Boleiros · 12", "Convocar jogador" com "Em breve", cadastrar um jogador e voltar com
"← MyTeam".

**Acceptance Scenarios**:

1. **Given** uma conta com time, **When** o organizador abre o MyTeam, **Then** vê o card com o ícone,
   o nome do time e "N jogadores" ("1 jogador" quando for um só).
2. **Given** o card, **When** o organizador toca nele, **Then** abre o elenco do time com "← MyTeam",
   o ícone e "{nome} · N" no título, "Convocar jogador" desativado com "Em breve", o formulário de novo
   jogador e a lista, como no MyFUT da feature 004.
3. **Given** o elenco do time, **When** o organizador toca em "Convocar jogador", **Then** nada
   acontece.
4. **Given** o elenco do time, **When** o organizador cadastra, edita ou remove jogadores, **Then** as
   regras são as mesmas das features 001, 003 e 004.

---

### User Story 3 - MyTeam no menu e nos atalhos (Priority: P3)

O nome "MyFUT" sai do app: o menu da conta mostra "MyTeam" e os atalhos do Elenco levam ao MyTeam.

**Why this priority**: mantém os caminhos que já existiam funcionando com o nome novo.

**Independent Test**: abrir o menu e conferir "MyTeam"; com o elenco vazio, tocar em "Abrir MyTeam";
com presentes sem posição, tocar em "Abrir MyTeam" no aviso e cair no elenco do time.

**Acceptance Scenarios**:

1. **Given** o menu da conta aberto, **When** o organizador olha as opções, **Then** vê "MyTeam" no
   lugar de "MyFUT".
2. **Given** um elenco vazio, **When** o organizador toca em "Abrir MyTeam", **Then** abre o MyTeam.
3. **Given** o aviso de posição pendente, **When** o organizador toca em "Abrir MyTeam", **Then** abre
   o elenco do time (ou "Criar time", se ainda não houver time).

---

### User Story 4 - Sorteio só com o time (Priority: P2)

A tela de sorteio (Elenco, a tela inicial) mostra só os jogadores do time do MyTeam. Sem time, ela
não mostra jogadores nem o botão de sortear e leva a "Criar time".

**Why this priority**: o elenco passa a ser do time; sortear jogadores sem time contradiz o MyTeam.

**Independent Test**: com uma conta que tem jogadores e nenhum time, abrir o Elenco e conferir
"Você ainda não tem um time." com "Criar time" e sem jogadores; criar o time e voltar ao Elenco com
os jogadores de volta, com a presença que tinham.

**Acceptance Scenarios**:

1. **Given** uma conta sem time, **When** o organizador abre o Elenco, **Then** vê "Elenco", "Você
   ainda não tem um time.", um texto curto e o botão "Criar time", sem jogadores, sem "Todos
   presentes" e "Limpar" e sem o botão de sortear.
2. **Given** o Elenco sem time, **When** o organizador toca em "Criar time", **Then** abre o MyTeam
   com o formulário de criar time.
3. **Given** uma conta com jogadores que acabou de criar o time, **When** o organizador volta ao
   Elenco, **Then** vê os jogadores do time, com a presença que tinham, e pode sortear.
4. **Given** uma conta sem time, **When** alguém pede ao servidor para cadastrar, alterar ou marcar
   presença de jogadores, ou para sortear, **Then** o pedido é recusado com "Crie o seu time no MyTeam
   primeiro." e nada muda.

---

### Edge Cases

- Nome com espaços nas pontas: os espaços são removidos; só espaços conta como vazio.
- Nome com mais de 40 caracteres: erro "O nome do time pode ter no máximo 40 caracteres.".
- Toque duplo em "Criar time" ou duas abas: a conta continua com um time só; a segunda tentativa
  mostra o time que já existe.
- Abrir o endereço do elenco do time sem time: leva ao "Criar time".
- Conta com jogadores e sem time (contas da feature 004): o Elenco mostra "Você ainda não tem um
  time." e esconde os jogadores; eles voltam, no elenco do time e no Elenco, assim que o time é
  criado. O último sorteio também fica escondido até lá.
- Abrir o endereço da tela de times sem time: não há sorteio para mostrar, então vale o que a tela
  já faz quando não existe sorteio.
- Nome longo do time: cortado com reticências no card e no título, sem rolagem horizontal em 360 px.
- Recarregar o MyTeam ou o elenco do time mantém a mesma tela; sem sessão, vai para "Entrar".

## Requirements *(mandatory)*

### Functional Requirements

**Time**

- **FR-001**: Cada conta MUST ter no máximo um time, com nome e ícone.
- **FR-002**: O nome do time MUST ser obrigatório, sem espaços nas pontas e com até 40 caracteres.
- **FR-003**: O ícone MUST ser um dos 8 da lista (Bola, Escudo, Raio, Estrela, Coroa, Chama, Troféu,
  Alvo); sem ícone informado, o time fica com a Bola.
- **FR-004**: Criar um time numa conta que já tem time MUST falhar com "Você já tem um time." e não
  mudar o time existente.
- **FR-005**: Os jogadores MUST continuar ligados à conta, que tem no máximo um time: os já
  cadastrados passam a ser o elenco do time quando ele é criado, com a presença que tinham.

**MyTeam**

- **FR-006**: O menu da conta MUST mostrar "MyTeam" no lugar de "MyFUT".
- **FR-007**: Sem time, o MyTeam MUST mostrar "MyTeam", um texto curto, o campo "Nome do time", a
  grade de ícones com a Bola marcada e o botão "Criar time"; erros aparecem junto do campo.
- **FR-008**: Depois de criar, ou quando já houver time, o MyTeam MUST mostrar o card do time com o
  ícone, o nome e "N jogadores" ("1 jogador"); tocar no card MUST abrir o elenco do time.
- **FR-009**: O elenco do time MUST ter "← MyTeam" no topo, o ícone e "{nome} · N" no título,
  "Convocar jogador" desativado com a etiqueta "Em breve" e, abaixo, o formulário e a lista de
  jogadores da feature 004, sem presença nem botão de sortear.
- **FR-010**: "Convocar jogador" MUST NOT abrir nada nesta versão.
- **FR-011**: Abrir o elenco do time sem time MUST levar ao MyTeam ("Criar time").
- **FR-012**: "← MyTeam" e o voltar do aparelho MUST levar ao MyTeam; no MyTeam, "← Elenco" MUST levar
  ao Elenco; recarregar MUST manter a tela.

**Atalhos do Elenco**

- **FR-013**: Com o elenco vazio, o botão MUST ser "Abrir MyTeam" e levar ao MyTeam.
- **FR-014**: O aviso de posição pendente MUST trazer o link "Abrir MyTeam", que leva ao elenco do
  time.
- **FR-015**: As telas MUST seguir os quadros aprovados no canvas e os requisitos de interface das
  features anteriores (pt-BR, 360 px sem rolagem horizontal, alvos de 44 × 44 px, teclado, nomes
  acessíveis).

**Sorteio só com o time**

- **FR-016**: O Elenco (tela de sorteio) MUST mostrar só os jogadores do time do MyTeam.
- **FR-017**: Sem time, o Elenco MUST mostrar o título "Elenco", "Você ainda não tem um time.", o
  texto "Crie o time no MyTeam e cadastre os jogadores. Só quem está no time aparece aqui para o
  sorteio." e o botão "Criar time", que leva ao MyTeam; MUST NOT mostrar jogadores, "Todos
  presentes", "Limpar" nem o botão de sortear.
- **FR-018**: Sem time, o servidor MUST devolver o elenco vazio e nenhum sorteio, e MUST recusar
  cadastrar, alterar, remover ou marcar presença de jogadores e sortear, com "Crie o seu time no
  MyTeam primeiro.", sem mudar nada.
- **FR-019**: Ao criar o time, os jogadores já cadastrados na conta MUST aparecer no elenco do time e
  no Elenco, e o card do MyTeam MUST mostrar o total deles.

### Key Entities

- **Time**: o grupo da conta. Nome (até 40 caracteres) e ícone (um da lista). Um por conta.
- **Jogador**: continua pertencendo à conta, que tem no máximo um time. Sem time, não aparece no
  Elenco nem entra no sorteio.

### Relação com features anteriores

- **004 FR-002 e FR-006 a FR-008 (MyFUT)**: o MyFUT vira o elenco do time, aberto pelo MyTeam
  (FR-008, FR-009, FR-012).
- **004 FR-011 e FR-012 (atalhos)**: "Abrir MyFUT" vira "Abrir MyTeam" (FR-013, FR-014).
- **001 (elenco e sorteio)**: cadastrar, alterar e sortear passam a exigir um time na conta
  (FR-016 a FR-018); as demais regras não mudam.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Criar o time leva menos de 30 segundos a partir do menu da conta.
- **SC-002**: Do Elenco ao elenco do time em 3 toques (ícone da conta, "MyTeam" e o card).
- **SC-003**: Nenhuma conta fica com mais de um time, mesmo com toques repetidos em "Criar time".
- **SC-004**: Em 360 px, as três telas do MyTeam e o Elenco sem time aparecem sem rolagem
  horizontal.
- **SC-005**: Nenhuma conta sem time consegue ver jogadores no Elenco ou sortear.

## Assumptions

- Escopo técnico (exigência da constituição): esta feature mexe no frontend e no backend (tabela,
  validação e rotas do time, e a exigência do time nas regras do elenco e do sorteio).
- Editar ou excluir o time, convocar jogadores e ter vários times ficam fora desta versão.
- O nome "MyTeam" é usado como está, no menu e no título.