import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vestInfo } from '../src/utils/vests.js';

const KEYS = ['green', 'white', 'orange', 'blue', 'pink', 'purple', 'yellow', 'cyan'];

test('verde usa a cor de destaque do canvas e o rótulo "Colete verde"', () => {
  assert.deepEqual(vestInfo('green'), { color: '#33FF00', label: 'Colete verde' });
});

test('as 8 cores de colete têm cor e rótulo próprios', () => {
  const infos = KEYS.map(vestInfo);
  for (const info of infos) {
    assert.match(info.color, /^#[0-9A-F]{6}$/);
    assert.match(info.label, /^Colete /);
  }
  assert.equal(new Set(infos.map((info) => info.color)).size, 8);
});

test('chave desconhecida cai num colete neutro', () => {
  assert.equal(vestInfo('marrom').label, 'Colete');
});
