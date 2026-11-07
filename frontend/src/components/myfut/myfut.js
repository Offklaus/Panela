import { h } from '../../utils/dom.js';
import { myfutRow } from './myfutRow.js';

// Cartão do MyFUT: título, formulário e lista editável (FR-006 da 004).
export function createMyfut({ form, levels, onRating, onRemove, onPosition }) {
  const count = h('span', { class: 'roster-count' });
  const list = h('ul', { class: 'roster-list' });
  const empty = h('p', { class: 'roster-empty', hidden: true }, 'Nenhum jogador ainda. Adicione o primeiro acima.');

  const el = h(
    'section',
    { class: 'card roster-card', 'aria-labelledby': 'myfut-title' },
    h(
      'div',
      { class: 'card-header' },
      h('h1', { id: 'myfut-title', class: 'display section-title', tabindex: '-1', 'data-screen-title': true }, 'MyFUT ', count),
    ),
    form,
    list,
    empty,
  );

  return {
    el,
    update(state) {
      const players = state.roster?.players ?? [];
      count.textContent = state.roster ? `· ${players.length}` : '';
      list.replaceChildren(...players.map((player) => myfutRow({ player, levels, onRating, onRemove, onPosition })));
      empty.hidden = !state.roster || players.length > 0;
    },
  };
}