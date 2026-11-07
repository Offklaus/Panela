# UI Contract: menu da conta, MyFUT e Elenco

**Feature**: `004-account-menu-myfut` | **Date**: 2026-11-07 | **Plan**: [../plan.md](../plan.md)

Referência: quadros "Elenco · celular", "Elenco · faltam jogadores", "Elenco · posição pendente",
"MyFUT · celular" e "Conta · menu" do canvas. A API não muda.

| Endereço | Tela | Chamadas à API ao abrir |
|----------|------|--------------------------|
| `#/` | Elenco | `GET /api/roster` |
| `#/myfut` | MyFUT | `GET /api/roster` |
| `#/times` | Times | `GET /api/draw` (sem mudança) |

**Cabeçalho do Elenco**: marca e botão da conta (44 px, "Conta"). Menu: e-mail da conta; "MyFUT";
"Planos" desativado com "Em breve"; "Sair".

**MyFUT**: "← Elenco" ("Voltar ao elenco"); `h1` "MyFUT · N"; formulário (nome, "Adicionar",
nível, posição); cada jogador em duas linhas: iniciais, nome, etiqueta de posição (botão) e
remover; estrelas de nível. Lista vazia: "Nenhum jogador ainda. Adicione o primeiro acima."

**Elenco**: `h1` "Elenco · N", "Todos presentes", "Limpar"; cada jogador numa linha: iniciais, nome,
etiqueta de posição só para leitura ("ATA", "DEF" ou "—", nome acessível "Posição: …"), "★ N"
("Nível N de 5") e presença. Vazio: "Nenhum jogador ainda." e link "Abrir MyFUT". Aviso de posição
pendente com link "Abrir MyFUT".