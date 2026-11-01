# Feature Specification: Elenco, presença e sorteio de times

**Feature Branch**: `001-roster-team-draw`

**Created**: 2026-11-01

**Status**: Draft

**Input**: User description: "Times de Society: tela única para o organizador de uma pelada de futebol society montar times equilibrados. Elenco: cadastrar jogador com nome/apelido e nível de 1 a 5 estrelas; alterar o nível de qualquer jogador; remover jogador; marcar cada jogador como presente ou ausente; atalhos "Todos presentes" e "Limpar" presença. Resumo no topo: quantidade de presentes, quantos times de 5 dá para formar e média de estrelas dos presentes. Sorteio: com pelo menos 10 presentes, formar times de 5 equilibrados pela soma de estrelas; quem sobrar fica no banco "aguardando vaga"; mostrar por time o nome (Time A, B...), cor do colete, jogadores com estrelas, total e média; mostrar a diferença de estrelas entre o time mais forte e o mais fraco; botão "Sortear de novo"; avisar quando a lista mudou depois do sorteio; com menos de 10 presentes, mostrar quantos jogadores faltam. Referência visual: canvas "Times de Society"."

## Clarifications

### Session 2026-11-01

- Q: Quem pode ver e editar o elenco? → A: Login por organizador; cada organizador tem a própria
  conta e o próprio elenco.
- Q: Quando sobram jogadores, quem vai para o banco? → A: Escolha aleatória entre os presentes.

## User Scenarios & Testing *(mandatory)*

As histórias estão em ordem de construção: cada uma depende da anterior para ter dados, mas
pode ser testada sozinha a partir de uma conta com elenco já cadastrado.

### User Story 1 - Entrar com a própria conta (Priority: P1)

O organizador cria uma conta com e-mail e senha e entra nela. Cada conta tem o próprio elenco,
que ninguém mais vê. Se esquecer a senha, ele pede um link por e-mail para criar uma nova.

**Why this priority**: todo o resto (elenco, presença, sorteio) pertence a uma conta; sem ela
não há onde guardar os dados de cada organizador.

**Independent Test**: criar duas contas, cadastrar um jogador em cada, sair e entrar de novo em
cada uma e conferir que cada organizador só vê o próprio jogador.

**Acceptance Scenarios**:

1. **Given** nenhuma conta com o e-mail "org@exemplo.com", **When** o organizador cria a conta
   com esse e-mail e uma senha de 8 ou mais caracteres, **Then** ele entra e vê o elenco vazio.
2. **Given** a conta "org@exemplo.com" existe, **When** alguém tenta criar outra conta com o
   mesmo e-mail, **Then** a criação é recusada com uma mensagem.
3. **Given** a conta existe, **When** o organizador entra com a senha errada, **Then** a tela
   mostra "E-mail ou senha incorretos." sem dizer qual dos dois está errado.
4. **Given** os organizadores A e B, cada um com o próprio elenco, **When** A entra, **Then** ele
   vê só o elenco de A e não tem como ver ou alterar o de B.
5. **Given** o organizador esqueceu a senha, **When** ele pede a recuperação para o próprio
   e-mail, **Then** recebe um link que vale por 1 hora e uma única vez, e com ele define uma
   nova senha.
6. **Given** o organizador entrou e não saiu, **When** ele fecha e reabre a tela no mesmo
   aparelho dentro de 30 dias, **Then** continua dentro da conta.

---

### User Story 2 - Montar o elenco com níveis (Priority: P2)

O organizador cadastra os jogadores do grupo, cada um com nome ou apelido e um nível de 1 a 5
estrelas. Ele ajusta o nível de qualquer jogador quando achar que mudou e remove quem saiu do
grupo. O elenco continua lá na próxima vez que ele entrar.

**Why this priority**: é a base do sorteio. Sem elenco com níveis não há presença nem times.

**Independent Test**: numa conta, cadastrar 3 jogadores com níveis diferentes, mudar o nível de
um, remover outro, sair, entrar de novo e conferir que o elenco está como foi deixado.

**Acceptance Scenarios**:

1. **Given** o elenco vazio, **When** o organizador cadastra "Pedrinho" com 4 estrelas,
   **Then** "Pedrinho" aparece no elenco com 4 estrelas, marcado como presente, e o total do
   elenco passa a 1.
