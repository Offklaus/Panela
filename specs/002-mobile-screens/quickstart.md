# Quickstart: Telas de celular para Elenco e Times

**Feature**: `002-mobile-screens` | **Date**: 2026-11-05 | **Plan**: [plan.md](plan.md)

Como subir e conferir a feature. Para instalar e criar o banco, siga o
[quickstart da 001](../001-roster-team-draw/quickstart.md). No Windows, se o PowerShell bloquear o
`npm`, use `npm.cmd`.

## Testes automatizados

```bash
cd frontend
npm test
```

Esperado: passam os testes de `format` (inclui `presentCountText`), `screens` (`hasTeams` e
`routeAfterDraw`), `rules`, `store` e `vests`. O backend não muda, mas a suíte dele deve continuar
passando:

```bash
cd backend
npm test
```

## Roteiro manual

Com backend e frontend rodando, abrir `http://localhost:5173` numa janela de 360 px de largura
(no navegador, modo de dispositivo) e entrar numa conta com pelo menos 12 jogadores.

1. **Elenco (US1)**
   - Ao entrar, aparece o Elenco, sem os quadros "Presentes", "Times" e "Média".
   - Rolar até o fim da lista: o botão "Sortear times" fica visível o tempo todo e o último jogador
     aparece inteiro.
   - Com 11 presentes, o botão diz "Sortear times · 11 presentes"; marcar mais um muda para 12.
   - Nenhuma rolagem horizontal; estrelas e presença com toque de 44 px.
2. **Times (US2)**
   - Com 11 presentes, tocar em "Sortear times": abre "Times da rodada" com 2 times e 1 aguardando.
   - "Sortear de novo": os times mudam e a tela continua a de times.
   - Recarregar a página: continua na tela de times.
   - "← Elenco": volta ao Elenco, no mesmo ponto da lista. Sortear de novo e usar o voltar do
     navegador: também volta ao Elenco, e um segundo voltar não reabre os times.
3. **Faltando jogadores (US3)**
   - Com 9 presentes, tocar em "Sortear times": continua no Elenco, com "Falta 1 jogador para fechar
     2 times." acima do botão.
   - Marcar mais um presente: o aviso some.
   - Na tela de times, deixar só 9 presentes pelo Elenco, voltar aos times e tocar em "Sortear de
     novo": o app volta ao Elenco com o aviso.
4. **Últimos times (US4)**
   - Depois de um sorteio com times, voltar ao Elenco e recarregar: aparece "Ver últimos times", que
     abre os mesmos times.
   - Mudar a presença de alguém e abrir "Ver últimos times": aparece o aviso de lista alterada.
   - Abrir `http://localhost:5173/#/times` numa conta sem sorteio: o app leva ao Elenco.
5. **Computador**
   - Em janela larga, as duas telas aparecem numa coluna centralizada.
6. **Teclado**
   - Navegar com Tab pelas duas telas: o foco alcança os botões do rodapé e o "← Elenco", sempre
     visível.
