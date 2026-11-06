import { swapIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';

// Rodapé fixo das telas Elenco e Times, com o botão de sortear (FR-005, FR-014).
export function createDrawBar({ label, onDraw, lastTeamsHref }) {
  const notice = h('p', { class: 'draw-bar-notice', role: 'status', hidden: true });
  const count = h('span', { class: 'draw-count', hidden: true });
  const button = h('button', { type: 'button', class: 'draw-button', onClick: handleDraw }, swapIcon(), h('span', {}, label), count);
  const link = lastTeamsHref ? h('a', { class: 'draw-bar-link', href: lastTeamsHref, hidden: true }, 'Ver últimos times') : null;

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
    el: h('footer', { class: 'draw-bar' }, notice, button, link),
    update({ countText = null, shortfallText = null, showLastTeams = false } = {}) {
      count.textContent = countText ? `· ${countText}` : '';
      count.hidden = !countText;
      notice.textContent = shortfallText ?? '';
      notice.hidden = !shortfallText;
      if (link) link.hidden = !showLastTeams;
    },
  };
}
