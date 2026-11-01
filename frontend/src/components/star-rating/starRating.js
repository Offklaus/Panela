import { starIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';
import { starsText } from '../../utils/format.js';

const LEVELS = [1, 2, 3, 4, 5];

export function starRating({ value, name, label, size = 22, focusKey, onChange }) {
  return h(
    'div',
    { class: 'star-rating', role: 'group', 'aria-label': label },
    LEVELS.map((level) =>
      h(
        'button',
        {
          type: 'button',
          class: 'star-button',
          'aria-label': `${name}: ${starsText(level)}`,
          'aria-pressed': String(level === value),
          'data-focus-key': focusKey ? `${focusKey}-${level}` : undefined,
          onClick: () => onChange(level),
        },
        starIcon({ size, filled: level <= value }),
      ),
    ),
  );
}
