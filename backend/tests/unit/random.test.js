import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeededRng, randomInt, shuffle } from '../../src/utils/random.js';

const take = (rng, count) => Array.from({ length: count }, () => rng());

test('o gerador com a mesma semente repete a sequência', () => {
  assert.deepEqual(take(createSeededRng(7), 10), take(createSeededRng(7), 10));
});

test('sementes diferentes geram sequências diferentes', () => {
  assert.notDeepEqual(take(createSeededRng(1), 10), take(createSeededRng(2), 10));
});

test('os valores ficam em [0, 1)', () => {
  for (const value of take(createSeededRng(3), 1000)) {
    assert.ok(value >= 0 && value < 1, `fora do intervalo: ${value}`);
  }
});

test('randomInt fica entre 0 e max - 1', () => {
  const rng = createSeededRng(4);
  for (let i = 0; i < 500; i++) {
    const value = randomInt(rng, 6);
    assert.ok(Number.isInteger(value) && value >= 0 && value < 6);
  }
});

test('shuffle mantém os mesmos elementos e não altera a lista original', () => {
  const original = [1, 2, 3, 4, 5, 6, 7, 8];
  const copy = [...original];
  const shuffled = shuffle(original, createSeededRng(5));
  assert.deepEqual(original, copy);
  assert.deepEqual([...shuffled].sort((a, b) => a - b), original);
});
