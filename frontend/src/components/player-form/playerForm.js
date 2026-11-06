import { plusIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';
import { showNotice } from '../../utils/notice.js';
import { starRating } from '../star-rating/starRating.js';

const INLINE_ERRORS = new Set(['VALIDATION_ERROR', 'NAME_TAKEN', 'ROSTER_FULL']);

export function createPlayerForm({ levels, defaultRating, onSubmit }) {
  let rating = defaultRating;

  const input = h('input', {
    id: 'new-player-name',
    type: 'text',
    class: 'field-input',
    placeholder: 'Nome ou apelido',
    autocomplete: 'off',
    'aria-describedby': 'new-player-error',
  });
  const error = h('span', { class: 'field-error', id: 'new-player-error', hidden: true });
  const stars = h('div', {});
  const submit = h('button', { type: 'submit', class: 'btn btn-primary' }, plusIcon(), 'Adicionar');

  function setError(message) {
    error.textContent = message ?? '';
    error.hidden = !message;
    if (message) input.setAttribute('aria-invalid', 'true');
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
      await onSubmit({ name: input.value, rating });
      input.value = '';
      input.focus();
    } catch (apiError) {
      if (apiError.handled) return;
      if (INLINE_ERRORS.has(apiError.code)) {
        setError(apiError.message);
        input.focus();
      } else {
        showNotice(apiError.message);
      }
    } finally {
      submit.disabled = false;
    }
  }

  renderStars();

  return {
    el: h(
      'form',
      { class: 'player-form', novalidate: true, onSubmit: handleSubmit },
      h(
        'div',
        { class: 'player-form-name' },
        h('label', { class: 'eyebrow', for: 'new-player-name' }, 'Novo jogador'),
        input,
        error,
      ),
      h('div', { class: 'player-form-rating' }, h('span', { class: 'eyebrow', 'aria-hidden': 'true' }, 'Nível'), stars),
      submit,
    ),
  };
}
