# Research: MyTeam — o time do grupo

**Feature**: `005-myteam-club` | **Date**: 2026-11-07 | **Plan**: [plan.md](plan.md)

## 1. Nome no código: `club`

- **Decision**: o time do MyTeam se chama `club` no código (tabela `clubs`, rota `/api/club`,
  `clubService`); na tela continua "time".
- **Rationale**: "time" já nomeia os times do sorteio (`Team`, `teams_json`, `teamBalancer`);
  outro nome evita confusão entre os dois.
- **Alternatives considered**: `team` (colide com o sorteio); `squad` (menos claro em pt-BR).

## 2. Um time por conta

- **Decision**: `clubs.organizer_id` é a chave primária. Criar usa `INSERT … ON CONFLICT DO NOTHING
  RETURNING`; sem linha devolvida, a conta já tinha time e a resposta é `409 CLUB_EXISTS`.
- **Rationale**: o banco garante FR-001 mesmo com toques repetidos ou duas abas (SC-003), sem trava
  extra.
- **Alternatives considered**: `SELECT` antes do `INSERT` (corrida entre dois pedidos); travar o
  organizador (desnecessário com a chave primária).

## 3. Jogadores continuam ligados à conta

- **Decision**: `players` não muda; o elenco do time é o elenco da conta.
- **Rationale**: com um time por conta, uma coluna `club_id` só repetiria a conta. Os jogadores das
  contas antigas entram no time sem migrar dados (FR-005); sem time, eles ficam escondidos (§11).
- **Alternatives considered**: `players.club_id` (migração e mudanças no sorteio sem ganho agora; fica
  para quando houver vários times).

## 4. Ícones

- **Decision**: os ids ficam em `CLUB_ICONS` (`ball`, `shield`, `bolt`, `star`, `crown`, `flame`,
  `trophy`, `target`), com `DEFAULT_CLUB_ICON = 'ball'`, em `domain.js`. `GET /api/rules` devolve
  `clubIcons` na ordem da grade. Os desenhos e os nomes em pt-BR ficam em
  `frontend/src/assets/icons/clubIcons.js`; um id sem desenho cai na bola.
- **Rationale**: o backend decide quais ícones valem (Princípio II); desenho é apresentação.
- **Alternatives considered**: enviar imagem (armazenamento de arquivos, fora do escopo); lista só no
  frontend (o backend não teria como validar).

## 5. Rotas de tela

- **Decision**: `#/myteam` mostra o card do time ou o "Criar time"; `#/myteam/elenco` é o elenco do
  time. `#/myfut` deixa de existir e cai no Elenco, como qualquer endereço desconhecido.
- **Rationale**: o caminho segue a navegação (MyTeam → elenco); recarregar mantém a tela (FR-012).

## 6. Estado do time no frontend

- **Decision**: `club` no store, com `undefined` = ainda não lido e `null` = sem time. As duas telas
  leem `GET /api/club` ao abrir; sair volta a `undefined`.
- **Rationale**: o card e o título aparecem na hora ao ir e voltar entre as telas, e cada tela
  confere o valor atual no backend.

## 7. Formulário de criar

- **Decision**: o nome vai num campo com erro logo abaixo; a grade é um grupo de 8 botões de
  64 px com `aria-pressed` e nome acessível ("Bola", "Escudo"…), com a Bola marcada. `VALIDATION_ERROR`
  aparece no campo do nome ou abaixo da grade (`field: "icon"`); `CLUB_EXISTS` lê o time de novo e
  mostra o card.
- **Rationale**: mesmo padrão do formulário de jogador; o caso de duas abas termina no estado certo.

## 8. Elenco do time

- **Decision**: o MyFUT da 004 vira `clubRoster.js` e `clubRosterRow.js` em `components/myteam/`. O
  título ganha o ícone do time (36 px) e "{nome} · N" com reticências, e abaixo vem "Convocar
  jogador", um botão desativado com a etiqueta "Em breve", como "Planos". O cabeçalho de voltar recebe
  o texto ("MyTeam") e o nome acessível ("Voltar ao MyTeam"). Sem time, a tela troca o endereço por
  `#/myteam`.
- **Rationale**: o cadastro manual fica exatamente como está (pedido do usuário); só o topo muda.

## 9. Atalhos do Elenco

- **Decision**: o menu mostra "MyTeam" (`#/myteam`); o Elenco vazio mostra "Abrir MyTeam"
  (`#/myteam`); o aviso de posição pendente leva a `#/myteam/elenco`.
- **Rationale**: o aviso se resolve no elenco do time; sem time, a própria tela leva ao "Criar time".

## 10. Testes

- **Decision**: backend com `unit/clubService.test.js` (validação, ícone padrão, um por conta,
  isolamento entre contas) e `integration/club.test.js` (401, 200 com `null`, 201, 400, 409); o teste
  de regras confere `clubIcons`. No frontend, `playerCountText` em `format.test.js`.
- **Rationale**: Princípio IV; as telas são conferidas pelo [quickstart.md](quickstart.md).
- **US4**: os testes do elenco e do sorteio passam a criar o time das contas (`insertClub` nos
  unitários, `POST /api/club` nos de integração); os casos sem time ficam em `rosterService.test.js`,
  `drawService.test.js` e `club.test.js`.

## 11. Elenco e sorteio só com time (US4)

- **Decision**: a regra fica nos serviços. `clubService.js` exporta `hasClub` e `requireClub`, que
  lança `409 CLUB_REQUIRED` ("Crie o seu time no MyTeam primeiro."). Sem time, `getRosterState`
  devolve o elenco vazio (`drawStale: false`) e `getDraw` devolve `null`; as mudanças no elenco e o
  sorteio chamam `requireClub` dentro da transação, depois de travar o organizador, então nada é
  gravado. A validação da entrada vem antes, como já acontece com `NOT_FOUND`.
- **Rationale**: Princípio II; os jogadores e o último sorteio das contas antigas só ficam
  escondidos e voltam, com a presença, quando o time é criado (FR-019). Como o time não pode ser
  apagado, a checagem não tem corrida que deixe dados errados.
- **Alternatives considered**: esconder só na tela (a API continuaria sorteando sem time);
  `players.organizer_id` com chave estrangeira para `clubs` (exigiria apagar ou mover os jogadores
  das contas sem time); filtrar no `JOIN` do model (o sorteio responderia "faltam 10 jogadores" em vez
  de dizer que falta o time).

## 12. Elenco sem time no frontend

- **Decision**: o Elenco lê `GET /api/club` junto com `GET /api/roster`. Com `club === null`, o
  componente do elenco esconde a contagem, "Todos presentes", "Limpar" e a lista e mostra o bloco
  "Você ainda não tem um time." com "Criar time" (`#/myteam`); a tela esconde o rodapé de sortear.
  Enquanto o time não foi lido, nada disso aparece. O MyTeam lê o elenco de novo depois de criar o
  time, para o card mostrar o total certo.
- **Rationale**: a tela só desenha o que a API diz (Princípio II); o rodapé escondido evita um botão
  que só daria erro.