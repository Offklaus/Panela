import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDecimal, initials, missingPlayersText, passwordHintText, presentCountText, starsText } from '../src/utils/format.js';

test('formatDecimal usa uma casa e vírgula', () => {
  assert.equal(formatDecimal(3.4), '3,4');
  assert.equal(formatDecimal(4), '4,0');
  assert.equal(formatDecimal(3.25), '3,3');
});

test('formatDecimal mostra "–" sem valor', () => {
  assert.equal(formatDecimal(null), '–');
  assert.equal(formatDecimal(undefined), '–');
});

test('initials usa primeira e última palavra, ou as duas primeiras letras', () => {
  assert.equal(initials('Jogador 01'), 'J0');
  assert.equal(initials('pedro  henrique souza'), 'PS');
  assert.equal(initials('Pedrinho'), 'PE');
});

test('starsText no singular e no plural', () => {
  assert.equal(starsText(1), '1 estrela');
  assert.equal(starsText(3), '3 estrelas');
});

test('missingPlayersText no singular e no plural', () => {
  assert.equal(missingPlayersText(1, 2), 'Falta 1 jogador para fechar 2 times.');
  assert.equal(missingPlayersText(3, 2), 'Faltam 3 jogadores para fechar 2 times.');
});

test('missingPlayersText usa o mínimo de times informado', () => {
  assert.equal(missingPlayersText(1, 3), 'Falta 1 jogador para fechar 3 times.');
});

test('presentCountText no singular e no plural', () => {
  assert.equal(presentCountText(0), '0 presentes');
  assert.equal(presentCountText(1), '1 presente');
  assert.equal(presentCountText(11), '11 presentes');
});

test('passwordHintText usa o mínimo informado', () => {
  assert.equal(passwordHintText(10), 'Mínimo de 10 caracteres.');
});
