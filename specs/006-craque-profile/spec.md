# Feature Specification: Craque — o perfil de jogador da conta

**Feature Branch**: `006-craque-profile`

**Created**: 2026-11-08

**Status**: Draft

**Input**: User description: "crie dentro do menu do usuário, crie a opção Craque onde irá aparecer as informações dele, como (POSIÇÃO, IDADE, PERNA DOMINANTE)"

## Clarifications

### Session 2026-11-08

- Q: Quais posições o Craque pode ter? → A: ATA ou DEF, as mesmas do elenco e do sorteio.
- Q: Como a idade é informada? → A: Pela data de nascimento; o app mostra a idade, que se atualiza
  sozinha a cada aniversário.
- Q: O Craque tem outros dados? → A: Um apelido, mostrado no topo do perfil. A perna dominante é
  Direita, Esquerda ou Ambas.
- Q: Referência visual → quadros "Craque · criar perfil", "Craque · perfil", "Craque · editar perfil"
  e "Conta · menu" do canvas, aprovados em 2026-11-08.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Montar o perfil (Priority: P1)

Pelo menu da conta, o organizador abre o Craque. Sem perfil, a tela pede apelido, data de
nascimento, posição e perna dominante; "Salvar perfil" grava os dados e mostra o perfil.

**Why this priority**: sem perfil não há o que mostrar; é a porta de entrada da feature.

**Independent Test**: com uma conta sem perfil, abrir o Craque pelo menu, tocar em "Salvar perfil"
sem preencher (erro em cada campo), preencher "Pedrinho", 12/04/1998, ATA e Direita, salvar e conferir
o perfil com "28 anos".

**Acceptance Scenarios**:

1. **Given** uma conta sem perfil, **When** o organizador toca em "Craque" no menu da conta, **Then**
   vê "Craque", um texto curto, os campos "Apelido" e "Data de nascimento", as opções de posição (ATA,
   DEF) e de perna dominante (Direita, Esquerda, Ambas), nenhuma marcada, e o botão "Salvar perfil".
2. **Given** o formulário, **When** o organizador toca em "Salvar perfil" sem preencher nada, **Then**
   vê "Informe o apelido." junto do campo, com o foco nele, e nada é gravado; cada novo toque aponta o
   próximo campo que falta, na ordem do formulário.
3. **Given** o formulário preenchido com "Pedrinho", 12/04/1998, ATA e Direita, **When** o organizador
   salva, **Then** vê o perfil com as iniciais "PE", "Pedrinho", o e-mail da conta e os blocos Posição
   "ATA", Idade "28 anos" e Perna "Direita".

---

### User Story 2 - Ver e editar o perfil (Priority: P2)

Com o perfil salvo, o Craque mostra os dados. "Editar perfil" abre o formulário já preenchido;
"Salvar" grava as mudanças e "Cancelar" volta ao perfil sem mudar nada.

**Why this priority**: os dados mudam (a posição, por exemplo) e precisam poder ser corrigidos.

**Independent Test**: com um perfil salvo, abrir o Craque, tocar em "Editar perfil", trocar a perna
para "Ambas", salvar e conferir; editar de novo e cancelar.

**Acceptance Scenarios**:

1. **Given** uma conta com perfil, **When** o organizador abre o Craque, **Then** vê o perfil, sem o
   formulário.
2. **Given** o perfil, **When** o organizador toca em "Editar perfil", troca a perna para "Ambas" e
   toca em "Salvar", **Then** o perfil mostra Perna "Ambas".
3. **Given** a edição aberta com mudanças, **When** o organizador toca em "Cancelar", **Then** volta ao
   perfil como estava.
4. **Given** um perfil salvo, **When** chega o aniversário do Craque, **Then** a idade mostrada passa
   a ser a nova, sem editar nada.

---

### Edge Cases

- Apelido com espaços nas pontas: os espaços são removidos; só espaços conta como vazio.
- Apelido com mais de 40 caracteres: erro "O apelido pode ter no máximo 40 caracteres.".
- Data de nascimento no futuro: erro "A data de nascimento não pode ser no futuro.".
- Data que dá menos de 5 ou mais de 100 anos: erro "Confira a data: a idade precisa ficar entre 5 e
  100 anos.".
