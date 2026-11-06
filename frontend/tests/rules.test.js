import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ratingLevels } from '../src/utils/rules.js';

test('ratingLevels vai do mínimo ao máximo informados', () => {
  assert.deepEqual(ratingLevels({ ratingMin: 1, ratingMax: 5 }), [1, 2, 3, 4, 5]);
  assert.deepEqual(ratingLevels({ ratingMin: 2, ratingMax: 4 }), [2, 3, 4]);
});
