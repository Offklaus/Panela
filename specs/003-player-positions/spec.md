# Feature Specification: Posição dos jogadores e sorteio por posição

**Feature Branch**: `003-player-positions`

**Created**: 2026-11-06

**Status**: Draft

**Input**: User description: "Posição dos jogadores (ATA ou DEF) e sorteio que divide atacantes e defensores (frontend e backend). Ao cadastrar um jogador, o organizador escolhe a posição: ATA (ataque) ou DEF (defesa); a escolha é obrigatória, começa sem nada marcado e o formulário mantém a última posição escolhida para o próximo cadastro. Na lista, cada jogador mostra a posição numa etiqueta; tocar nela troca entre ATA e DEF. Jogadores já cadastrados começam "Sem posição"; o sorteio só acontece quando todos os presentes têm posição, com o aviso "Defina a posição de N presentes para sortear." acima do botão. Regra A do sorteio: atacantes e defensores são espalhados entre os times da forma mais igual possível (por exemplo, 6 ATA e 4 DEF em 2 times → 3 ATA e 2 DEF em cada) e as estrelas são equilibradas trocando só jogadores da mesma posição, para nunca haver time só de atacantes ou só de defensores quando há jogadores suficientes. O banco continua aleatório, mas não tira jogadores de uma posição em falta (que deixaria algum time sem ela). Quando faltam jogadores de uma posição para todos os times, o sorteio acontece mesmo assim, espalhando o que existe, e a tela de times avisa "Só 1 defensor para 2 times." Cada time mostra "3 ATA · 2 DEF" e cada jogador mostra a posição, inclusive no banco. Referência visual aprovada: quadros "Elenco · celular", "Elenco · faltam jogadores", "Elenco · posição pendente", "Times · celular" e "Times · falta de posição" do canvas Times de Society."

## Clarifications

### Session 2026-11-06

- Q: O que a posição muda no app? → A: O sorteio passa a dividir atacantes e defensores entre os
  times. A regra é não ter times só com atacantes nem times só com defensores.
- Q: Quão rígida é a divisão? → A: Regra A: atacantes e defensores se espalham da forma mais igual
  possível entre os times, e as estrelas são equilibradas trocando só jogadores da mesma posição.
  A alternativa "só o mínimo" (pelo menos 1 de cada por time) foi descartada.
- Q: E quando não há jogadores de uma posição para todos os times? → A: O sorteio acontece mesmo
  assim, espalhando o que existe, e a tela de times avisa.
- Q: Como fica o banco? → A: Continua sorteado, mas não tira jogadores de uma posição que ficaria
  com menos jogadores que times.
- Q: E os jogadores já cadastrados? → A: Começam "Sem posição"; o sorteio só acontece quando todos
  os presentes tiverem posição. No cadastro, a posição é obrigatória, começa sem nada marcado e o
  formulário guarda a última posição escolhida.
- Q: Referência visual? → A: Os quadros "Elenco · celular", "Elenco · faltam jogadores", "Elenco ·
  posição pendente", "Times · celular" e "Times · falta de posição" do canvas, aprovados pelo
  usuário em 2026-11-06.

## User Scenarios & Testing *(mandatory)*

O organizador quer evitar jogos com um time só de atacantes contra outro só de defensores. Para
isso, cada jogador passa a ter uma posição, e o sorteio leva a posição em conta antes das estrelas.

### User Story 1 - Cadastrar e ajustar a posição de cada jogador (Priority: P1)

Ao cadastrar um jogador, o organizador escolhe se ele é ATA (ataque) ou DEF (defesa). Na lista,
cada jogador mostra a posição, e um toque nela troca a posição. Quem já estava no elenco aparece
"Sem posição" até o organizador definir.

**Why this priority**: sem posição nos jogadores, o sorteio não tem como dividir atacantes e
defensores.

**Independent Test**: cadastrar um jogador como DEF, conferir a etiqueta na lista, tocar nela e
conferir que ele passou a ATA; numa conta com jogadores antigos, conferir que eles aparecem "Sem
posição".

**Acceptance Scenarios**:

