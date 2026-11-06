import { ballIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';

// Só a marca e "Sair": o resumo saiu do topo (feature 002, FR-002 e FR-003).
export function createHeader({ onLogout }) {
  return {
    el: h(
      'header',
      { class: 'app-header' },
      h(
        'div',
        { class: 'brand' },
        h('div', { class: 'brand-logo' }, ballIcon({ size: 24 })),
        h('span', { class: 'display brand-title' }, 'Times de Society'),
      ),
      h('button', { type: 'button', class: 'btn btn-ghost', onClick: onLogout }, 'Sair'),
    ),
  };
}
