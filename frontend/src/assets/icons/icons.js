// Ícones SVG em linha, decorativos (aria-hidden). A cor vem de currentColor, definida no CSS.
import { s } from '../../utils/dom.js';

const STAR_PATH = 'M12 2.8l2.85 5.9 6.45.85-4.72 4.45 1.2 6.4L12 17.3l-5.78 3.1 1.2-6.4L2.7 9.55l6.45-.85z';

function icon(size, ...children) {
  return s('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' }, ...children);
}

export function ballIcon({ size = 30 } = {}) {
  return icon(
    size,
    s('circle', { cx: 12, cy: 12, r: 9.5, stroke: 'currentColor', 'stroke-width': 1.8 }),
    s('path', { d: 'M12 7.6l3.6 2.6-1.4 4.2H9.8L8.4 10.2z', fill: 'currentColor' }),
    s('path', {
      d: 'M12 7.6V2.6M15.6 10.2l4.6-1.6M14.2 14.4l2.9 4.1M9.8 14.4l-2.9 4.1M8.4 10.2L3.8 8.6',
      stroke: 'currentColor',
      'stroke-width': 1.5,
      'stroke-linecap': 'round',
    }),
  );
}

export function starIcon({ size = 24, filled }) {
  const svg = icon(
    size,
    s('path', {
      d: STAR_PATH,
      fill: filled ? 'currentColor' : 'none',
      stroke: 'currentColor',
      'stroke-width': filled ? 1.4 : 1.6,
      'stroke-linejoin': 'round',
    }),
  );
  svg.setAttribute('class', filled ? 'star star-filled' : 'star star-empty');
  return svg;
}

function strokeIcon(size, d, width) {
  return icon(size, s('path', { d, stroke: 'currentColor', 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
}

export const checkIcon = ({ size = 16 } = {}) => strokeIcon(size, 'M5 12.5l4.5 4.5L19 7.5', 2.6);
export const closeIcon = ({ size = 18 } = {}) => strokeIcon(size, 'M6 6l12 12M18 6L6 18', 2);
export const plusIcon = ({ size = 18 } = {}) => strokeIcon(size, 'M12 5v14M5 12h14', 2.4);
export const swapIcon = ({ size = 22 } = {}) => strokeIcon(size, 'M4 7h11l-3-3M20 17H9l3 3', 2.4);