- Nascido em 29 de fevereiro: em anos não bissextos, a idade muda em 1º de março.
- Apelido longo: cortado com reticências, sem rolagem horizontal em 360 px.
- Toque duplo em "Salvar perfil" ou duas abas: a conta continua com um perfil só; vale o último
  salvo.
- Recarregar o Craque mantém a tela; sem sessão, vai para "Entrar". Sair da conta e entrar com outra
  não mostra o perfil anterior.

## Requirements *(mandatory)*

### Functional Requirements

**Perfil**

- **FR-001**: Cada conta MUST ter no máximo um perfil de Craque, com apelido, data de nascimento,
  posição e perna dominante, todos obrigatórios.
- **FR-002**: O apelido MUST ser obrigatório, sem espaços nas pontas e com até 40 caracteres.
- **FR-003**: A data de nascimento MUST ser uma data válida, não pode ser no futuro e MUST dar uma
  idade entre 5 e 100 anos.
- **FR-004**: A posição MUST ser ATA ou DEF; a perna dominante MUST ser Direita, Esquerda ou Ambas.
- **FR-005**: A idade MUST ser calculada pelo sistema a partir da data de nascimento e da data de hoje
  no horário de Brasília, e mudar sozinha no aniversário.
- **FR-006**: Salvar MUST substituir o perfil anterior; um pedido com erro MUST NOT mudar nada.
- **FR-007**: Só a própria conta MUST ver e alterar o seu perfil.

**Tela Craque**

- **FR-008**: O menu da conta MUST mostrar "Craque" logo abaixo de "MyTeam", levando à tela Craque.
- **FR-009**: Sem perfil, a tela MUST mostrar "← Elenco", o título "Craque", o texto "Monte o seu
  perfil de jogador.", os campos "Apelido" e "Data de nascimento", os grupos "Posição" (ATA, DEF) e
  "Perna dominante" (Direita, Esquerda, Ambas), nenhum marcado, e o botão "Salvar perfil"; o erro
  aparece junto do campo a corrigir, um por vez, na ordem do formulário, como nos formulários de
  jogador e de time.
- **FR-010**: Com perfil, a tela MUST mostrar as iniciais do apelido, o apelido, o e-mail da conta, os
  blocos "Posição", "Idade" ("N anos") e "Perna" e o botão "Editar perfil".
- **FR-011**: "Editar perfil" MUST abrir o formulário preenchido, com "Salvar" e "Cancelar"; "Cancelar"
  MUST voltar ao perfil sem mudanças.
- **FR-012**: "← Elenco" e o voltar do aparelho MUST levar ao Elenco; recarregar MUST manter a tela.
- **FR-013**: As telas MUST seguir os quadros aprovados no canvas e os requisitos de interface das
  features anteriores (pt-BR, 360 px sem rolagem horizontal, alvos de 44 × 44 px, teclado, nomes
  acessíveis).

### Key Entities

- **Craque**: o perfil de jogador da conta. Apelido (até 40 caracteres), data de nascimento, posição
  (ATA ou DEF) e perna dominante (Direita, Esquerda ou Ambas); a idade vem da data de nascimento. Um
  por conta.

### Relação com features anteriores

- **004 e 005 (menu da conta)**: o menu ganha "Craque" entre "MyTeam" e "Planos".
- **003 (posições)**: o Craque usa as mesmas posições ATA e DEF.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Montar o perfil leva menos de 1 minuto a partir do menu da conta.
- **SC-002**: Do Elenco ao perfil em 2 toques (ícone da conta e "Craque").
- **SC-003**: A idade mostrada é sempre a correta no dia, sem o usuário editar nada.
- **SC-004**: Em 360 px, as telas do Craque aparecem sem rolagem horizontal.

## Assumptions

- Escopo técnico (exigência da constituição): esta feature mexe no frontend e no backend (tabela,
  validação e rotas do perfil, e a lista de pernas nas regras).
- O Craque não entra no elenco do time nem no sorteio nesta versão; ligar o organizador ao elenco,
  foto e estatísticas ficam fora.
- Os limites de 5 e 100 anos servem só para barrar datas digitadas errado.
- A data de nascimento é um dado pessoal: só a própria conta a vê, e só no formulário; o perfil
  mostra apenas a idade.
