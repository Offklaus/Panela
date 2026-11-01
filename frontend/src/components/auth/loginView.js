import { login } from '../../services/authApi.js';
import { h } from '../../utils/dom.js';
import { authLayout, clearErrors, formField, formMessage, showApiError, submitButton } from './authLayout.js';

export function loginView({ mount, store, navigate }) {
  const fields = {
    email: formField({ id: 'login-email', label: 'E-mail', type: 'email', autocomplete: 'email' }),
    password: formField({ id: 'login-password', label: 'Senha', type: 'password', autocomplete: 'current-password' }),
  };
  const message = formMessage();
  const submit = submitButton('Entrar');

  async function onSubmit(event) {
    event.preventDefault();
    clearErrors(fields, message);
    submit.disabled = true;
    try {
      const { organizer } = await login({ email: fields.email.input.value, password: fields.password.input.value });
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
      title: 'Entrar',
      subtitle: 'Acesse o seu elenco.',
      children: [
        h('form', { class: 'auth-form', novalidate: true, onSubmit }, fields.email.wrapper, fields.password.wrapper, message.el, submit),
        h(
          'p',
          { class: 'auth-links' },
          h('a', { href: '#/criar-conta' }, 'Criar conta'),
          h('a', { href: '#/esqueci-senha' }, 'Esqueci a senha'),
        ),
      ],
    }),
  );
  fields.email.input.focus();
}
