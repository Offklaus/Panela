# Times de Society

Web app para o organizador de uma pelada de futebol society montar times equilibrados: cadastra o
elenco com nível de 1 a 5 estrelas, marca quem veio e sorteia times de 5 com a menor diferença de
estrelas possível por troca, deixando quem sobra no banco.

| Pasta | O que é |
|-------|---------|
| `backend/` | API REST em Node.js 22 + Express 5, PostgreSQL (pg) |
| `frontend/` | Tela em JavaScript puro + Vite |
| `specs/001-roster-team-draw/` | Spec, plano, contratos e tarefas da primeira feature (Spec Kit) |
| `.specify/memory/constitution.md` | Regras do projeto |

## Rodar

Pré-requisitos: Node.js 22.9 ou superior e PostgreSQL 17 local. No Windows, se o PowerShell bloquear o
`npm`, use `npm.cmd`.

Crie o arquivo `backend/.env`, que fica fora do repositório, com esta linha e uma senha só sua:

```dotenv
DATABASE_URL=postgres://panela_dev:troque-esta-senha@localhost:5432/panela_dev
```

Depois:

```bash
cd backend
npm install
npm run db:create
npm run dev
```

O `db:create` cria esse usuário e o banco `panela_dev` e pede a senha do `postgres` no terminal, sem
guardá-la. As tabelas são criadas quando o backend sobe. As demais variáveis são opcionais no
desenvolvimento e estão em [Variáveis do backend](#variáveis-do-backend).

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`. Sem SMTP configurado, o link de recuperação de senha aparece no log
do backend.

## Variáveis do backend

| Variável | Para que serve | Sem definir |
|----------|----------------|-------------|
| `DATABASE_URL` | Conexão com o PostgreSQL | Obrigatória: o backend não sobe |
| `PORT` | Porta da API | `3000` |
| `NODE_ENV` | `production` liga as exigências de produção | Modo de desenvolvimento |
| `APP_URL` | Endereço da tela, usado no link de recuperação de senha | `http://localhost:5173` |
| `FRONTEND_DIST_DIR` | Pasta do frontend compilado, servida na mesma origem da API | Não serve o frontend |
| `SMTP_HOST` | Servidor de e-mail | O link de recuperação sai no log |
| `SMTP_PORT` | Porta do servidor de e-mail | `587` |
| `SMTP_USER`, `SMTP_PASS` | Usuário e senha do servidor de e-mail | Vazios |
| `MAIL_FROM` | Remetente dos e-mails | `Times de Society <no-reply@localhost>` |
| `PG_SUPERUSER` | Usuário administrador que o `db:create` usa | `postgres` |

Com `NODE_ENV=production`, `APP_URL`, `MAIL_FROM` e todas as `SMTP_*` passam a ser obrigatórias.

## Testes

```bash
cd backend
npm test
```

O backend sobe um Postgres embutido e descartável só para os testes; na primeira instalação o `npm`
baixa esse pacote.

```bash
cd frontend
npm test
```

## Produção

Gere o frontend (`npm run build` em `frontend/`), defina `FRONTEND_DIST_DIR=../frontend/dist` e
`NODE_ENV=production` no `.env` do backend, com `APP_URL` e as variáveis `SMTP_*`, e rode
`npm start` em `backend/`, com `DATABASE_URL` apontando para o Postgres de produção. A tela e a API
ficam na mesma origem. Sem o arquivo `.env`, o `npm start` usa as variáveis definidas no ambiente,
como numa plataforma de hospedagem.

Roteiro completo de validação: [specs/001-roster-team-draw/quickstart.md](specs/001-roster-team-draw/quickstart.md).
