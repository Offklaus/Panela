# Research: Craque — o perfil de jogador da conta

**Feature**: `006-craque-profile` | **Date**: 2026-11-08 | **Plan**: [plan.md](plan.md)

## 1. Nome no código: `profile`

- **Decision**: o Craque se chama `profile` no código (tabela `profiles`, rota `/api/profile`,
  `profileService`); na tela continua "Craque".
- **Rationale**: "player" já nomeia os jogadores do elenco; "profile" deixa claro que é o perfil da
  própria conta.
- **Alternatives considered**: `craque` (palavra da tela, estranha no código em inglês);
  `playerProfile` (longo sem ganho).

## 2. Um perfil por conta, salvo com PUT

- **Decision**: `profiles.organizer_id` é a chave primária. `PUT /api/profile` grava com `INSERT …
  ON CONFLICT (organizer_id) DO UPDATE` e devolve o perfil; serve para criar e para editar.
- **Rationale**: o banco garante FR-001 mesmo com toques repetidos ou duas abas, e o último salvo
  vale (edge case da spec). Uma rota só para criar e editar, porque o perfil sempre é enviado
  inteiro.
- **Alternatives considered**: `POST` + `PATCH` (duas rotas e um erro de "já existe" sem valor para
  quem usa); `SELECT` antes do `INSERT` (corrida entre dois pedidos).

## 3. Data de nascimento e idade

- **Decision**: a coluna é `DATE`; a API recebe e devolve `birthDate` como texto `YYYY-MM-DD` (o
  model lê `to_char(birth_date, 'YYYY-MM-DD')`, para o `pg` não converter em `Date` no fuso do
  servidor). A idade
  (`age`) é calculada no serviço a cada leitura, pela data de hoje em `America/Sao_Paulo`
  (`APP_TIME_ZONE`), com `Intl.DateTimeFormat`. Quem nasceu em 29/02 faz aniversário em 1º/03 nos
  anos não bissextos (a idade só sobe quando o mês e o dia de hoje passam de 02-29).
- **Rationale**: Princípio II; a idade fica certa todo dia sem tarefa agendada (FR-005, SC-003); o
  fuso fixo evita que a idade mude às 21h na véspera do aniversário, como aconteceria em UTC.
- **Alternatives considered**: guardar a idade (fica velha); calcular no frontend (regra fora do
  backend); calcular no SQL com `age()` (depende do fuso da sessão do banco).

## 4. Validação

- **Decision**: `profileValidator.js` recebe o corpo e a data de hoje e valida, nesta ordem, com
  `field` em cada erro:
  - `nickname`: obrigatório, espaços das pontas removidos, até `NICKNAME_MAX_LENGTH` (40): "Informe o
    apelido." / "O apelido pode ter no máximo 40 caracteres.";
  - `birthDate`: "Informe a data de nascimento." (vazio), "Data de nascimento inválida." (fora do
    formato ou dia que não existe), "A data de nascimento não pode ser no futuro.", "Confira a data:
    a idade precisa ficar entre 5 e 100 anos." (`PROFILE_MIN_AGE`, `PROFILE_MAX_AGE`, inclusive);
  - `position`: `validatePosition` do jogador ("Escolha a posição.");
  - `foot`: um de `DOMINANT_FEET` (`right`, `left`, `both`): "Escolha a perna dominante.".
- **Rationale**: o formato de erro único da API traz um campo por vez; a tela mostra o erro junto do
  campo e põe o foco nele, como nos formulários de jogador e de time (FR-009).
- **Alternatives considered**: devolver todos os erros de uma vez (mudaria o formato único da API
  para uma tela só); validar no frontend também (duas cópias das mensagens).

## 5. Pernas nas regras

- **Decision**: `GET /api/rules` devolve `dominantFeet: ["right", "left", "both"]`; os nomes em pt-BR
  (Direita, Esquerda, Ambas) ficam em `footText` no `utils/format.js` do frontend.
- **Rationale**: o backend decide quais valores valem; o texto é apresentação, como os ícones do time.

## 6. Tela e estado

- **Decision**: rota `#/craque` com `craqueView.js`. `profile` no store, com `undefined` = ainda não
  lido e `null` = sem perfil; sair volta a `undefined`. A tela tem três modos: `form` (sem perfil),
  `card` e `edit`. Só troca o conteúdo quando o modo muda, para não apagar o que foi digitado. Depois
  de salvar ou cancelar, o foco vai para "Editar perfil".
- **Rationale**: mesmo padrão do MyTeam (research §6 e §7 da 005).

## 7. Componentes

- **Decision**: `components/craque/profileForm.js` monta o formulário (campo de texto, `input
  type="date"` com `max` = hoje no aparelho, grupo ATA/DEF com as classes `position-option` do
  formulário de jogador e grupo de 3 pernas) nos modos criar ("Salvar perfil") e editar ("Cancelar"
  e "Salvar"). `components/craque/profileCard.js` mostra as iniciais (`initials` do `format.js`), o
  apelido, o e-mail da conta e um `<dl>` com Posição, Idade (`ageText`) e Perna (`footText`).
- **Rationale**: o `max` do campo de data só ajuda o calendário do celular; quem barra a data é o
  backend.

## 8. Testes

- **Decision**: backend com `unit/dates.test.js` (data no fuso de Brasília, datas válidas e
  inválidas, idade na véspera e no dia do aniversário, 29/02), `unit/profileService.test.js` (sem
  perfil, salvar, cada erro, limites de idade, substituir, erro sem mudar nada, isolamento, idade
  muda no aniversário) e `integration/profile.test.js` (401, 200 com `null`, 200 ao salvar, 400 com
  `field`, isolamento); o teste de regras confere `dominantFeet`. No frontend, `ageText` e
  `footText` em `format.test.js`.
- **Rationale**: Princípio IV; as telas são conferidas pelo [quickstart.md](quickstart.md).
