# Quickstart: Menu da conta e tela MyFUT

**Feature**: `004-account-menu-myfut` | **Date**: 2026-11-07 | **Plan**: [plan.md](plan.md)

Subir o projeto como no [quickstart da 001](../001-roster-team-draw/quickstart.md); rodar `npm test`
em `backend/` e `frontend/` (tudo deve passar).

Roteiro em 360 px:

1. **Menu (US1)**: tocar no ícone da conta → e-mail, MyFUT, Planos "Em breve", Sair; tocar fora e
   Esc fecham; "Planos" não faz nada; "Sair" leva a "Entrar".
2. **MyFUT (US2)**: menu → MyFUT; cadastrar com nível e posição; trocar posição e nível; remover;
   "← Elenco" volta e mostra as mudanças; recarregar no MyFUT mantém a tela.
3. **Elenco (US3)**: uma linha por jogador, sem formulário; elenco vazio mostra "Abrir MyFUT";
   presentes sem posição → aviso com "Abrir MyFUT".
4. **Interface**: sem rolagem horizontal; Tab alcança o menu e suas opções; Esc devolve o foco ao
   ícone.