1. **Given** o formulário de novo jogador, **When** o organizador digita "Pedrinho" e toca em
   "Adicionar" sem escolher posição, **Then** o cadastro é recusado com a mensagem "Escolha a
   posição.".
2. **Given** o formulário com "Pedrinho", 4 estrelas e DEF, **When** o organizador toca em
   "Adicionar", **Then** "Pedrinho" aparece no elenco com a etiqueta DEF.
3. **Given** "Pedrinho" acabou de ser cadastrado como DEF, **When** o organizador digita outro
   nome, **Then** DEF continua marcado no formulário.
4. **Given** "Pedrinho" com a etiqueta DEF, **When** o organizador toca na etiqueta, **Then** ele
   passa a ATA; um novo toque o deixa DEF de novo.
5. **Given** um jogador cadastrado antes desta feature, **When** o organizador abre o elenco,
   **Then** o jogador aparece com a etiqueta "Sem posição", e um toque nela o deixa ATA.

---

### User Story 2 - Sortear times com atacantes e defensores divididos (Priority: P2)

Com todos os presentes com posição, o organizador sorteia e recebe times em que atacantes e
defensores estão espalhados da forma mais igual possível. Cada time mostra quantos ATA e DEF tem,
e cada jogador mostra a posição.

**Why this priority**: é o objetivo da feature; depende da posição nos jogadores (US1).

**Independent Test**: com 6 ATA e 4 DEF presentes, sortear várias vezes e conferir que cada time
tem sempre 3 ATA e 2 DEF, e que nenhuma troca entre jogadores da mesma posição de times diferentes
diminuiria a diferença de estrelas.

**Acceptance Scenarios**:

1. **Given** 10 presentes, 6 ATA e 4 DEF, **When** o organizador sorteia, **Then** cada time tem 3
   ATA e 2 DEF e mostra "3 ATA · 2 DEF".
2. **Given** 15 presentes, 7 ATA e 8 DEF, **When** o organizador sorteia, **Then** um time tem 3
   ATA e 2 DEF e os outros dois têm 2 ATA e 3 DEF.
3. **Given** um sorteio feito, **When** o organizador olha os times, **Then** cada jogador mostra a
   etiqueta ATA ou DEF, inclusive quem está em "Próximos · aguardando vaga".
4. **Given** um sorteio feito, **When** o organizador muda a posição de um jogador, **Then**
   aparece o aviso de que a lista mudou depois do sorteio, como na feature 001.
5. **Given** 10 presentes, **When** o organizador toca em "Sortear de novo" várias vezes, **Then**
   os times podem mudar, mas a divisão por posição continua a mesma.

---

### User Story 3 - Saber o que impede ou limita o sorteio (Priority: P3)

Se algum presente está sem posição, o sorteio não acontece e o organizador sabe quantos faltam
definir. Se não há jogadores de uma posição para todos os times, o sorteio acontece e a tela avisa
qual posição ficou curta.

**Why this priority**: são os casos de borda que o organizador encontra no primeiro uso (jogadores
antigos) e em dias de pouca gente.

**Independent Test**: com 11 presentes, 2 deles sem posição, sortear e conferir o aviso; definir
as duas posições, deixar só 1 DEF entre os presentes, sortear e conferir o aviso de posição em
falta.

**Acceptance Scenarios**:

1. **Given** 11 presentes, 2 deles sem posição, **When** o organizador toca em "Sortear times",
   **Then** nenhum sorteio é feito e aparece, acima do botão, "Defina a posição de 2 presentes para
   sortear."
2. **Given** o aviso visível, **When** o organizador define a posição de um dos dois, **Then** o
   aviso some, como os outros avisos do Elenco.
3. **Given** 10 presentes, 9 ATA e 1 DEF, **When** o organizador sorteia, **Then** os times são
   formados, um deles com o único DEF, e a tela de times mostra "Só 1 defensor para 2 times."
4. **Given** 10 presentes, todos ATA, **When** o organizador sorteia, **Then** os times são formados
   e a tela mostra "Nenhum defensor para 2 times."
5. **Given** 11 presentes, 2 DEF e 9 ATA, **When** o organizador sorteia várias vezes, **Then**
   quem vai para o banco é sempre um atacante, e cada time tem 1 DEF.

