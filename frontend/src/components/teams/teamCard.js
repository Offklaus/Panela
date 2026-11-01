import { starIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';
import { formatDecimal, starsText } from '../../utils/format.js';
import { vestInfo } from '../../utils/vests.js';

const LEVELS = [1, 2, 3, 4, 5];

function miniStars(rating) {
  return h(
    'span',
    { class: 'mini-stars', role: 'img', 'aria-label': `${starsText(rating)} de 5` },
    LEVELS.map((level) => starIcon({ size: 14, filled: level <= rating })),
  );
}

export function teamCard(team) {
  const vest = vestInfo(team.vest);
  return h(
    'article',
    { class: 'team-card', 'aria-label': `Time ${team.letter}` },
    h('div', { class: 'team-color', style: { '--vest-color': vest.color } }),
    h(
      'div',
      { class: 'team-head' },
      h('div', {}, h('div', { class: 'team-vest' }, vest.label), h('h3', { class: 'team-name' }, `Time ${team.letter}`)),
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
        h('li', { class: 'team-player' }, h('span', { class: 'team-player-name' }, player.name), miniStars(player.rating)),
      ),
    ),
  );
}
