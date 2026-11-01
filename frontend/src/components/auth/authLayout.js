import { ballIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';

export function authLayout({ title, subtitle, children }) {
  return h(
    'main',
    { class: 'auth-page' },
    h(
      'div',
      { class: 'auth-card' },
      h(
        'div',
        { class: 'auth-brand' },
        h('div', { class: 'auth-logo' }, ballIcon({ size: 24 })),
        h('span', { class: 'display auth-brand-name' }, 'Times de Society'),
      ),
      h('div', {}, h('h1', { class: 'auth-title' }, title), subtitle ? h('p', { class: 'auth-subtitle' }, subtitle) : null),
      children,
    ),
  );
}

export function formField({ id, label, type = 'text', autocomplete, hint }) {
  const errorId = `${id}-error`;
  const hintId = hint ? `${id}-hint` : null;
  const error = h('span', { class: 'field-error', id: errorId, hidden: true });
  const input = h('input', {
    id,
    name: id,
    type,
    autocomplete,
    class: 'field-input',
    required: true,
    'aria-describedby': [hintId, errorId].filter(Boolean).join(' '),
  });

  return {
    input,
    wrapper: h(
      'div',
      { class: 'field' },
      h('label', { class: 'eyebrow', for: id }, label),
      input,
      hint ? h('span', { class: 'field-hint', id: hintId }, hint) : null,
      error,
    ),
    setError(message) {
      error.textContent = message ?? '';
      error.hidden = !message;
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    },
  };
}

export function formMessage() {
  const el = h('p', { class: 'form-message', role: 'alert', hidden: true });
  return {
    el,
    show(text, kind = 'error') {
      el.className = `form-message form-message-${kind}`;
      el.textContent = text;
      el.hidden = false;
    },
    hide() {
      el.hidden = true;
      el.textContent = '';
    },
  };
}

export function submitButton(label) {
  return h('button', { type: 'submit', class: 'auth-submit' }, label);
}

// Erro de um campo aparece embaixo dele; os demais, na mensagem do formulário.
export function showApiError(error, fields, message) {
  const field = error.field ? fields[error.field] : null;
  if (field) {
    field.setError(error.message);
    field.input.focus();
  } else {
    message.show(error.message);
  }
}

export function clearErrors(fields, message) {
  for (const field of Object.values(fields)) field.setError(null);
  message.hide();
}
