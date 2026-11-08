// Ícones do time (feature 005). Quais valem vem de GET /api/rules (clubIcons); aqui ficam só o desenho
// e o nome em pt-BR. Um id sem desenho cai na bola (research §4 da 005).
import { s } from '../../utils/dom.js';

const STROKE = { stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
const path = (d) => s('path', { d, ...STROKE });

const DRAWINGS = {
  ball: () => [
    s('circle', { cx: 12, cy: 12, r: 9.5, stroke: 'currentColor', 'stroke-width': 1.8 }),
    s('path', { d: 'M12 7.6l3.6 2.6-1.4 4.2H9.8L8.4 10.2z', fill: 'currentColor' }),
    s('path', {
      d: 'M12 7.6V2.6M15.6 10.2l4.6-1.6M14.2 14.4l2.9 4.1M9.8 14.4l-2.9 4.1M8.4 10.2L3.8 8.6',
      stroke: 'currentColor',
      'stroke-width': 1.5,
      'stroke-linecap': 'round',
    }),
  ],
  shield: () => [path('M12 3l7.5 3v5.5c0 4.6-3.2 8.4-7.5 9.9-4.3-1.5-7.5-5.3-7.5-9.9V6z')],
  bolt: () => [path('M13.5 2.5L5 13.5h6.5l-1 8 8.5-11h-6.5z')],
  star: () => [path('M12 2.8l2.85 5.9 6.45.85-4.72 4.45 1.2 6.4L12 17.3l-5.78 3.1 1.2-6.4L2.7 9.55l6.45-.85z')],
  crown: () => [path('M3.5 8.5l4.5 4 4-6.5 4 6.5 4.5-4-1.8 10H5.3z')],
  flame: () => [
    path('M12 21.5c-3.9 0-6.5-2.7-6.5-6.3 0-3.4 2.4-5.2 3.6-8.2.9 1.6 1.9 2.6 2.9 3.2.3-2.9 1.5-5.3 3.5-7.2.2 3.4 3 5.6 3 10.2 0 4.4-2.7 8.3-6.5 8.3z'),
  ],
  trophy: () => [path('M8 4h8v5a4 4 0 0 1-8 0zM8 5.5H5v1.5a3 3 0 0 0 3 3M16 5.5h3v1.5a3 3 0 0 1-3 3M12 13v4M8.5 20.5h7M10 17h4v3.5h-4z')],
  target: () => [
    s('circle', { cx: 12, cy: 12, r: 9, stroke: 'currentColor', 'stroke-width': 1.8 }),
    s('circle', { cx: 12, cy: 12, r: 5.2, stroke: 'currentColor', 'stroke-width': 1.8 }),
    s('circle', { cx: 12, cy: 12, r: 1.8, fill: 'currentColor' }),
  ],
};

const NAMES = {
  ball: 'Bola',
  shield: 'Escudo',
  bolt: 'Raio',
  star: 'Estrela',
  crown: 'Coroa',
  flame: 'Chama',
  trophy: 'Troféu',
  target: 'Alvo',
};

export function clubIcon(id, { size = 28 } = {}) {
  const draw = DRAWINGS[id] ?? DRAWINGS.ball;
  return s('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' }, ...draw());
}

export function clubIconName(id) {
  return NAMES[id] ?? NAMES.ball;
}