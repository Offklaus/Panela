import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CLUB_ICONS,
  DEFAULT_RATING,
  MIN_TEAMS,
  PASSWORD_MIN_LENGTH,
  RATING_MAX,
  RATING_MIN,
} from '../../src/config/domain.js';
import { startTestServer } from './testServer.js';

let server;

before(async () => {
  server = await startTestServer();
});

after(() => server.close());

test('GET /api/rules responde sem sessão, com cada valor de domain.js no campo certo', async () => {
  const res = await server.createClient().get('/api/rules');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    rules: {
      ratingMin: RATING_MIN,
      ratingMax: RATING_MAX,
      defaultRating: DEFAULT_RATING,
      passwordMinLength: PASSWORD_MIN_LENGTH,
      minTeams: MIN_TEAMS,
      clubIcons: [...CLUB_ICONS],
    },
  });
});
