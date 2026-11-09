import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ageText,
  footText,
  formatDecimal,
  initials,
  missingPlayersText,
  passwordHintText,
  pendingPositionsText,
  playerCountText,
  positionCountText,
  positionShortageText,
  presentCountText,
  starsText,
} from '../src/utils/format.js';

test('ageText escreve a idade em anos', () => {
  assert.equal(ageText(28), '28 anos');
  assert.equal(ageText(1), '1 ano');
  assert.equal(ageText(100), '100 anos');
});

test('footText dá o nome em pt-BR de cada perna e devolve o id quando não conhece', () => {
  assert.equal(footText('right'), 'Direita');
  assert.equal(footText('left'), 'Esquerda');
  assert.equal(footText('both'), 'Ambas');
  assert.equal(footText('outra'), 'outra');
});

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

test('positionCountText mostra as quantidades de cada posição', () => {
  assert.equal(positionCountText({ ATA: 3, DEF: 2 }), '3 ATA · 2 DEF');
});

test('pendingPositionsText no singular e no plural', () => {
  assert.equal(pendingPositionsText(1), 'Defina a posição de 1 presente para sortear.');
  assert.equal(pendingPositionsText(2), 'Defina a posição de 2 presentes para sortear.');
});

test('positionShortageText diz quantos jogadores da posição há para os times', () => {
  assert.equal(positionShortageText({ position: 'DEF', count: 0, teams: 2 }), 'Nenhum defensor para 2 times.');
  assert.equal(positionShortageText({ position: 'DEF', count: 1, teams: 2 }), 'Só 1 defensor para 2 times.');
  assert.equal(positionShortageText({ position: 'ATA', count: 2, teams: 3 }), 'Só 2 atacantes para 3 times.');
});

test('playerCountText diz quantos jogadores o time tem', () => {
  assert.equal(playerCountText(0), 'Nenhum jogador');
  assert.equal(playerCountText(1), '1 jogador');
  assert.equal(playerCountText(12), '12 jogadores');
});