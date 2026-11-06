# Research: Elenco, presença e sorteio de times

**Feature**: `001-roster-team-draw` | **Date**: 2026-11-01 | **Plan**: [plan.md](plan.md)

Decisões técnicas que resolvem as incógnitas do Technical Context. Cada item traz a decisão, o
motivo e as alternativas descartadas.

## 1. Banco de dados (resolve TODO(DATABASE) da constituição)

- **Decisão** (revista em 2026-11-02, substitui o SQLite): PostgreSQL 17, acessado com `pg`. No
  desenvolvimento, o Postgres local (banco `panela_dev`, criado com `npm run db:create`). Em
  produção, o Supabase, usado só como banco: o login continua no backend (Princípio II).
- **Motivo**: o projeto vai rodar no Supabase, e desenvolver na mesma versão do mesmo banco evita
  diferenças de comportamento. A hospedagem também deixa de precisar de disco persistente.
- **Consequência**: com conexões simultâneas, as alterações de um mesmo elenco e o sorteio
  travam a linha do organizador (`SELECT ... FOR UPDATE`), para o limite de jogadores, o nome
  repetido e o aviso de lista alterada valerem com pedidos simultâneos. Todas as tabelas têm RLS
  ligado sem políticas, porque o Supabase expõe o schema `public` numa API pública.
- **Alternativas**: SQLite (decisão original) exigiria disco persistente e uma nova migração para
  ir ao Supabase. Supabase Auth prenderia o login a um fornecedor e tiraria a regra do backend.

## 2. Migrações

- **Decisão**: arquivos SQL numerados em `backend/src/database/migrations/`, aplicados na subida
  do servidor numa única transação, com trava para instâncias simultâneas, e registrados na tabela
  `schema_migrations`.
- **Alternativas**: knex, umzug ou similar: dependência sem ganho para poucas tabelas.

## 3. Hash de senha (FR-008)

- **Decisão**: `crypto.scrypt` nativo do Node com os parâmetros mínimos da OWASP (N=2^17, r=8,
  p=1, `maxmem` de 256 MiB), salt aleatório de 16 bytes e comparação com `timingSafeEqual`.
  Formato guardado: `scrypt$N$r$p$<salt base64>$<hash base64>`.
- **Alternativas**: bcrypt ou argon2id exigem módulos nativos extras. A OWASP prefere argon2id,
  mas aceita scrypt, que já vem no Node.

## 4. Sessão (FR-004, FR-005)

- **Decisão**: cookie `sid` com token aleatório de 32 bytes; no banco fica só o SHA-256 do token.
  Validade de 30 dias; atributos `HttpOnly`, `SameSite=Lax` e `Secure` em produção. "Sair" apaga
  a sessão no banco e o cookie.
- **Alternativas**: JWT dificulta revogar no "Sair" e, guardado em `localStorage`, fica exposto
  a XSS e contraria o Princípio II. `express-session` precisaria de um store extra.

## 5. Proteção contra CSRF

- **Decisão**: `SameSite=Lax` mais a exigência de `Content-Type: application/json` em toda
  requisição que altera dados. O servidor não habilita CORS, então outro site não consegue
  enviar JSON com o cookie.
- **Alternativas**: token CSRF é redundante com origem única mais `SameSite`.

## 6. Bloqueio de login (FR-002, FR-003)

- **Decisão**: tabela `login_throttle` por e-mail normalizado, inclusive para e-mails sem conta,
  para não revelar quais existem. 5 falhas seguidas bloqueiam por 15 minutos; um login certo zera
  o contador. Durante o bloqueio, a resposta é 429 com `retryAfterSeconds`.
- **Alternativas**: limite por IP (`express-rate-limit`) não atende o "mesmo e-mail" do FR-003.

## 7. Recuperação de senha (FR-006)

- **Decisão**: token aleatório de 32 bytes, guardado como SHA-256, válido por 1 hora e uma única
  vez (`used_at`). Ao definir a nova senha, todas as sessões do organizador são encerradas.
  O pedido sempre responde 202, com ou sem conta. No máximo 3 e-mails por conta por hora; além
  disso, o pedido é aceito em silêncio e nada é enviado. Link: `<APP_URL>/#/nova-senha?token=...`.

## 8. Envio de e-mail

- **Decisão**: `nodemailer` com SMTP configurado por variáveis de ambiente (`SMTP_HOST`,
  `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`). Sem SMTP no desenvolvimento, o link sai no
  log do servidor. Em produção (`NODE_ENV=production`), o servidor não sobe sem SMTP.
- **Alternativas**: API HTTP de um provedor específico (Resend, SendGrid) prende a um fornecedor.

## 9. Algoritmo do sorteio (FR-019 a FR-025)

