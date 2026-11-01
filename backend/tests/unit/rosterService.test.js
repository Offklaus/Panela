import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createDrawService } from '../../src/services/drawService.js';
import { createRosterService } from '../../src/services/rosterService.js';
import { createSeededRng } from '../../src/utils/random.js';
import { createClock, createTestDb, expectCode, insertOrganizer } from './testDb.js';

let db;
let roster;
let organizer;

beforeEach(() => {
  db = createTestDb();
  roster = createRosterService({ db, now: createClock().now });
  organizer = insertOrganizer(db);
});

const add = (name, rating = 3, organizerId = organizer.id) => roster.addPlayer(organizerId, { name, rating });
const withoutIds = (players) => players.map(({ id, ...rest }) => rest);

// US2 - elenco

test('addPlayer tira espaços das pontas e o jogador entra presente com o nível pedido', () => {
  const state = add('  Pedrinho  ', 4);
  assert.deepEqual(withoutIds(state.players), [{ name: 'Pedrinho', rating: 4, present: true }]);
});

test('addPlayer usa 3 estrelas quando o nível não vem', () => {
  const state = roster.addPlayer(organizer.id, { name: 'Sem nível' });
  assert.equal(state.players[0].rating, 3);
});

test('addPlayer recusa nome vazio, só com espaços ou com mais de 40 caracteres', () => {
  for (const name of ['', '   ', 'x'.repeat(41), undefined]) {
    assert.throws(() => add(name), (error) => expectCode('VALIDATION_ERROR')(error) && error.field === 'name');
  }
  assert.equal(add('x'.repeat(40)).players.length, 1);
});

test('addPlayer recusa nome repetido ignorando maiúsculas, minúsculas e espaços nas pontas', () => {
  add('Pedrinho');
  assert.throws(() => add(' pedrinho '), expectCode('NAME_TAKEN'));
});

test('o mesmo nome pode existir no elenco de outro organizador', () => {
  const other = insertOrganizer(db, 'outro@exemplo.com');
  add('Pedrinho');
  assert.equal(add('Pedrinho', 3, other.id).players.length, 1);
});

test('addPlayer recusa o 101º jogador', () => {
  for (let i = 1; i <= 100; i++) add(`Jogador ${i}`);
  assert.throws(() => add('Jogador 101'), expectCode('ROSTER_FULL'));
});

test('nível fora de 1 a 5 ou não inteiro é recusado', () => {
  for (const rating of [0, 6, 2.5, '3']) {
    assert.throws(() => add(`Nível ${rating}`, rating), expectCode('VALIDATION_ERROR'));
  }
});

test('updatePlayer muda o nível', () => {
  const [player] = add('Pedrinho', 4).players;
  const state = roster.updatePlayer(organizer.id, player.id, { rating: 2 });
  assert.equal(state.players[0].rating, 2);
});

test('removePlayer tira o jogador do elenco', () => {
  add('Pedrinho');
  const [, second] = add('Juca').players;
  const state = roster.removePlayer(organizer.id, second.id);
  assert.deepEqual(state.players.map((player) => player.name), ['Pedrinho']);
});

test('o elenco vem na ordem de cadastro', () => {
  add('Zé');
  add('Ana');
  assert.deepEqual(add('Bia').players.map((player) => player.name), ['Zé', 'Ana', 'Bia']);
});

test('jogador de outro organizador responde NOT_FOUND', () => {
  const other = insertOrganizer(db, 'outro@exemplo.com');
  const [player] = add('Pedrinho').players;
  assert.throws(() => roster.updatePlayer(other.id, player.id, { rating: 1 }), expectCode('NOT_FOUND'));
  assert.throws(() => roster.removePlayer(other.id, player.id), expectCode('NOT_FOUND'));
  assert.equal(roster.getRosterState(organizer.id).players[0].rating, 3);
});

test('o resumo traz presentes, times completos possíveis e média de estrelas', () => {
  const ratings = [5, 4, 4, 3, 3, 3, 2, 4, 3, 2, 5];
  ratings.forEach((rating, index) => add(`Jogador ${index + 1}`, rating));
  const { summary } = roster.getRosterState(organizer.id);
  assert.equal(summary.presentCount, 11);
  assert.equal(summary.possibleTeams, 2);
  assert.equal(summary.averageRating, 38 / 11);
});

// US3 - presença

test('updatePlayer alterna a presença de um jogador', () => {
  const [player] = add('Pedrinho').players;
  assert.equal(roster.updatePlayer(organizer.id, player.id, { present: false }).players[0].present, false);
  assert.equal(roster.updatePlayer(organizer.id, player.id, { present: true }).players[0].present, true);
});

test('setAllPresent marca todos os jogadores do organizador e só os dele', () => {
  const other = insertOrganizer(db, 'outro@exemplo.com');
  add('A');
  add('B');
  add('C', 3, other.id);

  const cleared = roster.setAllPresent(organizer.id, { present: false });
  assert.ok(cleared.players.every((player) => !player.present));
  assert.equal(roster.getRosterState(other.id).players[0].present, true);

  const all = roster.setAllPresent(organizer.id, { present: true });
  assert.ok(all.players.every((player) => player.present));
});

test('com 7 presentes o resumo mostra 1 time possível e a média desses 7', () => {
  for (let i = 1; i <= 12; i++) add(`Jogador ${i}`, i <= 7 ? 4 : 1);
  roster.setAllPresent(organizer.id, { present: false });
  const players = roster.getRosterState(organizer.id).players.slice(0, 7);
  let state;
  for (const player of players) state = roster.updatePlayer(organizer.id, player.id, { present: true });
  assert.deepEqual(state.summary, { presentCount: 7, possibleTeams: 1, averageRating: 4 });
});

test('sem presentes a média é null', () => {
  add('A');
  const state = roster.setAllPresent(organizer.id, { present: false });
  assert.deepEqual(state.summary, { presentCount: 0, possibleTeams: 0, averageRating: null });
});

// US5 - lista alterada depois do sorteio

test('com sorteio salvo, toda alteração no elenco liga drawStale', () => {
  const draws = createDrawService({ db, rng: createSeededRng(1), now: createClock().now });
  let players;
  for (let i = 1; i <= 12; i++) players = add(`Jogador ${i}`).players;

  const mutations = {
    cadastrar: () => add('Novo'),
    remover: () => roster.removePlayer(organizer.id, players[11].id),
    nível: () => roster.updatePlayer(organizer.id, players[0].id, { rating: 1 }),
    presença: () => roster.updatePlayer(organizer.id, players[1].id, { present: false }),
    'todos presentes': () => roster.setAllPresent(organizer.id, { present: true }),
    limpar: () => roster.setAllPresent(organizer.id, { present: false }),
  };
  for (const [label, mutate] of Object.entries(mutations)) {
    draws.createDraw(organizer.id);
    assert.equal(roster.getRosterState(organizer.id).drawStale, false, `antes de ${label}`);
    assert.equal(mutate().drawStale, true, label);
  }
});

test('sem sorteio salvo, alterar o elenco funciona e drawStale fica false', () => {
  assert.equal(add('A').drawStale, false);
});

test('updatePlayer sem nível nem presença, ou com presença não booleana, é recusado', () => {
  const [player] = add('A').players;
  assert.throws(() => roster.updatePlayer(organizer.id, player.id, {}), expectCode('VALIDATION_ERROR'));
  assert.throws(() => roster.updatePlayer(organizer.id, player.id, { present: 'sim' }), expectCode('VALIDATION_ERROR'));
  assert.throws(() => roster.setAllPresent(organizer.id, { present: 1 }), expectCode('VALIDATION_ERROR'));
});
