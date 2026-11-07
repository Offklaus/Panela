# Research: Menu da conta e tela MyFUT

**Feature**: `004-account-menu-myfut` | **Date**: 2026-11-07 | **Plan**: [plan.md](plan.md)

Só o frontend muda; a API já tem tudo de que o MyFUT precisa (`/roster`, `/players`).

## 1. Menu da conta

- **Decisão**: componente `components/header/accountMenu.js` no padrão "disclosure": um botão de
  44 px (`aria-haspopup`, `aria-expanded`, nome acessível "Conta") que mostra um painel com o
  e-mail, o link "MyFUT" (`#/myfut`), "Planos" (`<button disabled>` com "Em breve") e "Sair". Fecha
  ao tocar fora (ouvinte de `pointerdown` no documento), com Esc e ao escolher uma opção; com Esc ou
  toque fora, o foco volta ao botão (FR-005).
- **Alternativa descartada**: `role="menu"` do ARIA, que exige navegação por setas; o disclosure
  funciona com Tab e é mais simples (Princípio VI).
- O painel fica `position: absolute` dentro do cabeçalho, que já é `sticky`; assim acompanha a
  rolagem.

## 2. Tela MyFUT

- **Decisão**: rota `#/myfut` no roteador atual, view `myfutView.js` com `createBackHeader` ("←
  Elenco", volta com `goBackTo('/')`), o formulário de novo jogador e a lista editável. O fluxo de
  salvar (cadastrar, nível, posição, remover) sai do `rosterView.js` e vai para o `myfutView.js`.
- Componentes novos em `components/myfut/`: `myfut.js` (cartão com título, formulário e lista) e
  `myfutRow.js` (a linha de duas linhas que hoje é o `rosterRow.js`, sem a presença).

## 3. Elenco só para leitura

- **Decisão**: `rosterRow.js` vira uma linha só: iniciais, nome, etiqueta pequena de posição
  ("ATA", "DEF" ou "—"), "★ N" e o botão de presença. `roster.js` perde o formulário e ganha o
  estado vazio com o link "Abrir MyFUT".
- O aviso de posição pendente ganha o link "Abrir MyFUT": o `drawBar` aceita um link opcional no
  aviso (`noticeLink`).

## 4. Testes

- Não há lógica pura nova em `utils/` ou `state/`; a verificação é manual, pelo
  [quickstart.md](quickstart.md), como pede o Princípio IV para a parte visual. As suítes atuais
  continuam passando.

## Dependências

Nenhuma nova.