2. **Given** "Pedrinho" já está no elenco, **When** o organizador tenta cadastrar " pedrinho ",
   **Then** o cadastro é recusado com uma mensagem dizendo que o nome já existe.
3. **Given** "Pedrinho" com 4 estrelas, **When** o organizador toca na 2ª estrela da linha dele,
   **Then** o nível de "Pedrinho" passa a 2.
4. **Given** "Pedrinho" no elenco, **When** o organizador remove "Pedrinho", **Then** ele some
   do elenco e o total diminui em 1.
5. **Given** o elenco com jogadores cadastrados, **When** o organizador sai e entra de novo,
   **Then** o elenco, os níveis e a presença aparecem como foram deixados.

---

### User Story 3 - Marcar quem veio (Priority: P3)

No dia do jogo, o organizador marca quem está presente e quem faltou. Ele pode marcar todos de
uma vez ou limpar a presença de todos. O resumo no topo mostra quantos vieram, quantos times de
5 dá para formar e a média de estrelas de quem veio.

**Why this priority**: o sorteio só usa quem está presente; a presença muda a cada jogo.

**Independent Test**: com 12 jogadores cadastrados, usar "Limpar", marcar 7 como presentes e
conferir o resumo; depois usar "Todos presentes" e conferir de novo.

**Acceptance Scenarios**:

1. **Given** 12 jogadores, todos ausentes, **When** o organizador marca 7 como presentes,
   **Then** o resumo mostra 7 presentes, 1 time possível e a média de estrelas desses 7 com uma
   casa decimal.
2. **Given** alguns jogadores ausentes, **When** o organizador toca em "Todos presentes",
   **Then** todos ficam presentes e o resumo é atualizado.
3. **Given** jogadores presentes, **When** o organizador toca em "Limpar", **Then** todos ficam
   ausentes e o resumo mostra 0 presentes, 0 times e "–" na média.
4. **Given** um jogador presente, **When** o organizador toca no botão de presença dele,
   **Then** ele passa a ausente; um novo toque o deixa presente de novo.

---

### User Story 4 - Sortear times equilibrados (Priority: P4)

Com pelo menos 10 presentes, o organizador toca em "Montar times" e recebe times de 5
equilibrados pela soma de estrelas. Quem sobrar fica no banco, aguardando vaga, escolhido por
sorteio. Cada time mostra nome, cor do colete, jogadores com estrelas, total e média, e a tela
mostra a diferença de estrelas entre o time mais forte e o mais fraco. Se não gostar, ele toca
em "Sortear de novo".

**Why this priority**: é o objetivo do produto; depende da conta (US1), do elenco (US2) e da
presença (US3).

**Independent Test**: com um elenco de níveis conhecidos, marcar 11 presentes, sortear e
conferir: 2 times de 5, 1 no banco, ninguém repetido, nenhum ausente, diferença exibida e
nenhuma troca de dois jogadores entre os times que deixaria a diferença menor.

**Acceptance Scenarios**:

1. **Given** 11 presentes, **When** o organizador toca em "Montar times", **Then** aparecem
   "Time A" e "Time B" com 5 jogadores cada, 1 jogador em "Próximos · aguardando vaga", e a
   linha de status "2 times de 5 · 1 aguardando".
2. **Given** 10 presentes, todos com 3 estrelas, **When** o organizador sorteia, **Then** os dois
   times têm 15 estrelas e a tela mostra "Equilíbrio perfeito".
3. **Given** 9 presentes, **When** o organizador sorteia, **Then** nenhum time é formado e a tela
   mostra "Falta 1 jogador para fechar 2 times."
4. **Given** um sorteio já feito, **When** o organizador toca em "Sortear de novo", **Then** um
   novo sorteio é feito com os presentes atuais e substitui o anterior.
5. **Given** 15 presentes, **When** o organizador sorteia, **Then** aparecem 3 times (A, B e C)
   com coletes de cores diferentes e ninguém no banco ("ninguém de fora").

---

### User Story 5 - Saber que a lista mudou depois do sorteio (Priority: P5)

Depois de sortear, chega mais alguém, alguém vai embora ou um nível é corrigido. A tela avisa
que a lista mudou desde o sorteio e convida a sortear de novo, sem desmontar os times sozinha.

**Why this priority**: evita jogar com times que não refletem mais quem está presente; é um
complemento do sorteio.

