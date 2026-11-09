# Quickstart: Craque — o perfil de jogador da conta

**Feature**: `006-craque-profile` | **Date**: 2026-11-08 | **Plan**: [plan.md](plan.md)

## Testes automáticos

```bash
cd backend && npm test
cd frontend && npm test && npx vite build
```

## Roteiro manual (360 px)

Com uma conta de teste nova, sem perfil:

1. Menu da conta → "Craque" aparece abaixo de "MyTeam" e abre o formulário, sem nada marcado.
2. "Salvar perfil" vazio → "Informe o apelido." com o foco no campo; preencher o apelido e salvar →
   erro da data; e assim por diante, campo a campo. Nada é gravado.
3. Data no futuro → "A data de nascimento não pode ser no futuro.".
4. "Pedrinho", 12/04/1998, ATA, Direita → perfil com "PE", "Pedrinho", o e-mail, ATA, "28 anos" e
   Direita.
5. "Editar perfil" → formulário preenchido; trocar a perna para "Ambas" e "Salvar" → perfil com Ambas.
6. "Editar perfil", mudar o apelido e "Cancelar" → perfil sem mudanças.
7. Apelido de 40 caracteres → cortado com reticências, sem rolagem horizontal.
8. Recarregar mantém a tela; "← Elenco" volta ao Elenco.
