import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createDrawService } from '../../src/services/drawService.js';
import { createRosterService } from '../../src/services/rosterService.js';
import { createSeededRng } from '../../src/utils/random.js';
import { createClock, createTestDb, expectCode, insertClub, insertOrganizer, insertOrganizerWithClub } from './testDb.js';

let db;
let roster;
let organizer;

beforeEach(async () => {
  db = await createTestDb();
  roster = createRosterService({ db, now: createClock().now });
  organizer = await insertOrganizerWithClub(db);
});

const add = (name, rating = 3, organizerId = organizer.id) => roster.addPlayer(organizerId, { name, rating, position: 'ATA' });
const withoutIds = (players) => players.map(({ id, ...rest }) => rest);

// US2 - elenco

test('addPlayer tira espaços das pontas e o jogador entra presente com o nível pedido', async () => {
  const state = await add('  Pedrinho  ', 4);
  assert.deepEqual(withoutIds(state.players), [{ name: 'Pedrinho', rating: 4, present: true, position: 'ATA' }]);
});

test('addPlayer usa 3 estrelas quando o nível não vem', async () => {
  const state = await roster.addPlayer(organizer.id, { name: 'Sem nível', position: 'ATA' });
  assert.equal(state.players[0].rating, 3);
});

test('addPlayer recusa nome vazio, só com espaços ou com mais de 40 caracteres', async () => {
  for (const name of ['', '   ', 'x'.repeat(41), undefined]) {
    await assert.rejects(add(name), (error) => expectCode('VALIDATION_ERROR')(error) && error.field === 'name');
  }
  assert.equal((await add('x'.repeat(40))).players.length, 1);
});

test('addPlayer recusa nome repetido ignorando maiúsculas, minúsculas e espaços nas pontas', async () => {
  await add('Pedrinho');
  await assert.rejects(add(' pedrinho '), expectCode('NAME_TAKEN'));
});

test('o mesmo nome pode existir no elenco de outro organizador', async () => {
  const other = await insertOrganizerWithClub(db, 'outro@exemplo.com');
  await add('Pedrinho');
  assert.equal((await add('Pedrinho', 3, other.id)).players.length, 1);
});

test('addPlayer recusa o 101º jogador', async () => {
  for (let i = 1; i <= 100; i++) await add(`Jogador ${i}`);
  await assert.rejects(add('Jogador 101'), expectCode('ROSTER_FULL'));
});

test('cadastros simultâneos com o mesmo nome: só um entra', async () => {
  const results = await Promise.allSettled(Array.from({ length: 5 }, () => add('Pedrinho')));
  const rejected = results.filter((result) => result.status === 'rejected');
  assert.equal(rejected.length, 4);
  for (const { reason } of rejected) expectCode('NAME_TAKEN')(reason);
  assert.equal((await roster.getRosterState(organizer.id)).players.length, 1);
});

test('cadastros simultâneos respeitam o limite de 100 jogadores', async () => {
  for (let i = 1; i <= 98; i++) await add(`Jogador ${i}`);
  const results = await Promise.allSettled(Array.from({ length: 5 }, (_, i) => add(`Novo ${i}`)));
  const rejected = results.filter((result) => result.status === 'rejected');
  assert.equal(rejected.length, 3);
  for (const { reason } of rejected) expectCode('ROSTER_FULL')(reason);
  assert.equal((await roster.getRosterState(organizer.id)).players.length, 100);
});

test('nível fora de 1 a 5 ou não inteiro é recusado', async () => {
  for (const rating of [0, 6, 2.5, '3']) {
    await assert.rejects(add(`Nível ${rating}`, rating), expectCode('VALIDATION_ERROR'));
  }
});

test('updatePlayer muda o nível', async () => {
  const [player] = (await add('Pedrinho', 4)).players;
  const state = await roster.updatePlayer(organizer.id, player.id, { rating: 2 });
  assert.equal(state.players[0].rating, 2);
});

test('removePlayer tira o jogador do elenco', async () => {
  await add('Pedrinho');
  const [, second] = (await add('Juca')).players;
  const state = await roster.removePlayer(organizer.id, second.id);
  assert.deepEqual(state.players.map((player) => player.name), ['Pedrinho']);
});

test('o elenco vem na ordem de cadastro', async () => {
  await add('Zé');
  await add('Ana');
  const { players } = await add('Bia');
  assert.deepEqual(players.map((player) => player.name), ['Zé', 'Ana', 'Bia']);
});

