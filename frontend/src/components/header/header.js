import { ballIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';
import { createAccountMenu } from './accountMenu.js';

// Marca e menu da conta, no lugar do antigo "Sair" (FR-001 da 004).
export function createHeader({ email, onLogout }) {
  const menu = createAccountMenu({ email, onLogout });
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
      menu.el,
    ),
    close: menu.close,
  };
}