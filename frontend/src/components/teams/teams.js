import { h } from '../../utils/dom.js';
import { starsText } from '../../utils/format.js';
import { hasTeams } from '../../utils/screens.js';
import { teamCard } from './teamCard.js';

// FR-029 da 001: linha de status do sorteio.
function statusLine(draw) {
  const base = `${draw.teams.length} times de ${draw.teamSize}`;
  return draw.bench.length > 0 ? `${base} · ${draw.bench.length} aguardando` : `${base} · ninguém de fora`;
}

function content(draw, levels) {
  return [
    h(
      'div',
      { class: 'balance' },
      h('span', { class: 'balance-tag' }, draw.difference === 0 ? 'Equilíbrio perfeito' : `Diferença de ${starsText(draw.difference)}`),
      h('span', {}, 'entre o time mais forte e o mais fraco'),
    ),
    h('div', { class: 'team-grid' }, draw.teams.map((team) => teamCard(team, levels))),
  ];
}

// Conteúdo da tela de times. O botão de sortear fica no rodapé fixo (drawBar).
export function createTeams({ levels, footer }) {
  const subtitle = h('p', { class: 'teams-subtitle' });
  const stale = h(
    'p',
    { class: 'stale-warning', role: 'status', hidden: true },
    'A lista mudou depois do sorteio. Toque em ',
    h('strong', {}, 'Sortear de novo'),
    ' para atualizar os times.',
  );
  const body = h('div', { class: 'teams-body' });

  const el = h(
    'section',
    { class: 'teams-content', 'aria-labelledby': 'teams-title' },
    h(
      'div',
      {},
      h('h1', { id: 'teams-title', class: 'display teams-title', tabindex: '-1', 'data-screen-title': true }, 'Times da rodada'),
      subtitle,
    ),
    stale,
    body,
    footer,
  );

  return {
    el,
    update(state) {
      const { draw } = state;
      // Sem times, a tela volta ao Elenco (FR-015); até lá, fica vazia.
      if (!hasTeams(draw)) {
        subtitle.textContent = '';
        stale.hidden = true;
        body.replaceChildren();
        return;
      }
      subtitle.textContent = statusLine(draw);
      stale.hidden = !draw.stale;
      body.replaceChildren(...content(draw, levels));
    },
  };
}
