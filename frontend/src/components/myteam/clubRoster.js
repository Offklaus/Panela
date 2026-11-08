import { clubIcon } from '../../assets/icons/clubIcons.js';
import { h } from '../../utils/dom.js';
import { clubRosterRow } from './clubRosterRow.js';

// Cartão do elenco do time: ícone e nome do time, "Convocar jogador" em breve, formulário e lista
// editável (FR-009 e FR-010 da 005).
export function createClubRoster({ form, levels, onRating, onRemove, onPosition }) {
  const badge = h('span', { class: 'club-badge club-badge-small', 'aria-hidden': 'true' });
  const name = h('span', { class: 'club-title-name' });
  const count = h('span', { class: 'roster-count' });
  const list = h('ul', { class: 'roster-list' });
  const empty = h('p', { class: 'roster-empty', hidden: true }, 'Nenhum jogador ainda. Adicione o primeiro acima.');

  const el = h(
    'section',
    { class: 'card roster-card', 'aria-labelledby': 'club-roster-title' },
    h(
      'div',
      { class: 'card-header' },
      h(
        'div',
        { class: 'club-title-row' },
        badge,
        h(
          'h1',
          { id: 'club-roster-title', class: 'display section-title', tabindex: '-1', 'data-screen-title': true },
          name,
          ' ',
          count,
        ),
      ),
      h(
        'button',
        { type: 'button', class: 'btn btn-ghost soon-button', disabled: true },
        'Convocar jogador',
        h('span', { class: 'soon-tag' }, 'Em breve'),
      ),
    ),
    form,
    list,
    empty,
  );

  return {
    el,
    update(state) {
      const { club, roster } = state;
      const players = roster?.players ?? [];
      badge.hidden = !club;
      if (club && badge.dataset.icon !== club.icon) {
        badge.dataset.icon = club.icon;
        badge.replaceChildren(clubIcon(club.icon, { size: 22 }));
      }
      name.textContent = club?.name ?? '';
      count.textContent = club && roster ? `· ${players.length}` : '';
      list.replaceChildren(...players.map((player) => clubRosterRow({ player, levels, onRating, onRemove, onPosition })));
      empty.hidden = !roster || players.length > 0;
    },
  };
}