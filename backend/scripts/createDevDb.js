// Cria o usuário e o banco de desenvolvimento no Postgres local, a partir de DATABASE_URL (backend/.env).
// A senha do superusuário é pedida pelo próprio psql no terminal e não é guardada.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function fail(message) {
  console.error(message);
  process.exit(1);
}

function findPsql() {
  const installRoot = path.join(process.env.ProgramFiles ?? '', 'PostgreSQL');
  if (process.platform === 'win32' && fs.existsSync(installRoot)) {
    const versions = fs
      .readdirSync(installRoot)
      .filter((name) => /^\d+$/.test(name))
      .sort((a, b) => Number(b) - Number(a));
    if (versions.length > 0) return path.join(installRoot, versions[0], 'bin', 'psql.exe');
  }
  return 'psql';
}

const literal = (value) => `'${value.replaceAll("'", "''")}'`;
const identifier = (value) => `"${value.replaceAll('"', '""')}"`;

if (!process.env.DATABASE_URL) fail('Defina DATABASE_URL no backend/.env (veja o README).');

const url = new URL(process.env.DATABASE_URL);
const host = url.hostname.replace(/^\[|\]$/g, '');
if (!LOCAL_HOSTS.has(host)) fail(`Este script só roda em banco local; DATABASE_URL aponta para ${host}.`);

const role = decodeURIComponent(url.username);
const password = decodeURIComponent(url.password);
const database = url.pathname.slice(1);
if (!role || !password || !database) fail('DATABASE_URL precisa ter usuário, senha e nome do banco.');

// template0 com UTF8: o template1 do instalador do Windows costuma vir em WIN1252.
const createDatabase = `CREATE DATABASE ${identifier(database)} OWNER ${identifier(role)} TEMPLATE template0 ENCODING 'UTF8'`;
const sql = `
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = ${literal(role)}) THEN
    ALTER ROLE ${identifier(role)} WITH LOGIN PASSWORD ${literal(password)};
  ELSE
    CREATE ROLE ${identifier(role)} WITH LOGIN PASSWORD ${literal(password)};
  END IF;
END
$do$;
SELECT ${literal(createDatabase)}
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = ${literal(database)}) \\gexec
`;

const superuser = process.env.PG_SUPERUSER ?? 'postgres';
console.log(`Criando o usuário e o banco "${database}" em ${host}:${url.port || 5432}. Digite a senha do usuário ${superuser}:`);

const psql = spawn(
  findPsql(),
  ['-h', host, '-p', url.port || '5432', '-U', superuser, '-d', 'postgres', '-q', '-v', 'ON_ERROR_STOP=1'],
  { stdio: ['pipe', 'inherit', 'inherit'] },
);

psql.on('error', (error) => fail(`Não foi possível executar o psql: ${error.message}`));
psql.on('close', (code) => {
  if (code !== 0) fail('O banco não foi criado.');
  console.log(`Pronto: banco "${database}" e usuário "${role}" criados.`);
});
psql.stdin.end(sql);
