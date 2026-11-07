import { test } from 'node:test';
import assert from 'node:assert/strict';
import { balanceTeams } from '../../src/services/teamBalancer.js';
import { createSeededRng } from '../../src/utils/random.js';

const OPTIONS = { teamSize: 5, minTeams: 2 };

const makePlayers = (ratings) =>
  ratings.map((rating, index) => ({ id: index + 1, rating, position: index % 2 === 0 ? 'ATA' : 'DEF' }));
const randomRatings = (rng, count) => Array.from({ length: count }, () => 1 + Math.floor(rng() * 5));
const draw = (players, seed = 1) => balanceTeams(players, { ...OPTIONS, rng: createSeededRng(seed) });
const sortIds = (ids) => [...ids].sort((a, b) => a - b);

function teamTotals(result, players) {
  const ratingById = new Map(players.map((player) => [player.id, player.rating]));
  return result.teams.map((team) => team.reduce((sum, id) => sum + ratingById.get(id), 0));
}

function assertEveryoneOnce(result, players) {
  assert.deepEqual(sortIds([...result.teams.flat(), ...result.bench]), sortIds(players.map((player) => player.id)));
}

// FR-013 da 003: para quaisquer dois times, nenhuma troca entre jogadores da mesma posição diminui a
// diferença entre eles.
function assertNoImprovingSwap(result, players) {
  const ratingById = new Map(players.map((player) => [player.id, player.rating]));
  const positionById = new Map(players.map((player) => [player.id, player.position]));
  const totals = teamTotals(result, players);
  for (let i = 0; i < result.teams.length; i++) {
    for (let j = i + 1; j < result.teams.length; j++) {
      const difference = totals[i] - totals[j];
      for (const a of result.teams[i]) {
        for (const b of result.teams[j]) {
          if (positionById.get(a) !== positionById.get(b)) continue;
          const afterSwap = difference - 2 * (ratingById.get(a) - ratingById.get(b));
          assert.ok(
            Math.abs(afterSwap) >= Math.abs(difference),
            `trocar ${a} por ${b} melhoraria ${totals[i]} x ${totals[j]}`,
          );
        }
      }
    }
  }
}

test('com menos de 10 presentes nenhum time é formado e todos ficam aguardando', () => {
  const players = makePlayers([5, 4, 3, 3, 2, 1, 4, 5, 3]);
  const result = draw(players);
  assert.deepEqual(result.teams, []);
  assert.deepEqual(result.bench, players.map((player) => player.id));
});

test('10 presentes formam 2 times e ninguém fica no banco', () => {
  const result = draw(makePlayers([5, 4, 4, 3, 3, 3, 2, 4, 3, 2]));
  assert.equal(result.teams.length, 2);
  assert.deepEqual(result.bench, []);
});

test('11 presentes deixam 1 no banco e 14 deixam 4', () => {
  assert.equal(draw(makePlayers(Array(11).fill(3))).bench.length, 1);
  const fourteen = draw(makePlayers(Array(14).fill(3)));
  assert.equal(fourteen.teams.length, 2);
  assert.equal(fourteen.bench.length, 4);
});

test('15 presentes formam 3 times e ninguém fica no banco', () => {
  const result = draw(makePlayers(Array(15).fill(3)));
  assert.equal(result.teams.length, 3);
  assert.deepEqual(result.bench, []);
});

test('todo time tem exatamente 5 jogadores e todo presente aparece uma vez', () => {
  const rng = createSeededRng(11);
  for (let count = 10; count <= 40; count++) {
    const players = makePlayers(randomRatings(rng, count));
    const result = draw(players, count);
    assert.equal(result.teams.length, Math.floor(count / 5));
    for (const team of result.teams) assert.equal(team.length, 5);
    assertEveryoneOnce(result, players);
  }
});

test('em 200 elencos aleatórios nenhuma troca na mesma posição entre dois times diminui a diferença (FR-013 da 003)', () => {
  const rng = createSeededRng(2026);
  for (let round = 0; round < 200; round++) {
    const players = makePlayers(randomRatings(rng, 10 + Math.floor(rng() * 31)));
    assertNoImprovingSwap(draw(players, round), players);
  }
});

test('todos com o mesmo nível dá diferença zero', () => {
  const players = makePlayers(Array(10).fill(3));
  const totals = teamTotals(draw(players), players);
  assert.deepEqual(totals, [15, 15]);
});