**Independent Test**: sortear com 11 presentes, marcar mais um como presente e conferir que o
aviso aparece e os times continuam os mesmos; sortear de novo e conferir que o aviso some.

**Acceptance Scenarios**:

1. **Given** um sorteio feito, **When** o organizador muda a presença, o nível, cadastra ou
   remove um jogador, **Then** aparece o aviso "A lista mudou depois do sorteio. Toque em
   Sortear de novo para atualizar os times." e os times mostrados continuam os do último
   sorteio.
2. **Given** o aviso visível, **When** o organizador sorteia de novo, **Then** o aviso some.
3. **Given** um sorteio feito, **When** o organizador remove um jogador que estava num time,
   **Then** esse jogador deixa de aparecer no time e o aviso aparece.

---

### Edge Cases

- E-mail em formato inválido ou senha com menos de 8 caracteres: criação de conta recusada com
  mensagem.
- 5 tentativas seguidas de entrar com senha errada no mesmo e-mail: novas tentativas ficam
  bloqueadas por 15 minutos, com mensagem dizendo isso.
- Link de recuperação vencido (mais de 1 hora) ou já usado: a tela avisa e oferece pedir outro.
- Pedido de recuperação para um e-mail sem conta: a tela mostra a mesma confirmação de um e-mail
  com conta, sem revelar se a conta existe.
- Conta nova: começa com elenco vazio e sem sorteio.
- Exatamente 10 presentes: 2 times e ninguém no banco.
- 14 presentes: 2 times e 4 no banco. 15 presentes: 3 times e ninguém no banco.
- Menos de 10 presentes: nenhum time; todos os presentes ficam aguardando e a tela diz quantos
  faltam ("Falta 1 jogador..." no singular, "Faltam N jogadores..." no plural).
- Ninguém presente: resumo com 0 presentes, 0 times e "–" na média.
- Todos com o mesmo nível: diferença 0, exibida como "Equilíbrio perfeito".
- Mais de 8 times (40 ou mais presentes): as letras continuam (I, J...) e as cores de colete se
  repetem na mesma sequência.
- Nome vazio, só com espaços ou com mais de 40 caracteres: cadastro recusado com mensagem.
- Nome repetido no mesmo elenco (ignorando maiúsculas/minúsculas e espaços nas pontas):
  cadastro recusado. O mesmo nome em elencos de organizadores diferentes é permitido.
- Elenco com 100 jogadores: o 101º cadastro é recusado com mensagem.
- Elenco vazio: a tela mostra "Nenhum jogador ainda. Adicione o primeiro acima."
- Uma alteração não pode ser salva (por exemplo, sem conexão): a tela avisa e não mostra a
  alteração como feita.

## Requirements *(mandatory)*

### Functional Requirements

**Conta e acesso**

- **FR-001**: O organizador MUST poder criar uma conta com e-mail válido e senha de no mínimo
  8 caracteres; cada e-mail MUST ter no máximo uma conta.
- **FR-002**: O organizador MUST poder entrar com e-mail e senha. Com dados errados, a mensagem
  MUST ser "E-mail ou senha incorretos.", sem indicar se o e-mail existe.
- **FR-003**: Depois de 5 tentativas seguidas com senha errada para o mesmo e-mail, o sistema
  MUST bloquear novas tentativas desse e-mail por 15 minutos e avisar o organizador.
- **FR-004**: O organizador MUST continuar dentro da conta no mesmo aparelho por até 30 dias,
  até tocar em "Sair".
- **FR-005**: O organizador MUST poder sair da conta a qualquer momento.
- **FR-006**: O organizador MUST poder pedir a recuperação de senha pelo e-mail da conta e
  receber um link que vale por 1 hora e uma única vez. A confirmação do pedido MUST ser a mesma
  para e-mails com e sem conta.
- **FR-007**: Cada organizador MUST ver e alterar somente o próprio elenco, a própria presença e
  o próprio sorteio; os dados de outro organizador MUST NOT ser acessíveis de nenhuma forma.
- **FR-008**: A senha MUST NOT ficar visível para ninguém depois de definida, nem para quem
  administra o sistema.
- **FR-009**: Toda conta nova MUST começar com o elenco vazio e sem sorteio.

**Elenco**

