# UI Contract: tela Craque

**Feature**: `006-craque-profile` | **Date**: 2026-11-08 | **Plan**: [../plan.md](../plan.md)

Referência: quadros "Craque · criar perfil", "Craque · perfil", "Craque · editar perfil" e "Conta ·
menu" do canvas.

| Endereço | Tela | Chamadas à API ao abrir |
|----------|------|--------------------------|
| `#/craque` | Craque (formulário, perfil ou edição) | `GET /api/profile` |

**Menu da conta**: e-mail, "MyTeam", **"Craque"** (link para `#/craque`), "Planos" (Em breve), "Sair".

**Craque sem perfil**: "← Elenco" ("Voltar ao elenco"); `h1` "Craque"; "Monte o seu perfil de
jogador."; campo "Apelido" (placeholder "Ex.: Pedrinho"); campo "Data de nascimento" (`type="date"`,
`max` = hoje); "Posição": grupo com ATA e DEF (`aria-pressed`, nomes acessíveis "ATA (ataque)" e "DEF
(defesa)"); "Perna dominante": grupo de 3 botões em 3 colunas, Direita, Esquerda e Ambas; nada
marcado; botão "Salvar perfil" (52 px). Cada campo tem o seu erro logo abaixo, ligado por
`aria-describedby`; o campo com erro recebe o foco.

**Craque com perfil**: "← Elenco"; `h1` "Craque"; iniciais do apelido num círculo de 64 px
(decorativo); apelido (reticências) e e-mail da conta; lista `<dl>` em 3 colunas com "Posição"
(ATA/DEF), "Idade" ("N anos" / "1 ano") e "Perna" (Direita/Esquerda/Ambas); botão "Editar perfil"
(44 px).

**Craque editando**: como sem perfil, com "Edite o seu perfil de jogador.", os campos preenchidos e,
no lugar de "Salvar perfil", "Cancelar" e "Salvar" lado a lado. "Cancelar" volta ao perfil sem
mudanças; depois de salvar ou cancelar, o foco vai para "Editar perfil".
