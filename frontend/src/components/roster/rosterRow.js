import { checkIcon, closeIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';
import { initials } from '../../utils/format.js';
import { starRating } from '../star-rating/starRating.js';

function presenceButton(player, onToggle) {
  const props = {
    type: 'button',
    'aria-pressed': String(player.present),
    'data-focus-key': `player-${player.id}-presence`,
    onClick: () => onToggle(player),
  };
  const name = h('span', { class: 'visually-hidden' }, ` · ${player.name}`);
  return player.present
    ? h('button', { ...props, class: 'presence presence-on' }, checkIcon(), 'Presente', name)
    : h('button', { ...props, class: 'presence presence-off' }, 'Ausente', name);
}

// Ordem do HTML = ordem visual: nome e remover em cima, estrelas e presença embaixo (research §10).
export function rosterRow({ player, levels, onRating, onTogglePresence, onRemove }) {
  return h(
    'li',
    { class: player.present ? 'roster-row is-present' : 'roster-row' },
    h(
      'div',
      { class: 'roster-player' },
      h('span', { class: 'avatar', 'aria-hidden': 'true' }, initials(player.name)),
      h('span', { class: 'roster-name' }, player.name),
    ),
    h(
      'button',
      {
        type: 'button',
        class: 'icon-button roster-remove',
        'aria-label': `Remover ${player.name}`,
        onClick: () => onRemove(player),
      },
      closeIcon(),
    ),
    starRating({
      levels,
      value: player.rating,
      name: player.name,
      label: `Nível de ${player.name}`,
      focusKey: `player-${player.id}-star`,
      onChange: (rating) => onRating(player, rating),
    }),
    presenceButton(player, onTogglePresence),
  );
}
