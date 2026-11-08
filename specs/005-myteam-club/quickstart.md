# Quickstart: MyTeam — o time do grupo

**Feature**: `005-myteam-club` | **Date**: 2026-11-07 | **Plan**: [plan.md](plan.md)

## Testes automáticos

```bash
cd backend && npm test
cd frontend && npm test && npx vite build
```

## Roteiro manual (360 px)

Com uma conta de teste nova, sem time:

1. Elenco sem time → "Você ainda não tem um time.", sem jogadores, sem "Todos presentes", "Limpar" e o
   botão de sortear; "Criar time" abre o MyTeam com o formulário e a Bola marcada.
2. "Criar time" sem nome → "Informe o nome do time.", nada criado.
3. Escolher o Escudo, digitar "Os Boleiros", "Criar time" → card com escudo, "Os Boleiros" e "Nenhum
   jogador".
4. Tocar no card → "Os Boleiros · 0", "Convocar jogador" com "Em breve" (tocar não faz nada).
5. Cadastrar jogadores → o título e, ao voltar com "← MyTeam", o card mostram o total.
6. Menu da conta → "MyTeam" abre o card.
7. Abrir `#/myteam/elenco` numa conta sem time → vai para "Criar time".
8. Presentes sem posição → "Abrir MyTeam" no aviso abre o elenco do time.
9. Recarregar cada tela mantém a tela; nada passa de 360 px de largura.
10. Conta com jogadores e sem time (jogadores gravados direto no banco) → o Elenco não mostra nenhum;
    depois de criar o time, o card mostra o total e o Elenco mostra os jogadores com a presença que
    tinham e o botão de sortear.