# Quickstart: Posição dos jogadores e sorteio por posição

**Feature**: `003-player-positions` | **Date**: 2026-11-06 | **Plan**: [plan.md](plan.md)

Para instalar e subir o projeto, siga o [quickstart da 001](../001-roster-team-draw/quickstart.md).
A migração da posição roda sozinha quando o backend sobe. No Windows, se o PowerShell bloquear o
`npm`, use `npm.cmd`.

## Testes automatizados

```bash
cd backend
npm test
```

Esperado: passam os testes do balanceador com posição (divisão por igual, banco com restrição,
nenhuma troca na mesma posição melhora a diferença, posição em falta), da validação e do cadastro
com posição, do bloqueio `POSITIONS_MISSING` e dos endpoints.

```bash
cd frontend
npm test
```

Esperado: passam os testes de `positionCountText`, `positionShortageText` e `pendingPositionsText`.

## Roteiro manual (360 px)

1. **Cadastro e etiqueta (US1)**
   - Cadastrar "Pedrinho" sem posição → "Escolha a posição." abaixo da linha "Posição".
   - Marcar DEF e cadastrar → "Pedrinho" com a etiqueta DEF; DEF continua marcado no formulário.
   - Tocar na etiqueta → passa a ATA; de novo → DEF.
   - Numa conta com jogadores antigos → eles aparecem "Sem posição"; um toque → ATA.
2. **Sorteio (US2)**
   - 10 presentes, 6 ATA e 4 DEF → cada time "3 ATA · 2 DEF"; "Sortear de novo" várias vezes mantém
     a divisão.
   - Cada jogador dos times e do banco mostra a posição.
   - Mudar a posição de alguém depois do sorteio → aviso de lista alterada na tela de times.
3. **Bloqueio e falta (US3)**
   - 11 presentes, 2 sem posição → "Defina a posição de 2 presentes para sortear."; definir uma →
     o aviso some.
   - 10 presentes, 9 ATA e 1 DEF → times formados e "Só 1 defensor para 2 times.".
   - 11 presentes, 2 DEF e 9 ATA → sortear várias vezes: o banco é sempre um atacante.
4. **Interface**
   - Sem rolagem horizontal em 360 px; etiquetas e botões de posição com 44 px; Tab alcança tudo.
