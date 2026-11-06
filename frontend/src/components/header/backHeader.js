import { arrowLeftIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';

// Topo da tela de times: volta ao Elenco (FR-012).
export function createBackHeader({ onBack }) {
  return {
    el: h(
      'header',
      { class: 'app-header back-header' },
      h(
        'button',
        { type: 'button', class: 'back-button', 'aria-label': 'Voltar ao elenco', onClick: onBack },
        arrowLeftIcon(),
        'Elenco',
      ),
    ),
  };
}
