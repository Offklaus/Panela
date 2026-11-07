import { userIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';

// Menu da conta no padrão "disclosure": botão + painel, navegável com Tab (research §1 da 004).
export function createAccountMenu({ email, onLogout }) {
  const button = h(
    'button',
    { type: 'button', class: 'account-button', 'aria-label': 'Conta', 'aria-expanded': 'false', 'aria-controls': 'account-menu' },
    userIcon(),
  );
  const panel = h(
    'div',
    { id: 'account-menu', class: 'account-menu', hidden: true },
    h('p', { class: 'account-menu-email' }, email ?? ''),
    h('a', { class: 'account-menu-item', href: '#/myfut', onClick: () => close() }, 'MyFUT'),
    h('button', { type: 'button', class: 'account-menu-item', disabled: true }, 'Planos', h('span', { class: 'account-menu-soon' }, 'Em breve')),
    h(
      'button',
      {
        type: 'button',
        class: 'account-menu-item account-menu-logout',
        onClick: () => {
          close();
          onLogout();
        },
      },
      'Sair',
    ),
  );
  const el = h('div', { class: 'account' }, button, panel);

  // Tocar fora ou apertar Esc fecha o menu e devolve o foco ao botão (FR-005 da 004).
  function onPointerDown(event) {
    if (!el.contains(event.target)) close({ restoreFocus: true });
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') close({ restoreFocus: true });
  }

  function open() {
    panel.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
  }

  function close({ restoreFocus = false } = {}) {
    if (panel.hidden) return;
    panel.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', onPointerDown);
    document.removeEventListener('keydown', onKeyDown);
    if (restoreFocus) button.focus();
  }

  button.addEventListener('click', () => (panel.hidden ? open() : close()));
  return { el, close };
}