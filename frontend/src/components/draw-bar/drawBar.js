import { swapIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';

// Rodapé fixo das telas Elenco e Times, com o botão de sortear (FR-005, FR-014).
export function createDrawBar({ label, onDraw }) {
  const notice = h('p', { class: 'draw-bar-notice', role: 'status', hidden: true });
  const count = h('span', { class: 'draw-count', hidden: true });
  const button = h('button', { type: 'button', class: 'draw-button', onClick: handleDraw }, swapIcon(), h('span', {}, label), count);

  // Um toque duplo não faz dois sorteios (FR-011).
  async function handleDraw() {
    button.disabled = true;
    try {
      await onDraw();
    } finally {
      button.disabled = false;
    }
  }

  return {
    el: h('footer', { class: 'draw-bar' }, notice, button),
    // `noticeLink` ({ href, text }) leva à tela onde o aviso se resolve (FR-012 da 004).
    update({ countText = null, shortfallText = null, noticeLink = null } = {}) {
      count.textContent = countText ? `· ${countText}` : '';
      count.hidden = !countText;
      const link = shortfallText && noticeLink ? [' ', h('a', { class: 'draw-bar-notice-link', href: noticeLink.href }, noticeLink.text)] : [];
      notice.replaceChildren(shortfallText ?? '', ...link);
      notice.hidden = !shortfallText;
    },
  };
}
