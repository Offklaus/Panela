import { h } from '../../utils/dom.js';

export function createBench() {
  const list = h('ul', { class: 'bench-list' });
  const el = h('div', { class: 'bench', hidden: true }, h('h3', { class: 'bench-title' }, 'Próximos · aguardando vaga'), list);

  return {
    el,
    update(state) {
      const bench = state.draw?.bench ?? [];
      el.hidden = bench.length === 0;
      list.replaceChildren(
        ...bench.map((player) =>
          h(
            'li',
            { class: 'bench-chip' },
            player.name,
            h('span', { class: 'bench-position' }, player.position),
            h(
              'span',
              { class: 'bench-rating' },
              h('span', { 'aria-hidden': 'true' }, '★ '),
              h('span', { class: 'visually-hidden' }, ', nível '),
              String(player.rating),
            ),
          ),
        ),
      );
    },
  };
}
