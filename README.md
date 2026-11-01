# Times de Society

Web app para o organizador de uma pelada de futebol society montar times equilibrados: cadastra o
elenco com nível de 1 a 5 estrelas, marca quem veio e sorteia times de 5 com a menor diferença de
estrelas possível por troca, deixando quem sobra no banco.

| Pasta | O que é |
|-------|---------|
| `backend/` | API REST em Node.js 22 + Express 5, SQLite (better-sqlite3) |
| `frontend/` | Tela em JavaScript puro + Vite |
| `specs/001-roster-team-draw/` | Spec, plano, contratos e tarefas da primeira feature (Spec Kit) |
| `.specify/memory/constitution.md` | Regras do projeto |

## Rodar

Pré-requisito: Node.js 22 ou superior.

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`. Sem SMTP configurado, o link de recuperação de senha aparece no log
do backend.

## Testes

```bash
cd backend
npm test
```

```bash
cd frontend
npm test
```

## Produção

Gere o frontend (`npm run build` em `frontend/`), defina `FRONTEND_DIST_DIR=../frontend/dist` e
`NODE_ENV=production` no `.env` do backend, com `APP_URL` e as variáveis `SMTP_*`, e rode
`npm start` em `backend/`. A tela e a API ficam na mesma origem. O SQLite precisa de disco
persistente.

Roteiro completo de validação: [specs/001-roster-team-draw/quickstart.md](specs/001-roster-team-draw/quickstart.md).
