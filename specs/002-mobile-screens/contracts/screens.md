# UI Contract: telas Elenco e Times

**Feature**: `002-mobile-screens` | **Date**: 2026-11-05 | **Plan**: [../plan.md](../plan.md)

Contrato das duas telas: endereço, o que cada uma mostra, os textos exatos e os nomes acessíveis.
A referência visual são os quadros "Elenco · celular", "Elenco · faltam jogadores" e
"Times · celular" do canvas Times de Society. A API não muda
([contrato da 001](../../001-roster-team-draw/contracts/api.md)).

## Rotas

| Endereço | Tela | Precisa de sessão | Chamadas à API ao abrir |
|----------|------|-------------------|--------------------------|
| `#/` | Elenco | sim | `GET /api/roster`, `GET /api/draw` |
| `#/times` | Times | sim | `GET /api/draw` |

Rotas desconhecidas continuam levando a `#/`; sem sessão, as duas levam a `#/entrar`.

## Elenco (`#/`)

De cima para baixo:

1. **Cabeçalho**: marca "Times de Society" e o botão "Sair". Sem os quadros "Presentes", "Times" e
   "Média".
2. **Cartão do elenco**: título `h1` "Elenco · N" (N = total de jogadores), botões "Todos presentes"
   e "Limpar", formulário de novo jogador e lista, como na feature 001.
   - Formulário: rótulo "Novo jogador"; campo "Nome ou apelido" e botão "Adicionar" na mesma linha;
     mensagem de erro; linha "Nível" com as estrelas, com o nível inicial vindo de
     `rules.defaultRating`.
   - Cada jogador: linha 1 com iniciais, nome e "Remover {nome}"; linha 2 com as estrelas
     ("{nome}: N estrelas") e o botão de presença ("Presente" ou "Ausente", com `aria-pressed`).
3. **Rodapé fixo**, nesta ordem:
   - aviso `role="status"`, só quando `shortfall` tiver valor: "Falta 1 jogador para fechar
     {minTeams} times." ou "Faltam {N} jogadores para fechar {minTeams} times.";
   - botão "Sortear times · {presentCountText}", por exemplo "Sortear times · 11 presentes";
   - link "Ver últimos times", só quando `hasTeams(draw)`.

## Times (`#/times`)

1. **Cabeçalho**: botão "← Elenco", com nome acessível "Voltar ao elenco".
2. **Conteúdo**, em fundo escuro: título `h1` "Times da rodada"; linha de status ("N times de 5 ·
   K aguardando" ou "N times de 5 · ninguém de fora"); aviso de lista alterada quando
   `draw.stale`; etiqueta de equilíbrio; cartões dos times; "Próximos · aguardando vaga" quando
   houver banco. As regras de exibição são as da feature 001 (FR-026 a FR-029).
3. **Rodapé fixo**: botão "Sortear de novo".

## Comportamentos comuns

- Enquanto um sorteio estiver em andamento, o botão de sortear fica `disabled`.
- Falha ao salvar ou ao sortear: aviso global no topo da tela; a tela e os dados exibidos não
  mudam.
- Ao abrir uma tela, o foco vai para o `h1` dela.
- Em telas largas, o conteúdo fica numa coluna centralizada de até 640 px.
- Alvos de toque: estrelas, presença, remover, "Sair", "← Elenco" e botões do rodapé com pelo menos
  44 × 44 px.