- **FR-010**: O organizador MUST poder cadastrar um jogador informando nome ou apelido
  (obrigatório, de 1 a 40 caracteres depois de tirar os espaços das pontas) e nível de 1 a 5
  estrelas, com 3 estrelas pré-selecionadas.
- **FR-011**: O sistema MUST recusar, com mensagem que explique o motivo, o cadastro com nome
  vazio, nome acima de 40 caracteres, nome já existente no elenco do organizador (ignorando
  maiúsculas, minúsculas e espaços nas pontas) ou elenco já com 100 jogadores.
- **FR-012**: Todo jogador recém-cadastrado MUST entrar como presente.
- **FR-013**: O organizador MUST poder mudar o nível de qualquer jogador tocando na estrela
  correspondente (de 1 a 5).
- **FR-014**: O organizador MUST poder remover um jogador do elenco com um toque, sem etapa de
  confirmação.
- **FR-015**: O elenco MUST ser exibido na ordem de cadastro, mostrando para cada jogador as
  iniciais, o nome, o nível em estrelas e se está presente, além do total de jogadores.

**Presença e resumo**

- **FR-016**: O organizador MUST poder alternar cada jogador entre presente e ausente.
- **FR-017**: "Todos presentes" MUST marcar todos os jogadores como presentes; "Limpar" MUST
  marcar todos como ausentes.
- **FR-018**: O resumo MUST mostrar o número de presentes, o número de times completos de 5
  possíveis (presentes ÷ 5, arredondado para baixo) e a média de estrelas dos presentes com uma
  casa decimal, ou "–" quando ninguém estiver presente. O resumo MUST refletir cada alteração
  assim que ela é feita.

**Sorteio**

- **FR-019**: O sorteio MUST considerar só os jogadores presentes no momento em que é feito.
- **FR-020**: Com 10 ou mais presentes, o sorteio MUST formar o maior número possível de times
  completos de exatamente 5 jogadores; os presentes que sobrarem (0 a 4) MUST ir para o banco.
- **FR-021**: Quem vai para o banco MUST ser escolhido aleatoriamente entre todos os presentes,
  com a mesma chance para cada um, antes da divisão dos times.
- **FR-022**: Com menos de 10 presentes, o sorteio MUST NOT formar times; todos os presentes
  ficam aguardando e a tela MUST mostrar quantos jogadores faltam para fechar 2 times.
- **FR-023**: Todo jogador presente MUST aparecer exatamente uma vez no resultado (em um time ou
  no banco), e nenhum jogador ausente MUST aparecer.
- **FR-024**: O resultado MUST ser equilibrado no seguinte sentido: para quaisquer dois times,
  trocar um jogador de um pelo jogador do outro não deixaria a diferença de estrelas entre esses
  dois times menor do que a do resultado.
- **FR-025**: Quando existir mais de uma divisão que atenda ao FR-024, a escolha entre elas MUST
  ser aleatória, para que "Sortear de novo" possa gerar times diferentes.
- **FR-026**: Cada time MUST ser exibido com nome sequencial (Time A, Time B, ...), cor de colete
  da sequência fixa verde, branco, laranja, azul, rosa, roxo, amarelo e ciano (repetindo depois
  da oitava), jogadores do maior para o menor nível com suas estrelas, total de estrelas e média
  com uma casa decimal.
- **FR-027**: A tela MUST mostrar a diferença de estrelas entre o time de maior total e o de
  menor total, ou "Equilíbrio perfeito" quando a diferença for zero.
- **FR-028**: Quando houver jogadores no banco, a tela MUST listá-los em "Próximos · aguardando
  vaga" com nome e nível; sem ninguém no banco, essa área MUST NOT aparecer.
- **FR-029**: A tela MUST mostrar uma linha de status: "N times de 5 · K aguardando" quando
  houver banco, "N times de 5 · ninguém de fora" quando não houver, ou a mensagem de jogadores
  faltando do FR-022.
- **FR-030**: O botão de sorteio MUST se chamar "Montar times" antes do primeiro sorteio e
  "Sortear de novo" depois dele.

**Mudanças depois do sorteio**

- **FR-031**: Depois de um sorteio, qualquer cadastro, remoção, mudança de nível ou de presença
  MUST mostrar o aviso de que a lista mudou, mantendo os times do último sorteio na tela até um
  novo sorteio.
