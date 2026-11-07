# Implementation Plan: Menu da conta e tela MyFUT

**Branch**: `004-account-menu-myfut` | **Date**: 2026-11-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-account-menu-myfut/spec.md`

## Summary

O "Sair" do Elenco vira o ícone da conta com um menu (e-mail, MyFUT, Planos "Em breve", Sair). O
cadastro e a edição dos jogadores saem do Elenco para a tela nova MyFUT (`#/myfut`); o Elenco fica
com uma linha só leitura por jogador e a presença ([research.md](research.md)). Só o frontend muda.

## Technical Context

**Language/Version**: JavaScript puro (ES2022) no navegador. **Primary Dependencies**: nenhuma nova
(Vite). **Storage**: nenhum novo. **Testing**: suítes atuais + roteiro manual. **Target Platform**:
navegadores atuais a partir de 360 px. **Project Type**: web; esta feature mexe só no frontend.
**Constraints**: 44 px, pt-BR, sem rolagem horizontal, teclado. **Scale/Scope**: 1 rota nova, 3
componentes novos.

## Constitution Check

| Princípio | Como o plano atende | Antes | Depois |
|-----------|---------------------|-------|--------|
| I. Separados | Só frontend; API inalterada | ✅ | ✅ |
| II. Backend fonte da verdade | Cadastro e regras continuam na API; telas só mostram | ✅ | ✅ |
| III. Sorteio | Sem mudança | ✅ | ✅ |
| IV. Testes | Sem regra nova; suítes atuais + roteiro manual da parte visual | ✅ | ✅ |
| V. Interface | Quadros desenhados e aprovados no canvas antes do código | ✅ | ✅ |
| VI. Simplicidade | Sem dependência nova; pasta nova `components/myfut/` registrada abaixo | ✅ | ✅ |

**Resultado**: aprovado, sem violações.

## Project Structure

```text
frontend/src/
├── main.js                              # ~ rota '/myfut'
├── rosterView.js                        # ~ só presença e sorteio; link para o MyFUT
├── myfutView.js                         # + tela MyFUT (fluxo de salvar que saiu do Elenco)
├── components/
│   ├── header/header.js                 # ~ ícone da conta no lugar do "Sair"
│   ├── header/accountMenu.js            # + menu da conta
│   ├── myfut/myfut.js, myfutRow.js      # + cartão e linha editável do MyFUT
│   ├── roster/roster.js, rosterRow.js   # ~ linha só leitura; vazio com "Abrir MyFUT"
│   └── draw-bar/drawBar.js              # ~ link opcional no aviso
└── styles/base.css, roster.css          # ~ menu; linha do Elenco; linha do MyFUT
```

## Complexity Tracking

| Pasta nova | Por que | Alternativa descartada porque |
|------------|---------|-------------------------------|
| `frontend/src/components/myfut/` | Componentes da tela MyFUT | Em `roster/` misturaria a tela do dia do jogo com a de gestão |