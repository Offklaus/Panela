// Sobe um Postgres embutido, roda os testes com node --test e desliga.
// Uso: node tests/run.js [arquivos ou padrões de teste]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

const port = await findFreePort();
const password = 'postgres-de-teste';
const postgres = new EmbeddedPostgres({
  databaseDir: fs.mkdtempSync(path.join(os.tmpdir(), 'panela-test-pg-')),
  user: 'postgres',
  password,
  port,
  persistent: false,
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
  postgresFlags: ['-c', 'fsync=off', '-c', 'synchronous_commit=off'],
  onLog: () => {},
  onError: () => {},
});

await postgres.initialise();
await postgres.start();

let exitCode = 1;
try {
  const tests = spawn(process.execPath, ['--test', ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, TEST_DATABASE_URL: `postgres://postgres:${password}@127.0.0.1:${port}/postgres` },
  });
  exitCode = await new Promise((resolve) => tests.on('close', resolve));
} finally {
  await postgres.stop();
}
process.exit(exitCode ?? 1);
