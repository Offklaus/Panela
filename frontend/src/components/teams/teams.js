import { swapIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';
import { missingPlayersText, starsText } from '../../utils/format.js';
import { teamCard } from './teamCard.js';

// FR-029: linha de status do sorteio.
function statusLine(draw) {
  if (!draw) return 'Marque quem veio e toque em Montar times.';
  if (draw.teams.length === 0) return missingPlayersText(draw.missingPlayers);
  const base = `${draw.teams.length} times de ${draw.teamSize}`;
  return draw.bench.length > 0 ? `${base} · ${draw.bench.length} aguardando` : `${base} · ninguém de fora`;
}

function emptyState(title, text) {
  return h('div', { class: 'teams-empty' }, h('div', { class: 'teams-empty-title' }, title), h('p', {}, text));
}

function content(draw) {
  if (!draw) return [emptyState('Nenhum sorteio ainda', 'Os times aparecem aqui depois do sorteio.')];
  if (draw.teams.length === 0) {
    return [emptyState('Jogadores insuficientes', 'Marque mais jogadores como presentes e sorteie de novo.')];
  }
  return [
    h(
      'div',
      { class: 'balance' },
      h('span', { class: 'balance-tag' }, draw.difference === 0 ? 'Equilíbrio perfeito' : `Diferença de ${starsText(draw.difference)}`),
      h('span', {}, 'entre o time mais forte e o mais fraco'),
    ),
    h('div', { class: 'team-grid' }, draw.teams.map(teamCard)),
  ];
}

export function createTeams({ onDraw, footer }) {
  const subtitle = h('p', { class: 'teams-subtitle' });
  const buttonLabel = h('span', {});
  const button = h('button', { type: 'button', class: 'draw-button', onClick: handleDraw }, swapIcon(), buttonLabel);
  const stale = h(
    'p',
    { class: 'stale-warning', role: 'status', hidden: true },
    'A lista mudou depois do sorteio. Toque em ',
    h('strong', {}, 'Sortear de novo'),
    ' para atualizar os times.',
  );
  const body = h('div', { class: 'teams-body' });

  async function handleDraw() {
    button.disabled = true;
    try {
      await onDraw();
    } finally {
      button.disabled = false;
    }
  }

  const el = h(
    'section',
    { class: 'card teams-card on-dark', 'aria-labelledby': 'teams-title' },
    h(
      'div',
      { class: 'teams-header' },
      h('div', {}, h('h2', { id: 'teams-title', class: 'display teams-title' }, 'Times da rodada'), subtitle),
      button,
    ),
    stale,
    body,
    footer,
  );

  return {
    el,
    update(state) {
      const { draw } = state;
      buttonLabel.textContent = draw ? 'Sortear de novo' : 'Montar times';
      subtitle.textContent = statusLine(draw);
      stale.hidden = !draw?.stale;
      body.replaceChildren(...content(draw));
    },
  };
}
