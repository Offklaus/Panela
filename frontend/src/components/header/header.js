import { ballIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';
import { formatDecimal } from '../../utils/format.js';

function stat(...label) {
  const value = h('div', { class: 'stat-value' }, '–');
  return { el: h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, ...label), value), value };
}

export function createHeader({ onLogout }) {
  const present = stat('Presentes');
  const teams = stat('Times');
  const average = stat('Média ', h('span', { 'aria-hidden': 'true' }, '★'));

  const el = h(
    'header',
    { class: 'app-header' },
    h(
      'div',
      { class: 'brand' },
      h('div', { class: 'brand-logo' }, ballIcon({ size: 30 })),
      h(
        'div',
        {},
        h('h1', { class: 'display brand-title' }, 'Times de Society'),
        h('p', { class: 'brand-tagline' }, 'Classifique, marque quem veio e sorteie times equilibrados.'),
      ),
    ),
    h(
      'div',
      { class: 'header-side' },
      h('div', { class: 'header-stats' }, present.el, teams.el, average.el),
      h('button', { type: 'button', class: 'btn btn-ghost', onClick: onLogout }, 'Sair'),
    ),
  );

  return {
    el,
    // O resumo vem pronto do backend (constituição, Princípio II); aqui só se formata.
    update(state) {
      const summary = state.roster?.summary;
      present.value.textContent = summary ? String(summary.presentCount) : '–';
      teams.value.textContent = summary ? String(summary.possibleTeams) : '–';
      average.value.textContent = formatDecimal(summary?.averageRating ?? null);
    },
  };
}
