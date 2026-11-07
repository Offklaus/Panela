import { checkIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';
import { initials } from '../../utils/format.js';

const POSITION_LABELS = { ATA: 'Posição: ATA (ataque)', DEF: 'Posição: DEF (defesa)' };

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

// Elenco do dia do jogo: uma linha, com posição e nível só para leitura (FR-009 da 004).
export function rosterRow({ player, ratingMax, onTogglePresence }) {
  const { position } = player;
  return h(
    'li',
    { class: player.present ? 'roster-row is-present' : 'roster-row' },
    h('span', { class: 'avatar', 'aria-hidden': 'true' }, initials(player.name)),
    h('span', { class: 'roster-name' }, player.name),
    h(
      'span',
      {
        class: `position-tag position-tag-small position-tag-${(position ?? 'none').toLowerCase()}`,
        role: 'img',
        'aria-label': position ? POSITION_LABELS[position] : 'Sem posição',
      },
      position ?? '—',
    ),
    h('span', { class: 'roster-rating', role: 'img', 'aria-label': `Nível ${player.rating} de ${ratingMax}` }, `★ ${player.rating}`),
    presenceButton(player, onTogglePresence),
  );
}