# API and UI Contract: posição dos jogadores

**Feature**: `003-player-positions` | **Date**: 2026-11-06 | **Plan**: [../plan.md](../plan.md)

Mudanças sobre o [contrato da API da 001](../../001-roster-team-draw/contracts/api.md) e o
[contrato das telas da 002](../../002-mobile-screens/contracts/screens.md). O que não aparece aqui
continua igual.

## Tipos

```text
Position    "ATA" | "DEF"
Player      { id, name, rating: 1..5, present: boolean, position: Position | null }
PlayerRef   { id, name, rating: 1..5, position: Position }
Team        { letter, vest, players: PlayerRef[], total, average, positions: { ATA: number, DEF: number } }
Draw        { ..., positionShortage: null | { position: Position, count: number, teams: number } }
```

- `Player.position` é `null` só para jogadores cadastrados antes desta feature.
- `Draw.positionShortage` aparece quando uma posição tem menos jogadores do que times entre os que
  estão nos times (FR-017).

## Erros novos

| Código | HTTP | Quando |
|--------|------|--------|
| `POSITIONS_MISSING` | 409 | Sorteio com 10 ou mais presentes e algum presente sem posição (FR-007) |

```json
{
  "error": {
    "code": "POSITIONS_MISSING",
    "message": "Defina a posição de 2 presentes para sortear.",
    "missingPositions": 2
  }
}
```

## Endpoints alterados

| Método e rota | Corpo | Mudança |
|---------------|-------|---------|
| `POST /api/players` 🔒 | `{ name, rating, position }` | `position` obrigatória; sem ela ou inválida: `400 VALIDATION_ERROR`, `field: "position"`, "Escolha a posição." |
| `PATCH /api/players/:id` 🔒 | `{ rating?, present?, position? }` (ao menos um) | aceita `position` (ATA ou DEF); marca o sorteio como desatualizado |
| `POST /api/draw` 🔒 | `{}` | pode responder `409 POSITIONS_MISSING`; nesse caso o último sorteio não muda |

Exemplo de time com posições:

```json
{ "letter": "A", "vest": "green", "total": 18, "average": 3.6,
  "positions": { "ATA": 3, "DEF": 2 },
  "players": [ { "id": 1, "name": "Jogador 01", "rating": 5, "position": "ATA" } ] }
```

## Telas

Referência: quadros "Elenco · celular", "Elenco · faltam jogadores", "Elenco · posição pendente",
"Times · celular" e "Times · falta de posição" do canvas.

**Elenco**

- Formulário: depois de "Nível", a linha "Posição" com dois botões, "ATA" (nome acessível "ATA
  (ataque)") e "DEF" ("DEF (defesa)"), com `aria-pressed`. Sem nada marcado ao abrir; mantém a
  última posição depois de um cadastro. O erro de posição aparece logo abaixo dessa linha.
- Cada jogador: botão de 44 × 44 px com a etiqueta "ATA" (preenchida), "DEF" (contorno) ou "Sem
  posição" (tracejada), entre o nome e o "Remover"; nome acessível "Posição de {nome}: ATA
  (ataque)", "… DEF (defesa)" ou "… sem posição".
- Rodapé: o aviso `role="status"` também pode ser "Defina a posição de 1 presente para sortear." ou
  "Defina a posição de N presentes para sortear.".

**Times**

- Cada time: "{ATA} ATA · {DEF} DEF" abaixo do nome; cada jogador com a etiqueta "ATA" ou "DEF"
  antes das estrelas.
- Banco: cada jogador com a posição.
- Aviso `role="status"` quando houver `positionShortage`: "Nenhum defensor para N times.", "Só 1
  defensor para N times." ou "Só K defensores para N times." (e o mesmo com atacante e atacantes).
