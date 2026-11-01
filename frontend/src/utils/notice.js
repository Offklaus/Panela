import { h } from './dom.js';

// Região única de avisos, lida por leitores de tela (FR-035).
let region = null;
let timer = null;

export function mountNotice(parent = document.body) {
  region = h('div', { class: 'notice', role: 'status', 'aria-live': 'polite', hidden: true });
  parent.append(region);
}

export function showNotice(message, { timeout = 6000 } = {}) {
  if (!region) return;
  clearTimeout(timer);
  region.textContent = message;
  region.hidden = false;
  if (timeout) timer = setTimeout(clearNotice, timeout);
}

export function clearNotice() {
  if (!region) return;
  clearTimeout(timer);
  region.hidden = true;
  region.textContent = '';
}
