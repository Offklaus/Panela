import { plusIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';
import { showNotice } from '../../utils/notice.js';
import { starRating } from '../star-rating/starRating.js';

const INLINE_ERRORS = new Set(['VALIDATION_ERROR', 'NAME_TAKEN', 'ROSTER_FULL']);
const POSITION_LABELS = { ATA: 'ATA (ataque)', DEF: 'DEF (defesa)' };

export function createPlayerForm({ levels, defaultRating, onSubmit }) {
  let rating = defaultRating;
  // Começa sem posição e guarda a última escolhida depois de cada cadastro (FR-003 da 003).
  let position = null;

  const input = h('input', {
    id: 'new-player-name',
    type: 'text',
    class: 'field-input',
    placeholder: 'Nome ou apelido',
    autocomplete: 'off',
    'aria-describedby': 'new-player-error',
  });
  const error = h('span', { class: 'field-error', id: 'new-player-error', hidden: true });
  const positionError = h('span', { class: 'field-error', id: 'new-player-position-error', hidden: true });
  const stars = h('div', { class: 'player-form-stars' });
  const submit = h('button', { type: 'submit', class: 'btn btn-primary' }, plusIcon(), 'Adicionar');
  const positionButtons = Object.entries(POSITION_LABELS).map(([value, label]) =>
    h(
      'button',
      {
        type: 'button',
        class: 'position-option',
        'aria-label': label,
        'aria-pressed': 'false',
        dataset: { position: value },
        onClick: () => selectPosition(value),
      },
      value,
    ),
  );

  function selectPosition(value) {
    position = value;
    for (const button of positionButtons) button.setAttribute('aria-pressed', String(button.dataset.position === value));
    showFieldError(positionError, null);
  }

  function showFieldError(element, message) {
    element.textContent = message ?? '';
    element.hidden = !message;
  }

  function setError(message, field) {
    showFieldError(error, field === 'position' ? null : message);
    showFieldError(positionError, field === 'position' ? message : null);
    if (message && field !== 'position') input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  function renderStars(focusLevel) {
    stars.replaceChildren(
      starRating({
        levels,
        value: rating,
        name: 'Nível do novo jogador',
        label: 'Nível do novo jogador',
        size: 24,
        focusKey: 'new-player-star',
        onChange: (level) => {
          rating = level;
          renderStars(level);
        },
      }),
    );
    if (focusLevel) stars.querySelector(`[data-focus-key="new-player-star-${focusLevel}"]`)?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    submit.disabled = true;
    try {
      await onSubmit({ name: input.value, rating, position });
      input.value = '';
      input.focus();
    } catch (apiError) {
      if (apiError.handled) return;
      if (INLINE_ERRORS.has(apiError.code)) {
        setError(apiError.message, apiError.field);
        if (apiError.field === 'position') positionButtons[0].focus();
        else input.focus();
      } else {
        showNotice(apiError.message);
      }
    } finally {
      submit.disabled = false;
    }
  }

  renderStars();

  // Ordem do canvas "Elenco · celular": nome e Adicionar, nível e posição (research §11 da 002, §9 da 003).
  return {
    el: h(
      'form',
      { class: 'player-form', novalidate: true, onSubmit: handleSubmit },
      h('label', { class: 'eyebrow', for: 'new-player-name' }, 'Novo jogador'),
      h('div', { class: 'player-form-row' }, input, submit),
      error,
      h('div', { class: 'player-form-rating' }, h('span', { class: 'eyebrow', 'aria-hidden': 'true' }, 'Nível'), stars),
      h(
        'div',
        { class: 'player-form-position' },
        h('span', { class: 'eyebrow', id: 'new-player-position-label' }, 'Posição'),
        h(
          'div',
          {
            class: 'position-options',
            role: 'group',
            'aria-labelledby': 'new-player-position-label',
            'aria-describedby': 'new-player-position-error',
          },
          positionButtons,
        ),
      ),
      positionError,
    ),
  };
}