test('jogador de outro organizador responde NOT_FOUND', async () => {
  const other = await insertOrganizerWithClub(db, 'outro@exemplo.com');
  const [player] = (await add('Pedrinho')).players;
  await assert.rejects(roster.updatePlayer(other.id, player.id, { rating: 1 }), expectCode('NOT_FOUND'));
  await assert.rejects(roster.removePlayer(other.id, player.id), expectCode('NOT_FOUND'));
  assert.equal((await roster.getRosterState(organizer.id)).players[0].rating, 3);
});

test('o resumo traz presentes, times completos possíveis e média de estrelas', async () => {
  const ratings = [5, 4, 4, 3, 3, 3, 2, 4, 3, 2, 5];
  for (const [index, rating] of ratings.entries()) await add(`Jogador ${index + 1}`, rating);
  const { summary } = await roster.getRosterState(organizer.id);
  assert.equal(summary.presentCount, 11);
  assert.equal(summary.possibleTeams, 2);
  assert.equal(summary.averageRating, 38 / 11);
});

// US3 - presença

test('updatePlayer alterna a presença de um jogador', async () => {
  const [player] = (await add('Pedrinho')).players;
  assert.equal((await roster.updatePlayer(organizer.id, player.id, { present: false })).players[0].present, false);
  assert.equal((await roster.updatePlayer(organizer.id, player.id, { present: true })).players[0].present, true);
});

test('setAllPresent marca todos os jogadores do organizador e só os dele', async () => {
  const other = await insertOrganizerWithClub(db, 'outro@exemplo.com');
  await add('A');
  await add('B');
  await add('C', 3, other.id);

  const cleared = await roster.setAllPresent(organizer.id, { present: false });
  assert.ok(cleared.players.every((player) => !player.present));
  assert.equal((await roster.getRosterState(other.id)).players[0].present, true);

  const all = await roster.setAllPresent(organizer.id, { present: true });
  assert.ok(all.players.every((player) => player.present));
});

test('com 7 presentes o resumo mostra 1 time possível e a média desses 7', async () => {
  for (let i = 1; i <= 12; i++) await add(`Jogador ${i}`, i <= 7 ? 4 : 1);
  await roster.setAllPresent(organizer.id, { present: false });
  const players = (await roster.getRosterState(organizer.id)).players.slice(0, 7);
  let state;
  for (const player of players) state = await roster.updatePlayer(organizer.id, player.id, { present: true });
  assert.deepEqual(state.summary, { presentCount: 7, possibleTeams: 1, averageRating: 4 });
});

test('sem presentes a média é null', async () => {
  await add('A');
  const state = await roster.setAllPresent(organizer.id, { present: false });
  assert.deepEqual(state.summary, { presentCount: 0, possibleTeams: 0, averageRating: null });
});

// US5 - lista alterada depois do sorteio

test('com sorteio salvo, toda alteração no elenco liga drawStale', async () => {
  const draws = createDrawService({ db, rng: createSeededRng(1), now: createClock().now });
  let players;
  for (let i = 1; i <= 12; i++) ({ players } = await add(`Jogador ${i}`));

  const mutations = {
    cadastrar: () => add('Novo'),
    remover: () => roster.removePlayer(organizer.id, players[11].id),
    nível: () => roster.updatePlayer(organizer.id, players[0].id, { rating: 1 }),
    presença: () => roster.updatePlayer(organizer.id, players[1].id, { present: false }),
    posição: () => roster.updatePlayer(organizer.id, players[2].id, { position: 'DEF' }),
    'todos presentes': () => roster.setAllPresent(organizer.id, { present: true }),
    limpar: () => roster.setAllPresent(organizer.id, { present: false }),
  };
  for (const [label, mutate] of Object.entries(mutations)) {
    await draws.createDraw(organizer.id);
    assert.equal((await roster.getRosterState(organizer.id)).drawStale, false, `antes de ${label}`);
    assert.equal((await mutate()).drawStale, true, label);
  }
});

test('sem sorteio salvo, alterar o elenco funciona e drawStale fica false', async () => {
  assert.equal((await add('A')).drawStale, false);
});

test('updatePlayer sem nível nem presença, ou com presença não booleana, é recusado', async () => {
  const [player] = (await add('A')).players;
  await assert.rejects(roster.updatePlayer(organizer.id, player.id, {}), expectCode('VALIDATION_ERROR'));
  await assert.rejects(roster.updatePlayer(organizer.id, player.id, { present: 'sim' }), expectCode('VALIDATION_ERROR'));
  await assert.rejects(roster.setAllPresent(organizer.id, { present: 1 }), expectCode('VALIDATION_ERROR'));
});

// Feature 003 - posição