- **FR-032**: Um jogador removido depois do sorteio MUST deixar de aparecer nos times e no banco
  exibidos.
- **FR-033**: Um novo sorteio MUST remover o aviso de lista alterada.

**Dados e interface**

- **FR-034**: O elenco, os níveis, a presença e o último sorteio de cada organizador MUST
  continuar disponíveis depois de sair e entrar de novo, inclusive em outro aparelho.
- **FR-035**: Quando uma alteração não puder ser salva, a tela MUST avisar o organizador e MUST
  NOT exibir a alteração como feita.
- **FR-036**: Todo texto MUST estar em português do Brasil, com vírgula como separador decimal.
- **FR-037**: Todas as telas, inclusive as de conta, MUST funcionar em largura de celular de
  360 px sem rolagem horizontal, com todos os controles operáveis por teclado e com nome
  acessível nos botões que só têm ícone.

### Key Entities *(include if feature involves data)*

- **Organizador**: dono de uma conta. Tem e-mail (único), senha e um elenco.
- **Jogador**: pessoa do grupo de um organizador. Tem nome ou apelido (único dentro do elenco),
  nível de 1 a 5 estrelas, situação de presença (presente ou ausente) e posição na ordem de
  cadastro.
- **Elenco**: o conjunto de jogadores de um organizador, com no máximo 100 jogadores.
- **Sorteio**: o resultado mais recente de um organizador. Tem a data e hora em que foi feito, a
  lista de times, a lista de quem ficou no banco e a diferença de estrelas entre o time mais
  forte e o mais fraco. Só o último sorteio é guardado.
- **Time**: parte de um sorteio. Tem letra (A, B, ...), cor de colete, 5 jogadores, total e
  média de estrelas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um organizador novo cria a conta e chega ao elenco vazio em menos de 1 minuto.
- **SC-002**: Com o elenco já cadastrado, o organizador marca a presença de 15 jogadores e chega
  aos times sorteados em menos de 1 minuto.
- **SC-003**: Cadastrar um jogador novo, com nome e nível, leva menos de 15 segundos.
- **SC-004**: Em 100% dos sorteios, todo time tem exatamente 5 jogadores, todo presente aparece
  exatamente uma vez e nenhum ausente aparece.
- **SC-005**: Em 100% dos sorteios, nenhuma troca de dois jogadores entre dois times deixaria a
  diferença de estrelas entre esses times menor.
- **SC-006**: Os times aparecem em menos de 2 segundos depois do toque em sortear, com até 100
  jogadores presentes.
- **SC-007**: Em 100% das tentativas de teste, um organizador não consegue ver nem alterar dados
  de outro organizador.
- **SC-008**: 100% dos dados (elenco, níveis, presença e último sorteio) estão iguais depois de
  sair e entrar de novo.
- **SC-009**: Em pelo menos 8 de 10 sorteios testados com o organizador, ele aceita os times sem
  trocar jogadores à mão.

## Assumptions

- Cada conta tem exatamente um elenco; vários elencos por conta, contas compartilhadas entre
  organizadores e acesso de jogadores ficam fora desta versão.
- Entrar com Google ou outras redes, trocar o e-mail da conta e excluir a conta ficam fora desta
  versão.
- A recuperação de senha depende de um serviço de envio de e-mail.
- As telas de criar conta, entrar e recuperar senha não existem no canvas de referência; pela
  constituição (Princípio V) elas devem ser desenhadas no canvas antes da implementação, no
  mesmo estilo da tela principal.
- O tamanho do time é fixo em 5 e o mínimo é de 2 times, como pedido.
- Só o último sorteio é guardado; histórico de rodadas, placar, rodízio de quem joga a próxima e
  posições (como goleiro) ficam fora desta versão.
- Renomear jogador fica fora desta versão; para corrigir um nome, remove-se e cadastra-se de novo.
- A remoção de jogador é imediata, sem confirmação, como no canvas de referência.
- Limites: até 100 jogadores por elenco e até 40 caracteres por nome.
- Se o mesmo organizador mexer no elenco em dois aparelhos ao mesmo tempo, vale a última
  alteração salva.
- Referência visual: canvas "Times de Society" (https://claude.ai/artifact/U1GkVhnNWnChkpdAkkT7Cg).
- Escopo técnico (exigência da constituição): esta feature mexe no frontend e no backend.
