import { signup } from '../../services/authApi.js';
import { h } from '../../utils/dom.js';
import { passwordHintText } from '../../utils/format.js';
import { authLayout, clearErrors, formField, formMessage, showApiError, submitButton } from './authLayout.js';

export function signupView({ mount, store, navigate }) {
  const fields = {
    email: formField({ id: 'signup-email', label: 'E-mail', type: 'email', autocomplete: 'email' }),
    password: formField({
      id: 'signup-password',
      label: 'Senha',
      type: 'password',
      autocomplete: 'new-password',
      hint: passwordHintText(store.getState().rules.passwordMinLength),
    }),
  };
  const message = formMessage();
  const submit = submitButton('Criar conta');

  async function onSubmit(event) {
    event.preventDefault();
    clearErrors(fields, message);
    submit.disabled = true;
    try {
      const { organizer } = await signup({ email: fields.email.input.value, password: fields.password.input.value });
      store.setState({ organizer });
      navigate('/');
    } catch (error) {
      showApiError(error, fields, message);
    } finally {
      submit.disabled = false;
    }
  }

  mount.append(
    authLayout({
      title: 'Criar conta',
      subtitle: 'Cada conta tem o próprio elenco.',
      children: [
        h('form', { class: 'auth-form', novalidate: true, onSubmit }, fields.email.wrapper, fields.password.wrapper, message.el, submit),
        h('p', { class: 'auth-links' }, h('a', { href: '#/entrar' }, 'Já tenho conta')),
      ],
    }),
  );
  fields.email.input.focus();
}
