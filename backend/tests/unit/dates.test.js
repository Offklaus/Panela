import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ageOn, isValidDate, localDate } from '../../src/utils/dates.js';

test('localDate dá a data no fuso pedido: 23h30 de Brasília ainda é o dia anterior ao de UTC', () => {
  const instant = new Date('2026-11-08T02:30:00.000Z');
  assert.equal(localDate(instant, 'UTC'), '2026-11-08');
  assert.equal(localDate(instant, 'America/Sao_Paulo'), '2026-11-07');
});

test('isValidDate aceita só YYYY-MM-DD de dias que existem', () => {
  for (const value of ['1998-04-12', '2024-02-29', '2000-12-31']) assert.equal(isValidDate(value), true, value);
  for (const value of ['2023-02-29', '1998-13-01', '1998-04-31', '1998-00-10', '12/04/1998', '1998-4-12', ' 1998-04-12', '', null, 19980412]) {
    assert.equal(isValidDate(value), false, String(value));
  }
});

test('ageOn conta anos completos e muda no dia do aniversário', () => {
  assert.equal(ageOn('1998-04-12', '2026-04-11'), 27);
  assert.equal(ageOn('1998-04-12', '2026-04-12'), 28);
  assert.equal(ageOn('1998-04-12', '2026-11-08'), 28);
});

test('quem nasceu em 29/02 faz aniversário em 1º/03 nos anos não bissextos', () => {
  assert.equal(ageOn('2000-02-29', '2027-02-28'), 26);
  assert.equal(ageOn('2000-02-29', '2027-03-01'), 27);
  assert.equal(ageOn('2000-02-29', '2028-02-29'), 28);
});
