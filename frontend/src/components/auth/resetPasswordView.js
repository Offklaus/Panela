import { confirmPasswordReset } from '../../services/authApi.js';
import { h } from '../../utils/dom.js';
import { passwordHintText } from '../../utils/format.js';
import { showNotice } from '../../utils/notice.js';
import { authLayout, clearErrors, formField, formMessage, showApiError, submitButton } from './authLayout.js';

function invalidLinkMessage(text = 'Este link não vale mais. Peça um novo.') {
  return h(
    'p',
    { class: 'form-message form-message-error', role: 'alert' },
    text,
    ' ',
    h('a', { href: '#/esqueci-senha' }, 'Pedir outro link'),
  );
}

export function resetPasswordView({ mount, query, store, navigate }) {
  const token = query.get('token');
  const links = h('p', { class: 'auth-links' }, h('a', { href: '#/entrar' }, 'Voltar para entrar'));

  if (!token) {
    mount.append(authLayout({ title: 'Nova senha', children: [invalidLinkMessage('Este link está incompleto.'), links] }));
    return;
  }

  const fields = {
    password: formField({ id: 'reset-password', label: 'Nova senha', type: 'password', autocomplete: 'new-password' }),
  };
  const message = formMessage();
  const submit = submitButton('Salvar senha');
  const form = h('form', { class: 'auth-form', novalidate: true, onSubmit }, fields.password.wrapper, message.el, submit);

  async function onSubmit(event) {
    event.preventDefault();
    clearErrors(fields, message);
    submit.disabled = true;
    try {
      await confirmPasswordReset(token, fields.password.input.value);
      // A troca encerra todas as sessões; o organizador entra de novo com a senha nova.
      store.setState({ organizer: null, roster: null, draw: null });
      navigate('/entrar');
      showNotice('Senha alterada. Entre com a nova senha.');
    } catch (error) {
      if (error.code === 'INVALID_RESET_TOKEN') form.replaceWith(invalidLinkMessage(error.message));
      else showApiError(error, fields, message);
    } finally {
      submit.disabled = false;
    }
  }

  const subtitle = passwordHintText(store.getState().rules.passwordMinLength);
  mount.append(authLayout({ title: 'Nova senha', subtitle, children: [form, links] }));
  fields.password.input.focus();
}
