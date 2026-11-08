import { clubIcon } from '../../assets/icons/clubIcons.js';
import { chevronRightIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';
import { playerCountText } from '../../utils/format.js';

// Card do time no MyTeam: tocar abre o elenco do time (FR-008 da 005).
export function createClubCard() {
  const badge = h('span', { class: 'club-badge', 'aria-hidden': 'true' });
  const name = h('span', { class: 'display club-card-name' });
  const count = h('span', { class: 'club-card-count' });

  return {
    el: h(
      'a',
      { class: 'club-card', href: '#/myteam/elenco' },
      badge,
      h('span', { class: 'club-card-text' }, name, count),
      h('span', { class: 'club-card-chevron', 'aria-hidden': 'true' }, chevronRightIcon()),
    ),
    update({ club, playerCount }) {
      badge.replaceChildren(clubIcon(club.icon, { size: 30 }));
      name.textContent = club.name;
      count.textContent = Number.isInteger(playerCount) ? playerCountText(playerCount) : '';
    },
  };
}