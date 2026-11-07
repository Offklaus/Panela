# Research: Posição dos jogadores e sorteio por posição

**Feature**: `003-player-positions` | **Date**: 2026-11-06 | **Plan**: [plan.md](plan.md)

Decisões técnicas da Fase 0. Mexe no banco, na API, no algoritmo do sorteio e nas duas telas.

## 1. Onde guardar a posição

- **Decisão**: coluna `position TEXT` em `players`, com `CHECK (position IN ('ATA', 'DEF'))` e
  aceitando `NULL`, criada pela migração `backend/src/database/migrations/002_player_position.sql`.
  `NULL` é "Sem posição", o estado dos jogadores cadastrados antes desta feature (FR-001).
- **Por quê**: o sistema de migrações já aplica arquivos novos em ordem ao subir o backend, numa
  transação. Uma coluna basta, porque cada jogador tem uma única posição.
- **Alternativas descartadas**: `NOT NULL` com valor padrão (inventaria a posição dos jogadores
  antigos); tabela separada de posições (complexidade sem ganho, Princípio VI).

## 2. Validação

- **Decisão**: `POSITIONS = ['ATA', 'DEF']` em `backend/src/config/domain.js` e `validatePosition`
  em `playerValidator.js`. No cadastro, a posição é obrigatória: sem ela ou com valor inválido, sai
  `400 VALIDATION_ERROR` com `field: "position"` e a mensagem "Escolha a posição." (FR-002). No
  `PATCH`, a posição é opcional, mas, se vier, tem de ser ATA ou DEF.
- **Por quê**: o backend valida toda entrada (Princípio II); o frontend não repete a regra e só
  mostra a mensagem que a API devolve.

## 3. Bloqueio por posição pendente

- **Decisão**: em `drawService.createDraw`, dentro da transação que já trava o organizador: se há
  pelo menos `MIN_TEAMS × TEAM_SIZE` presentes e algum deles está sem posição, sai
  `409 POSITIONS_MISSING` com a mensagem "Defina a posição de N presentes para sortear." e
  `missingPositions: N` no corpo (FR-007), usando o `extra` do `AppError`, como o `LOGIN_LOCKED` faz
  com `retryAfterSeconds`. Nada é gravado, então o último sorteio continua o mesmo.
- **Com menos presentes** (FR-009): segue a regra da 001 e grava o sorteio sem times, sem olhar a
  posição.

## 4. Banco com restrição de posição (FR-010 e FR-011)

- **Decisão**: o balanceador embaralha os presentes (Fisher–Yates com o `rng` injetável, como hoje).
  Cada posição recebe uma cota de banco, `max(0, presentes da posição − times)`. Percorrendo a ordem
  embaralhada, cada jogador vai para o banco se a posição dele ainda tem cota, até o banco ficar
  completo.
- **Por quê**: quando nenhuma cota limita, isso é exatamente o banco de hoje (os primeiros do
  embaralhamento), então cada presente tem a mesma chance (FR-011). Quando uma posição está no
  limite, nenhum jogador dela vai para o banco (FR-010).
- **Sempre fecha**: com duas posições, `ATA + DEF = 5·T + B` (T times, B no banco). Se as duas têm
  pelo menos T jogadores, as cotas somam `3·T + B ≥ B`; se uma tem menos que T, a cota da outra é
  `4·T + B − (menos que T) > B`.

## 5. Divisão por posição (FR-012)

- **Decisão**: depois do banco, cada time recebe `⌊ATA ÷ T⌋` atacantes, e `ATA mod T` times recebem
  um a mais; os times que recebem esse atacante extra são sorteados com o `rng`. Os outros recebem
  o defensor extra. As contas fecham porque `ATA + DEF = 5·T` depois do banco. Em seguida, a divisão
  gulosa de hoje (maior nível primeiro, para o time incompleto de menor total) passa a respeitar
  quantos jogadores de cada posição cabem em cada time.
- **Posição em falta**: com menos defensores que times, `⌊DEF ÷ T⌋ = 0` e só alguns times recebem
  1 defensor; os outros ficam só com atacantes. É o melhor possível, e a tela avisa (§7).

## 6. Equilíbrio por troca na mesma posição (FR-013)

- **Decisão**: o refinamento de hoje continua, mas só troca jogadores da mesma posição. Cada troca
  continua diminuindo a soma dos quadrados dos totais, então o laço termina.
- **Por quê**: uma troca entre posições diferentes mudaria as contagens do FR-012. O FR-013 pede
  justamente que nenhuma troca entre jogadores da mesma posição diminua a diferença entre dois
  times, e esse é o critério que o teste verifica.
- **Alternativas descartadas**: posição como penalidade no cálculo (não garante o FR-012); busca
  exaustiva (lenta com até 100 presentes, contra o SC-007).

## 7. Contagens e posição em falta na resposta

- **Decisão**: `getDraw` calcula, a partir das posições atuais dos jogadores de cada time,
  `positions: { ATA, DEF }` por time e `positionShortage` no sorteio: a posição com menos jogadores
  que times entre os que estão nos times, com `count` e `teams`, ou `null`. Os níveis e totais já
  são calculados assim.
- **Por quê**: não precisa de coluna nova em `draws`. Se uma posição mudar depois do sorteio, o
  sorteio fica desatualizado (§8), e o aviso de lista alterada cobre a diferença.

## 8. Mudança de posição desatualiza o sorteio (FR-006)

- **Decisão**: o `PATCH` de posição passa pelo `mutate` do `rosterService`, que já marca o sorteio
  como desatualizado. Nada novo além de aceitar `position` no `validatePlayerUpdate`.

## 9. Formulário de novo jogador

- **Decisão**: grupo "Posição" com dois botões (`aria-pressed`), ATA e DEF, abaixo do nível. A
  posição começa `null` ao montar o Elenco e guarda a última escolhida depois de um cadastro com
  sucesso (FR-003). O formulário envia o que tem; sem posição, mostra a mensagem do
  `VALIDATION_ERROR` com `field: "position"` logo abaixo da linha "Posição".

## 10. Etiqueta de posição na lista

- **Decisão**: um botão de 44 × 44 px com a etiqueta visível ("ATA", "DEF" ou "Sem posição") e nome
  acessível "Posição de {nome}: ATA (ataque)". O toque calcula a próxima posição (ATA ↔ DEF; sem
  posição → ATA) e manda `PATCH { position }`. Alternar é escolha de interface, não regra do sorteio.

## 11. Avisos e textos no frontend

- **Decisão**: `screenActions.drawTeams` trata `POSITIONS_MISSING` guardando `pendingPositions` no
  store, como o `shortfall` da 002, e o Elenco mostra o aviso acima do botão. Ele é limpo nas mesmas
  situações (alteração do elenco, da presença ou da posição; sorteio com times; sair). O `ApiError`
  passa a carregar `missingPositions`. Os textos vêm de funções puras em `utils/format.js`, testadas:
  `pendingPositionsText(n)`, `positionCountText(positions)` ("3 ATA · 2 DEF") e
  `positionShortageText(shortage)` ("Só 1 defensor para 2 times.").

## 12. Testes existentes

- **Decisão**: os testes que cadastram jogadores passam a enviar `position`; os do balanceador
  passam a dar posição aos jogadores e a verificar as trocas só dentro da mesma posição (o antigo
  teste do FR-024 da 001 vira o do FR-013).

## Dependências

Nenhuma nova.