---

### Edge Cases

- Menos de 10 presentes: vale a mensagem de jogadores faltando da feature 001, mesmo que algum
  presente esteja sem posição; a posição só é cobrada quando há gente para 2 times.
- Ausentes sem posição não impedem o sorteio.
- Exatamente um jogador de uma posição por time (por exemplo, 2 DEF para 2 times): nenhum deles
  vai para o banco, e cada time recebe 1.
- Posição com menos jogadores que times: nenhum deles vai para o banco; os que existem ficam em
  times diferentes.
- 3 times ou mais: a regra é a mesma; as quantidades de ATA de dois times quaisquer diferem em no
  máximo 1, e o mesmo vale para DEF.
- Mudança de posição depois do sorteio: os times mostrados continuam os do último sorteio, com o
  aviso de lista alterada, até um novo sorteio.
- "Sem posição" não pode ser escolhido de volta: depois de definida, a posição só alterna entre ATA
  e DEF.
- Recarregar a página: o formulário volta a começar sem posição marcada.

## Requirements *(mandatory)*

### Functional Requirements

**Posição do jogador**

- **FR-001**: Todo jogador MUST ter uma posição: ATA (ataque), DEF (defesa) ou, só para jogadores
  cadastrados antes desta feature, "Sem posição".
- **FR-002**: O cadastro de jogador MUST exigir a posição ATA ou DEF; sem ela, o cadastro MUST ser
  recusado com a mensagem "Escolha a posição.".
- **FR-003**: No formulário, a posição MUST começar sem nada marcado ao abrir o Elenco e MUST
  manter a última posição escolhida depois de cada cadastro feito com sucesso.
- **FR-004**: Cada jogador da lista MUST mostrar a posição numa etiqueta: "ATA", "DEF" ou "Sem
  posição".
- **FR-005**: Um toque na etiqueta MUST trocar ATA por DEF e DEF por ATA; em "Sem posição", o
  toque MUST definir ATA.
- **FR-006**: Mudar a posição de um jogador depois de um sorteio MUST mostrar o aviso de lista
  alterada, como as outras mudanças da feature 001 (FR-031 da 001).

**Antes do sorteio**

- **FR-007**: Com 10 ou mais presentes e pelo menos um presente sem posição, o sorteio MUST NOT
  acontecer e o último sorteio MUST continuar como estava. O Elenco MUST mostrar, acima do botão de
  sortear, "Defina a posição de 1 presente para sortear." ou "Defina a posição de N presentes para
  sortear.".
- **FR-008**: O aviso do FR-007 MUST sumir na próxima alteração do elenco, da presença ou de uma
  posição, como o aviso de jogadores faltando (FR-009 da 002).
- **FR-009**: Com menos de 10 presentes, MUST valer a mensagem de jogadores faltando da feature
  001, sem cobrar posição.

**Banco**

- **FR-010**: O banco MUST continuar escolhido por sorteio entre os presentes, com uma restrição:
  um jogador MUST NOT ir para o banco se, sem ele, a posição dele ficaria com menos jogadores do
  que o número de times.
- **FR-011**: Respeitado o FR-010, a escolha do banco MUST ser aleatória; quando nenhuma posição
  estiver no limite, todo presente MUST ter a mesma chance de ir para o banco.

**Divisão dos times**

- **FR-012**: Os atacantes que não forem para o banco MUST ser espalhados entre os times de forma
  que as quantidades de ATA de dois times quaisquer difiram em no máximo 1; o mesmo MUST valer para
  os defensores. Todo time continua com exatamente 5 jogadores.
- **FR-013**: O resultado MUST ser equilibrado no seguinte sentido: para quaisquer dois times,
  trocar um jogador de um por um jogador da mesma posição do outro não deixaria a diferença de
  estrelas entre esses dois times menor do que a do resultado. Este requisito substitui o FR-024
  da feature 001.
- **FR-014**: Quando houver mais de uma divisão que atenda ao FR-012 e ao FR-013, a escolha entre
  elas MUST ser aleatória, como na feature 001 (FR-025 da 001).

**Exibição**

