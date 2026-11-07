import { starIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';
import { formatDecimal, positionCountText, starsText } from '../../utils/format.js';
import { vestInfo } from '../../utils/vests.js';

function miniStars(rating, levels) {
  return h(
    'span',
    { class: 'mini-stars', role: 'img', 'aria-label': `${starsText(rating)} de ${levels.at(-1)}` },
    levels.map((level) => starIcon({ size: 14, filled: level <= rating })),
  );
}

function positionTag(position) {
  return h('span', { class: `team-position team-position-${position.toLowerCase()}` }, position);
}

export function teamCard(team, levels) {
  const vest = vestInfo(team.vest);
  return h(
    'article',
    { class: 'team-card', 'aria-label': `Time ${team.letter}` },
    h('div', { class: 'team-color', style: { '--vest-color': vest.color } }),
    h(
      'div',
      { class: 'team-head' },
      h(
        'div',
        {},
        h('div', { class: 'team-vest' }, vest.label),
        h('h3', { class: 'team-name' }, `Time ${team.letter}`),
        h('div', { class: 'team-positions' }, positionCountText(team.positions)),
      ),
      h(
        'div',
        { class: 'team-score' },
        h(
          'div',
          { class: 'team-total' },
          h('span', { 'aria-hidden': 'true' }, '★ '),
          h('span', { class: 'visually-hidden' }, 'Total: '),
          String(team.total),
          h('span', { class: 'visually-hidden' }, ' estrelas'),
        ),
        h('div', { class: 'team-average' }, `média ${formatDecimal(team.average)}`),
      ),
    ),
    h(
      'ol',
      { class: 'team-players' },
      team.players.map((player) =>
        h(
          'li',
          { class: 'team-player' },
          h('span', { class: 'team-player-name' }, player.name),
          positionTag(player.position),
          miniStars(player.rating, levels),
        ),
      ),
    ),
  );
}
