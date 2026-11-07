import { checkIcon, closeIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';
import { initials } from '../../utils/format.js';
import { starRating } from '../star-rating/starRating.js';

const POSITION_NAMES = { ATA: 'ATA (ataque)', DEF: 'DEF (defesa)' };

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

// Etiqueta de posição: um toque troca ATA e DEF; "Sem posição" passa a ATA (FR-005 da 003).
function positionButton(player, onPosition) {
  const tag = player.position ?? 'Sem posição';
  const description = player.position ? POSITION_NAMES[player.position] : 'sem posição';
  return h(
    'button',
    {
      type: 'button',
      class: 'position-button',
      'aria-label': `Posição de ${player.name}: ${description}`,
      'data-focus-key': `player-${player.id}-position`,
      onClick: () => onPosition(player),
    },
    h('span', { class: `position-tag position-tag-${(player.position ?? 'none').toLowerCase()}` }, tag),
  );
}

// Duas linhas, na ordem visual: nome, posição e remover; depois estrelas e presença.
export function rosterRow({ player, levels, onRating, onTogglePresence, onRemove, onPosition }) {
  return h(
    'li',
    { class: player.present ? 'roster-row is-present' : 'roster-row' },
    h(
      'div',
      { class: 'roster-line' },
      h(
        'div',
        { class: 'roster-player' },
        h('span', { class: 'avatar', 'aria-hidden': 'true' }, initials(player.name)),
        h('span', { class: 'roster-name' }, player.name),
      ),
      positionButton(player, onPosition),
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
    ),
    h(
      'div',
      { class: 'roster-line roster-line-controls' },
      starRating({
        levels,
        value: player.rating,
        name: player.name,
        label: `Nível de ${player.name}`,
        focusKey: `player-${player.id}-star`,
        onChange: (rating) => onRating(player, rating),
      }),
      presenceButton(player, onTogglePresence),
    ),
  );
}