test('cada presente tem a mesma chance de ficar no banco (FR-021)', () => {
  const players = makePlayers(randomRatings(createSeededRng(9), 11));
  const rng = createSeededRng(123);
  const benchCount = new Map();
  const runs = 2000;
  for (let i = 0; i < runs; i++) {
    for (const id of balanceTeams(players, { ...OPTIONS, rng }).bench) {
      benchCount.set(id, (benchCount.get(id) ?? 0) + 1);
    }
  }
  for (const player of players) {
    const share = (benchCount.get(player.id) ?? 0) / runs;
    assert.ok(share > 0.06 && share < 0.12, `jogador ${player.id} ficou no banco em ${(share * 100).toFixed(1)}%`);
  }
});

test('a mesma semente repete o resultado e sementes diferentes geram composições diferentes (FR-025)', () => {
  const players = makePlayers(randomRatings(createSeededRng(4), 12));
  assert.deepEqual(draw(players, 77), draw(players, 77));

  const compositions = new Set();
  for (let seed = 1; seed <= 10; seed++) {
    compositions.add(JSON.stringify(draw(players, seed).teams.map(sortIds).sort((a, b) => a[0] - b[0])));
  }
  assert.ok(compositions.size >= 2);
});

test('100 presentes são sorteados em menos de 2 segundos (SC-006)', () => {
  const players = makePlayers(randomRatings(createSeededRng(5), 100));
  const start = performance.now();
  const result = draw(players);
  assert.ok(performance.now() - start < 2000);
  assert.equal(result.teams.length, 20);
  assertNoImprovingSwap(result, players);
});

// Feature 003 - posição

const withPositions = (entries) => entries.map(([rating, position], index) => ({ id: index + 1, rating, position }));
const randomWithPositions = (rng, count) =>
  Array.from({ length: count }, () => [1 + Math.floor(rng() * 5), rng() < 0.5 ? 'ATA' : 'DEF']);

function positionCounts(result, players) {
  const positionById = new Map(players.map((player) => [player.id, player.position]));
  return result.teams.map((team) => ({
    ATA: team.filter((id) => positionById.get(id) === 'ATA').length,
    DEF: team.filter((id) => positionById.get(id) === 'DEF').length,
  }));
}

function assertEvenSplit(result, players) {
  const counts = positionCounts(result, players);
  for (const position of ['ATA', 'DEF']) {
    const values = counts.map((count) => count[position]);
    assert.ok(Math.max(...values) - Math.min(...values) <= 1, `${position} por time: ${values.join(', ')}`);
  }
}

test('6 ATA e 4 DEF formam dois times com 3 ATA e 2 DEF (FR-012 da 003)', () => {
  const players = withPositions([
    [5, 'ATA'], [4, 'ATA'], [4, 'ATA'], [3, 'ATA'], [2, 'ATA'], [1, 'ATA'],
    [5, 'DEF'], [3, 'DEF'], [3, 'DEF'], [2, 'DEF'],
  ]);
  for (let seed = 1; seed <= 30; seed++) {
    assert.deepEqual(positionCounts(draw(players, seed), players), [{ ATA: 3, DEF: 2 }, { ATA: 3, DEF: 2 }]);
  }
});

test('7 ATA e 8 DEF em 3 times: as quantidades de cada posição diferem em no máximo 1', () => {
  const players = withPositions([...Array(7).fill([3, 'ATA']), ...Array(8).fill([4, 'DEF'])]);
  for (let seed = 1; seed <= 30; seed++) assertEvenSplit(draw(players, seed), players);
});

test('em 200 elencos com posições, a divisão é por igual e nenhuma troca na mesma posição melhora (FR-012 e FR-013 da 003)', () => {
  const rng = createSeededRng(303);
  for (let round = 0; round < 200; round++) {
    const players = withPositions(randomWithPositions(rng, 10 + Math.floor(rng() * 31)));
    const result = draw(players, round);
    assertEveryoneOnce(result, players);
    for (const team of result.teams) assert.equal(team.length, 5);
    assertEvenSplit(result, players);
    assertNoImprovingSwap(result, players);
  }
});
test('com 2 DEF e 9 ATA (11 presentes), o banco é sempre um atacante e cada time tem 1 DEF (FR-010 da 003)', () => {
  const players = withPositions([...Array(9).fill([3, 'ATA']), [4, 'DEF'], [2, 'DEF']]);
  for (let seed = 1; seed <= 30; seed++) {
    const result = draw(players, seed);
    assert.ok(result.bench.every((id) => id <= 9), `semente ${seed}: defensor no banco`);
    assert.deepEqual(positionCounts(result, players).map((count) => count.DEF), [1, 1]);
  }
});

test('com 1 DEF para 2 times, o defensor joga e o outro time fica sem defensor', () => {
  const players = withPositions([...Array(9).fill([3, 'ATA']), [4, 'DEF']]);
  for (let seed = 1; seed <= 10; seed++) {
    assert.deepEqual(positionCounts(draw(players, seed), players).map((count) => count.DEF).sort(), [0, 1]);
  }
});