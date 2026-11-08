import { arrowLeftIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';

// Topo das telas internas: volta para a tela anterior (FR-012 da 002; "← MyTeam" na 005).
export function createBackHeader({ onBack, label = 'Elenco', ariaLabel = 'Voltar ao elenco' }) {
  return {
    el: h(
      'header',
      { class: 'app-header back-header' },
      h('button', { type: 'button', class: 'back-button', 'aria-label': ariaLabel, onClick: onBack }, arrowLeftIcon(), label),
    ),
  };
}