const positionError = (error) =>
  error.code === 'VALIDATION_ERROR' && error.field === 'position' && error.message === 'Escolha a posição.';

test('addPlayer exige a posição ATA ou DEF (FR-002 da 003)', async () => {
  await assert.rejects(roster.addPlayer(organizer.id, { name: 'Sem posição', rating: 3 }), positionError);
  await assert.rejects(roster.addPlayer(organizer.id, { name: 'Goleiro', rating: 3, position: 'GOL' }), positionError);
  assert.equal((await roster.getRosterState(organizer.id)).players.length, 0);
});

test('addPlayer guarda a posição escolhida', async () => {
  const state = await roster.addPlayer(organizer.id, { name: 'Zagueiro', rating: 4, position: 'DEF' });
  assert.equal(state.players[0].position, 'DEF');
});

test('updatePlayer troca a posição e recusa posição inválida ou vazia (FR-005 da 003)', async () => {
  const [player] = (await add('A')).players;
  assert.equal((await roster.updatePlayer(organizer.id, player.id, { position: 'DEF' })).players[0].position, 'DEF');
  await assert.rejects(roster.updatePlayer(organizer.id, player.id, { position: 'GOL' }), expectCode('VALIDATION_ERROR'));
  await assert.rejects(roster.updatePlayer(organizer.id, player.id, { position: null }), expectCode('VALIDATION_ERROR'));
});

test('jogador cadastrado antes da feature 003 aparece sem posição', async () => {
  await db.run(
    "INSERT INTO players (organizer_id, name, name_key, rating, created_at) VALUES ($1, 'Antigo', 'antigo', 3, now())",
    [organizer.id],
  );
  assert.equal((await roster.getRosterState(organizer.id)).players[0].position, null);
});

// Feature 005 - elenco só com time

// Conta sem time com um jogador gravado direto no banco, como as contas da feature 004.
async function accountWithoutClub() {
  const account = await insertOrganizer(db, 'semtime@exemplo.com');
  const player = await db.one(
    "INSERT INTO players (organizer_id, name, name_key, rating, position, present, created_at) VALUES ($1, 'Antigo', 'antigo', 4, 'DEF', false, now()) RETURNING id",
    [account.id],
  );
  return { account, playerId: player.id };
}

const clubRequired = (error) =>
  error.status === 409 && error.code === 'CLUB_REQUIRED' && error.message === 'Crie o seu time no MyTeam primeiro.';

test('sem time, o elenco vem vazio mesmo com jogadores na conta (FR-018 da 005)', async () => {
  const { account } = await accountWithoutClub();
  assert.deepEqual(await roster.getRosterState(account.id), {
    players: [],
    summary: { presentCount: 0, possibleTeams: 0, averageRating: null },
    drawStale: false,
  });
});

test('sem time, cadastrar, alterar, remover e marcar presença são recusados e nada muda (FR-018 da 005)', async () => {
  const { account, playerId } = await accountWithoutClub();
  const calls = {
    cadastrar: () => roster.addPlayer(account.id, { name: 'Novo', rating: 3, position: 'ATA' }),
    nível: () => roster.updatePlayer(account.id, playerId, { rating: 1 }),
    presença: () => roster.updatePlayer(account.id, playerId, { present: true }),
    posição: () => roster.updatePlayer(account.id, playerId, { position: 'ATA' }),
    remover: () => roster.removePlayer(account.id, playerId),
    'todos presentes': () => roster.setAllPresent(account.id, { present: true }),
  };
  for (const [label, call] of Object.entries(calls)) await assert.rejects(call(), clubRequired, label);
  assert.deepEqual(await db.query('SELECT name, rating, present, position FROM players WHERE organizer_id = $1', [account.id]), [
    { name: 'Antigo', rating: 4, present: false, position: 'DEF' },
  ]);
});

test('sem time, a validação da entrada vem antes da falta de time', async () => {
  const { account } = await accountWithoutClub();
  await assert.rejects(roster.addPlayer(account.id, { name: '', rating: 3, position: 'ATA' }), expectCode('VALIDATION_ERROR'));
});

test('ao criar o time, os jogadores da conta voltam com a presença que tinham (FR-019 da 005)', async () => {
  const { account } = await accountWithoutClub();
  await insertClub(db, account.id);
  const state = await roster.getRosterState(account.id);
  assert.deepEqual(withoutIds(state.players), [{ name: 'Antigo', rating: 4, present: false, position: 'DEF' }]);
  assert.equal((await roster.setAllPresent(account.id, { present: true })).summary.presentCount, 1);
});