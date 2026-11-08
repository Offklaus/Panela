import { clubIcon, clubIconName } from '../../assets/icons/clubIcons.js';
import { plusIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';
import { showNotice } from '../../utils/notice.js';

// "Criar time": nome e um ícone da lista que vem das regras, com o primeiro marcado (FR-007 da 005).
export function createClubForm({ icons, onSubmit }) {
  let icon = icons[0];

  const input = h('input', {
    id: 'club-name',
    type: 'text',
    class: 'field-input',
    placeholder: 'Ex.: Os Boleiros',
    autocomplete: 'off',
    'aria-describedby': 'club-name-error',
  });
  const nameError = h('span', { class: 'field-error', id: 'club-name-error', hidden: true });
  const iconError = h('span', { class: 'field-error', id: 'club-icon-error', hidden: true });
  const submit = h('button', { type: 'submit', class: 'btn btn-primary club-submit' }, plusIcon(), 'Criar time');
  const iconButtons = icons.map((id) =>
    h(
      'button',
      {
        type: 'button',
        class: 'club-icon-option',
        'aria-label': clubIconName(id),
        'aria-pressed': String(id === icon),
        dataset: { icon: id },
        onClick: () => selectIcon(id),
      },
      clubIcon(id),
    ),
  );

  function selectIcon(id) {
    icon = id;
    for (const button of iconButtons) button.setAttribute('aria-pressed', String(button.dataset.icon === id));
    showFieldError(iconError, null);
  }

  function showFieldError(element, message) {
    element.textContent = message ?? '';
    element.hidden = !message;
  }

  function setError(message, field) {
    showFieldError(nameError, field === 'icon' ? null : message);
    showFieldError(iconError, field === 'icon' ? message : null);
    if (message && field !== 'icon') input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    submit.disabled = true;
    try {
      await onSubmit({ name: input.value, icon });
    } catch (apiError) {
      if (apiError.handled) return;
      if (apiError.code === 'VALIDATION_ERROR') {
        setError(apiError.message, apiError.field);
        if (apiError.field === 'icon') iconButtons[0]?.focus();
        else input.focus();
      } else {
        showNotice(apiError.message);
      }
    } finally {
      submit.disabled = false;
    }
  }

  // Ordem do canvas "MyTeam · criar time": nome, grade de ícones e "Criar time".
  return {
    el: h(
      'form',
      { class: 'club-form', novalidate: true, onSubmit: handleSubmit },
      h(
        'div',
        { class: 'club-field' },
        h('label', { class: 'eyebrow', for: 'club-name' }, 'Nome do time'),
        input,
        nameError,
      ),
      h(
        'div',
        { class: 'club-field' },
        h('span', { class: 'eyebrow', id: 'club-icon-label' }, 'Ícone'),
        h(
          'div',
          {
            class: 'club-icon-grid',
            role: 'group',
            'aria-labelledby': 'club-icon-label',
            'aria-describedby': 'club-icon-error',
          },
          iconButtons,
        ),
        iconError,
      ),
      submit,
    ),
    focus: () => input.focus(),
  };
}