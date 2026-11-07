import { h } from '../../utils/dom.js';
import { rosterRow } from './rosterRow.js';

export function createRoster({ form, levels, onRating, onTogglePresence, onRemove, onPosition, onAllPresent, onClearPresence }) {
  const count = h('span', { class: 'roster-count' });
  const list = h('ul', { class: 'roster-list' });
  const empty = h('p', { class: 'roster-empty', hidden: true }, 'Nenhum jogador ainda. Adicione o primeiro acima.');

  const el = h(
    'section',
    { class: 'card roster-card', 'aria-labelledby': 'roster-title' },
    h(
      'div',
      { class: 'card-header' },
      h('h1', { id: 'roster-title', class: 'display section-title', tabindex: '-1', 'data-screen-title': true }, 'Elenco ', count),
      h(
        'div',
        { class: 'card-actions' },
        h('button', { type: 'button', class: 'btn btn-ghost', onClick: onAllPresent }, 'Todos presentes'),
        h('button', { type: 'button', class: 'btn btn-ghost', onClick: onClearPresence }, 'Limpar'),
      ),
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
      list.replaceChildren(...players.map((player) => rosterRow({ player, levels, onRating, onTogglePresence, onRemove, onPosition })));
      empty.hidden = !state.roster || players.length > 0;
    },
  };
}
