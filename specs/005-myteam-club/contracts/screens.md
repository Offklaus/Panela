# UI Contract: telas do MyTeam

**Feature**: `005-myteam-club` | **Date**: 2026-11-07 | **Plan**: [../plan.md](../plan.md)

Referência: quadros "MyTeam · criar time", "MyTeam · com time", "MyTeam · elenco do time", "Conta ·
menu" e "Elenco · posição pendente" do canvas. Substitui a parte do MyFUT do
[contrato da 004](../../004-account-menu-myfut/contracts/screens.md).

| Endereço | Tela | Chamadas à API ao abrir |
|----------|------|--------------------------|
| `#/myteam` | MyTeam (card ou "Criar time") | `GET /api/club`, `GET /api/roster` |
| `#/myteam/elenco` | Elenco do time | `GET /api/club`, `GET /api/roster` |

**Menu da conta**: "MyTeam" (link para `#/myteam`) no lugar de "MyFUT".

**MyTeam sem time**: "← Elenco" ("Voltar ao elenco"); `h1` "MyTeam"; "Você ainda não tem um time.
Crie o time do seu grupo para montar o elenco."; campo "Nome do time" (placeholder "Ex.: Os
Boleiros") com erro abaixo; "Ícone": grupo de 8 botões de 64 px em 4 colunas, nome acessível "Bola",
"Escudo", "Raio", "Estrela", "Coroa", "Chama", "Troféu", "Alvo", `aria-pressed`, marcado = fundo escuro
e desenho verde; erro do ícone abaixo da grade; botão "Criar time".

**MyTeam com time**: "← Elenco"; `h1` "MyTeam"; card-link para `#/myteam/elenco` com o ícone (56 px),
o nome (reticências) e "N jogadores" / "1 jogador" / "Nenhum jogador", e uma seta.

**Elenco do time**: "← MyTeam" ("Voltar ao MyTeam"); ícone (36 px) e `h1` "{nome} · N" (reticências);
botão desativado "Convocar jogador" com a etiqueta "Em breve"; formulário e lista como no MyFUT da
004. Sem time: troca o endereço por `#/myteam`.

**Elenco**: vazio com o botão "Abrir MyTeam" (`#/myteam`); aviso de posição pendente com o link "Abrir
MyTeam" (`#/myteam/elenco`). Ao abrir, chama `GET /api/club` e `GET /api/roster`.

**Elenco sem time** (quadro "Elenco · sem time"): `h1` "Elenco", sem contagem; sem "Todos presentes",
"Limpar", lista e rodapé de sortear. No lugar da lista: ícone de escudo (56 px, decorativo), "Você
ainda não tem um time.", "Crie o time no MyTeam e cadastre os jogadores. Só quem está no time aparece
aqui para o sorteio." e o botão-link "Criar time" (`#/myteam`).