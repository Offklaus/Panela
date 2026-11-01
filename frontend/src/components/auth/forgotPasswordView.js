import { requestPasswordReset } from '../../services/authApi.js';
import { h } from '../../utils/dom.js';
import { authLayout, clearErrors, formField, formMessage, showApiError, submitButton } from './authLayout.js';

export function forgotPasswordView({ mount }) {
  const fields = {
    email: formField({ id: 'forgot-email', label: 'E-mail da conta', type: 'email', autocomplete: 'email' }),
  };
  const message = formMessage();
  const submit = submitButton('Enviar link');
  const form = h('form', { class: 'auth-form', novalidate: true, onSubmit }, fields.email.wrapper, message.el, submit);

  async function onSubmit(event) {
    event.preventDefault();
    clearErrors(fields, message);
    submit.disabled = true;
    try {
      const response = await requestPasswordReset(fields.email.input.value);
      // A confirmação é a mesma com ou sem conta (FR-006).
      form.replaceWith(h('p', { class: 'form-message form-message-success', role: 'status' }, response.message));
    } catch (error) {
      showApiError(error, fields, message);
    } finally {
      submit.disabled = false;
    }
  }

  mount.append(
    authLayout({
      title: 'Esqueci a senha',
      subtitle: 'Enviamos um link para criar uma nova senha.',
      children: [form, h('p', { class: 'auth-links' }, h('a', { href: '#/entrar' }, 'Voltar para entrar'))],
    }),
  );
  fields.email.input.focus();
}
