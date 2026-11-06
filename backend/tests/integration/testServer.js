import { createApp } from '../../src/app.js';
import { createSeededRng } from '../../src/utils/random.js';
import { createTestDb } from '../unit/testDb.js';

// Sobe o app numa porta efêmera, com banco de teste, sorteio com semente e e-mail falso.
export async function startTestServer({ now } = {}) {
  const db = await createTestDb();

  const sentMails = [];
  const mailer = {
    async sendPasswordReset(to, link) {
      sentMails.push({ to, link });
    },
  };
  const env = { isProduction: false, appUrl: 'http://localhost:5173', frontendDistDir: null };
  const app = createApp({ db, env, mailer, rng: createSeededRng(42), now });

  const server = await new Promise((resolve) => {
    const listening = app.listen(0, () => resolve(listening));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  return {
    baseUrl,
    db,
    sentMails,
    createClient: () => createClient(baseUrl),
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(() => db.close().then(resolve));
      }),
  };
}

// Cliente HTTP que guarda o cookie de sessão e envia JSON.
export function createClient(baseUrl) {
  let cookie = null;

  async function request(method, path, { body, json = true, headers = {} } = {}) {
    const init = { method, headers: { ...headers } };
    if (cookie) init.headers.cookie = cookie;
    if (body !== undefined) {
      init.body = typeof body === 'string' ? body : JSON.stringify(body);
      if (json) init.headers['content-type'] = 'application/json';
    }

    const response = await fetch(baseUrl + path, init);
    const setCookie = response.headers.getSetCookie();
    for (const header of setCookie) {
      const [pair] = header.split(';');
      const separator = pair.indexOf('=');
      if (pair.slice(0, separator) === 'sid') {
        const value = pair.slice(separator + 1);
        cookie = value ? `sid=${value}` : null;
      }
    }

    const text = await response.text();
    return { status: response.status, headers: response.headers, setCookie, body: text ? JSON.parse(text) : null };
  }

  return {
    get: (path, options) => request('GET', path, options),
    post: (path, options) => request('POST', path, options),
    put: (path, options) => request('PUT', path, options),
    patch: (path, options) => request('PATCH', path, options),
    delete: (path, options) => request('DELETE', path, options),
    get cookie() {
      return cookie;
    },
  };
}
