# Quickstart: Elenco, presença e sorteio de times

**Feature**: `001-roster-team-draw` | **Date**: 2026-11-01 | **Plan**: [plan.md](plan.md)

Guia para subir o projeto e conferir, de ponta a ponta, que a feature funciona. Os formatos de
dados estão em [contracts/api.md](contracts/api.md) e [data-model.md](data-model.md).

## Pré-requisitos

- Node.js 22 LTS ou superior e npm.
- Opcional: um servidor SMTP. Sem ele, no desenvolvimento, o link de recuperação de senha
  aparece no log do backend.

## Subir o projeto

Backend, num terminal (porta 3000):

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Frontend, em outro terminal (porta 5173, com proxy de `/api` para o backend):

```bash
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`.

## Testes automatizados

```bash
cd backend
npm test
```

```bash
cd frontend
npm test
```

Esperado: todos passam. O backend cobre, no mínimo, cada regra do sorteio (Princípio III) e cada
endpoint com um caso de sucesso e um de erro (Princípio IV).

## Roteiro de validação manual

Cada passo remete às histórias e critérios da [spec](spec.md).

1. **Conta (US1)**
   - Criar conta com `org@exemplo.com` e senha de 8+ caracteres → cai no elenco vazio.
   - Sair e tentar entrar com senha errada 5 vezes → a 6ª tentativa avisa do bloqueio de 15 min.
   - "Esqueci a senha" → o link aparece no log; abrir, definir nova senha e entrar com ela.
   - Usar o mesmo link de novo → a tela diz que o link não vale mais.
   - Criar uma segunda conta e cadastrar um jogador → a primeira conta não o vê (SC-007).
2. **Elenco (US2)**
   - Cadastrar "Pedrinho" com 4 estrelas → aparece presente, com 4 estrelas.
   - Cadastrar " pedrinho " → recusado por nome repetido.
   - Mudar o nível para 2 e remover → elenco reflete as duas mudanças.
   - Recarregar a página → tudo continua igual (SC-008).
3. **Presença (US3)**
   - Com 12 jogadores, "Limpar" → resumo 0 / 0 / "–".
   - Marcar 7 → resumo mostra 7 presentes, 1 time e a média com vírgula.
   - "Todos presentes" → resumo atualizado.
4. **Sorteio (US4)**
   - 9 presentes → "Falta 1 jogador para fechar 2 times."
   - 11 presentes → Time A e Time B com 5 cada, 1 em "Próximos · aguardando vaga".
   - 10 presentes com 3 estrelas → "Equilíbrio perfeito".
   - 15 presentes → 3 times, coletes verde, branco e laranja, "ninguém de fora".
   - "Sortear de novo" algumas vezes → os times mudam e nenhum fica desequilibrado por uma troca.
5. **Lista alterada (US5)**
   - Depois de sortear, marcar mais um presente → aviso aparece e os times continuam.
   - Remover um jogador sorteado → ele some do time e o aviso aparece.
   - Sortear de novo → aviso some.
6. **Interface (FR-036, FR-037)**
   - Com a janela em 360 px de largura, percorrer todas as telas → sem rolagem horizontal.
   - Navegar só com o teclado (Tab, Enter, Espaço) → todos os controles funcionam.
