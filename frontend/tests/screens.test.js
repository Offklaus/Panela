import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasTeams, routeAfterDraw } from '../src/utils/screens.js';

const team = { letter: 'A', vest: 'green', players: [], total: 0, average: 0 };

test('hasTeams é falso sem sorteio ou com sorteio sem times', () => {
  assert.equal(hasTeams(null), false);
  assert.equal(hasTeams({ teams: [], bench: [], missingPlayers: 1 }), false);
});

test('hasTeams é verdadeiro quando o sorteio formou times', () => {
  assert.equal(hasTeams({ teams: [team, team], bench: [], missingPlayers: 0 }), true);
});

test('routeAfterDraw abre os times só quando o sorteio formou times', () => {
  assert.equal(routeAfterDraw({ teams: [team, team], bench: [], missingPlayers: 0 }), '/times');
  assert.equal(routeAfterDraw({ teams: [], bench: [], missingPlayers: 1 }), '/');
});