- **Decisão**, em três passos, com `rng` injetado (Princípio III):
  1. **Banco**: embaralhar os presentes (Fisher–Yates) e separar os `n mod 5` primeiros. Cada
     presente tem a mesma chance de ficar de fora (FR-021).
  2. **Divisão inicial**: ordenar os demais por nível decrescente, com empates em ordem
     aleatória. Cada jogador vai para o time ainda incompleto de menor total (empate: menos
     jogadores, depois aleatório).
  3. **Refinamento**: enquanto existir uma troca de um jogador `a` do time X por um jogador `b`
     do time Y que diminua a diferença entre eles (`|D − 2(a − b)| < |D|`, com `D = total X −
     total Y`), aplicar a troca. O laço termina porque cada troca reduz estritamente a soma dos
     quadrados dos totais. O resultado atende ao FR-024 por construção.
- **Aleatoriedade**: `rng: () => number` em [0, 1). Produção usa `Math.random`; os testes usam um
  gerador com semente (mulberry32), o que deixa o resultado determinístico.
- **Custo**: no máximo 20 times de 5; poucas iterações, muito abaixo dos 2 s do SC-006.
- **Alternativas**: força bruta (ótimo global) fica inviável a partir de 4 times. Só o guloso
  (passo 2) não garante o FR-024.

## 10. Sorteio guardado e aviso de lista alterada (FR-031 a FR-034)

- **Decisão**: um registro por organizador, substituído a cada sorteio, com os ids dos jogadores
  de cada time e do banco e a flag `stale`. Toda alteração no elenco liga `stale`. Na leitura,
  nome e nível vêm do elenco atual e jogadores removidos são omitidos (FR-032).
- **Alternativas**: congelar nome e nível no sorteio manteria jogadores removidos na tela,
  contrariando o FR-032.

## 11. Regras de negócio no backend (Princípio II)

- **Decisão**: o backend calcula e devolve, em toda resposta do elenco, `presentCount`,
  `possibleTeams` e `averageRating`. `TEAM_SIZE` fica só em `backend/src/config/domain.js`. O
  frontend apenas formata (uma casa decimal, vírgula).

## 12. Validação de entrada

- **Decisão**: validadores escritos à mão em `validators/`. São cerca de 6 payloads.
- **Alternativas**: zod ou joi: dependência sem ganho nesse tamanho.

## 13. Testes (Princípio IV)

- **Decisão**: `node:test` e `node:assert` nos dois projetos. Os testes de integração sobem o app
  numa porta efêmera e usam o `fetch` nativo. No backend, `tests/run.js` sobe um Postgres embutido
  (`embedded-postgres`), real e descartável, e cada arquivo de teste usa um banco próprio.
- **Alternativas**: Jest, Vitest e supertest são dependências evitáveis. `pg-mem` é só um emulador
  e não reproduz transações e travas. Docker não está disponível em todas as máquinas.

## 14. Frontend em JavaScript puro (Princípio VI)

- **Decisão**: Vite só como servidor de desenvolvimento e empacotador. O DOM é montado com um
  helper `h()` em `utils/dom.js` usando `createElement` e `textContent`; dado do usuário nunca
  passa por `innerHTML`, o que evita XSS. Um store simples com assinantes fica em `state/`.
  As rotas usam hash (`#/entrar`, `#/criar-conta`, `#/esqueci-senha`, `#/nova-senha`, `#/`) em
  `src/router.js`.
- **Alternativas**: framework de UI é vetado pelo Princípio VI; lit-html seria dependência.

## 15. Origem única

- **Decisão**: o cookie de sessão exige frontend e API na mesma origem. No desenvolvimento, o
  proxy do Vite manda `/api` para `http://localhost:3000`. Em produção, o Express serve
  `frontend/dist` quando `FRONTEND_DIST_DIR` está definida (ou um proxy reverso faz isso).
  Não há CORS.

## 16. Cabeçalhos de segurança e fontes

- **Decisão**: `helmet` com a CSP padrão. As fontes Barlow e Barlow Condensed ficam hospedadas
  em `frontend/src/assets/fonts/` (woff2), sem Google Fonts, o que mantém a CSP restrita.

## 17. Configuração

- **Decisão**: `node --env-file=.env`, nativo no Node 22, sem `dotenv`. `.env` e `.env.example`
  ficam fora do repositório; as variáveis estão listadas no README. O `npm start` usa
  `--env-file-if-exists` (Node 22.9 ou superior), porque em produção elas podem vir do ambiente.

## 18. Express 5

- **Decisão**: Express 5. Erros lançados em handlers `async` chegam direto ao `errorHandler`, sem
  wrapper.

## Dependências (justificativa exigida pelo Princípio VI)

| Projeto | Pacote | Por quê |
|---------|--------|---------|
| backend | `express` | Exigido pela constituição |
| backend | `pg` | Banco (item 1) |
| backend (dev) | `embedded-postgres` | Postgres real nos testes, sem Docker (item 13) |
| backend | `nodemailer` | E-mail de recuperação de senha (item 8) |
| backend | `helmet` | Cabeçalhos de segurança (item 16) |
| backend | `cookie-parser` | Leitura do cookie de sessão, mantido pelo time do Express |
| frontend | `vite` (dev) | Exigido pela constituição |

Testes não adicionam dependências.
