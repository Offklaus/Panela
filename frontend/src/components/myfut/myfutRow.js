import { closeIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';
import { initials } from '../../utils/format.js';
import { starRating } from '../star-rating/starRating.js';

const POSITION_NAMES = { ATA: 'ATA (ataque)', DEF: 'DEF (defesa)' };

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

// MyFUT: nome, posição e remover em cima; estrelas embaixo (research §2 da 004).
export function myfutRow({ player, levels, onRating, onRemove, onPosition }) {
  return h(
    'li',
    { class: 'myfut-row' },
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
        { type: 'button', class: 'icon-button roster-remove', 'aria-label': `Remover ${player.name}`, onClick: () => onRemove(player) },
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
    ),
  );
}