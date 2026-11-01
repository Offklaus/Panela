import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../src/state/store.js';

test('setState junta o estado novo ao anterior', () => {
  const store = createStore({ organizer: null, roster: null });
  store.setState({ organizer: { id: 1 } });
  assert.deepEqual(store.getState(), { organizer: { id: 1 }, roster: null });
});

test('assinantes recebem o estado a cada mudança', () => {
  const store = createStore({ count: 0 });
  const seen = [];
  store.subscribe((state) => seen.push(state.count));
  store.setState({ count: 1 });
  store.setState({ count: 2 });
  assert.deepEqual(seen, [1, 2]);
});

test('cancelar a assinatura para as notificações', () => {
  const store = createStore({ count: 0 });
  const seen = [];
  const unsubscribe = store.subscribe((state) => seen.push(state.count));
  store.setState({ count: 1 });
  unsubscribe();
  store.setState({ count: 2 });
  assert.deepEqual(seen, [1]);
});
