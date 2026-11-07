import { h } from '../../utils/dom.js';
import { rosterRow } from './rosterRow.js';

// Elenco do dia do jogo: só presença; o cadastro fica no MyFUT (FR-010 e FR-011 da 004).
export function createRoster({ levels, onTogglePresence, onAllPresent, onClearPresence }) {
  const count = h('span', { class: 'roster-count' });
  const list = h('ul', { class: 'roster-list' });
  const empty = h(
    'div',
    { class: 'roster-empty', hidden: true },
    h('p', {}, 'Nenhum jogador ainda.'),
    h('a', { class: 'btn btn-primary', href: '#/myfut' }, 'Abrir MyFUT'),
  );

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
    list,
    empty,
  );

  return {
    el,
    update(state) {
      const players = state.roster?.players ?? [];
      count.textContent = state.roster ? `· ${players.length}` : '';
      list.replaceChildren(...players.map((player) => rosterRow({ player, ratingMax: levels.at(-1), onTogglePresence })));
      empty.hidden = !state.roster || players.length > 0;
    },
  };
}