- **FR-015**: Cada time MUST mostrar quantos ATA e DEF tem, no formato "3 ATA · 2 DEF", e cada
  jogador do time MUST mostrar a etiqueta da posição.
- **FR-016**: Cada jogador em "Próximos · aguardando vaga" MUST mostrar a posição.
- **FR-017**: Quando uma posição tiver menos jogadores do que times no sorteio, a tela de times
  MUST mostrar o aviso "Nenhum defensor para N times.", "Só 1 defensor para N times." ou "Só K
  defensores para N times." (e o equivalente com atacante e atacantes). O aviso MUST acompanhar o
  sorteio enquanto ele for o último.
- **FR-018**: As telas MUST seguir os quadros aprovados no canvas: "Elenco · celular", "Elenco ·
  faltam jogadores", "Elenco · posição pendente", "Times · celular" e "Times · falta de posição".
- **FR-019**: Continuam valendo os requisitos de interface das features 001 e 002: português do
  Brasil, 360 px sem rolagem horizontal, alvos de toque de 44 × 44 px, operação por teclado e
  nome acessível nos controles (a etiqueta de posição diz o nome do jogador e a posição).

### Relação com as features 001 e 002

Esta feature muda os seguintes requisitos:

- **001 FR-010 (cadastro)**: o cadastro passa a incluir a posição (FR-002).
- **001 FR-015 (elenco)**: cada jogador passa a mostrar também a posição (FR-004).
- **001 FR-021 (banco)**: o banco continua aleatório, mas com a restrição do FR-010.
- **001 FR-024 (equilíbrio)**: substituído pelo FR-013, que só considera trocas entre jogadores da
  mesma posição.
- **001 FR-026 e FR-028 (exibição dos times e do banco)**: passam a incluir posição (FR-015 e
  FR-016).
- **001 FR-031 (lista alterada)**: mudança de posição também conta (FR-006).
- **002 FR-008 (avisos no Elenco)**: soma-se o aviso de posição pendente (FR-007).

Os demais requisitos das features 001 e 002 continuam valendo sem mudança.

### Key Entities *(include if feature involves data)*

- **Jogador**: ganha a posição: ATA, DEF ou sem posição (só para quem foi cadastrado antes desta
  feature).
- **Sorteio**: cada time passa a ter a contagem de ATA e DEF; o sorteio passa a registrar a posição
  que ficou curta, se houver, com quantos jogadores dela havia e para quantos times.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos sorteios em que há pelo menos um jogador de cada posição por time, nenhum
  time sai só com atacantes nem só com defensores.
- **SC-002**: Em 100% dos sorteios, as quantidades de ATA de dois times quaisquer diferem em no
  máximo 1, e o mesmo vale para DEF.
- **SC-003**: Em 100% dos sorteios, nenhuma troca entre jogadores da mesma posição de times
  diferentes diminuiria a diferença de estrelas entre esses times.
- **SC-004**: Em 100% dos sorteios, o banco não deixa uma posição com menos jogadores do que times
  quando havia como evitar.
- **SC-005**: Cadastrar um jogador com nome, nível e posição continua levando menos de 15 segundos.
- **SC-006**: Definir a posição de um jogador antigo leva 1 toque.
- **SC-007**: Os times continuam aparecendo em menos de 2 segundos depois do toque em sortear, com
  até 100 presentes.

## Assumptions

- Escopo técnico (exigência da constituição): esta feature mexe no frontend e no backend.
- As posições são só ATA e DEF; goleiro e outras posições ficam fora, e cada jogador tem uma única
  posição.
- "Sem posição" existe só para jogadores cadastrados antes desta feature; não há como voltar um
  jogador para "Sem posição".
- A posição guardada no formulário vale só enquanto o Elenco está aberto; recarregar a página volta
  a começar sem posição marcada.
- Com duas posições e times de 5, a restrição do banco (FR-010) sempre pode ser cumprida.
- Os avisos de posição pendente e de posição em falta aparecem só depois de um toque em sortear,
  como o aviso de jogadores faltando da feature 002.
- Referência visual: canvas "Times de Society" (https://claude.ai/artifact/U1GkVhnNWnChkpdAkkT7Cg).
