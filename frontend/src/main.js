import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/auth.css';
import './styles/roster.css';
import './styles/teams.css';
import { authLayout } from './components/auth/authLayout.js';
import { forgotPasswordView } from './components/auth/forgotPasswordView.js';
import { loginView } from './components/auth/loginView.js';
import { resetPasswordView } from './components/auth/resetPasswordView.js';
import { signupView } from './components/auth/signupView.js';
import { rosterView } from './rosterView.js';
import { createRouter } from './router.js';
import * as authApi from './services/authApi.js';
import { getRules } from './services/rulesApi.js';
import { createStore } from './state/store.js';
import { teamsView } from './teamsView.js';
import { h } from './utils/dom.js';
import { mountNotice, showNotice } from './utils/notice.js';

const AUTH_ROUTES = new Set(['/entrar', '/criar-conta', '/esqueci-senha', '/nova-senha']);
const store = createStore({ organizer: null, roster: null, draw: null, rules: null, shortfall: null });

// Sem as regras não dá para montar a tela, e o frontend não guarda cópia delas.
function showLoadError(message) {
  document.getElementById('app').append(
    authLayout({
      title: 'Não foi possível abrir',
      subtitle: message,
      children: [h('button', { type: 'button', class: 'auth-submit', onClick: () => location.reload() }, 'Tentar de novo')],
    }),
  );
}

async function boot() {
  mountNotice();

  try {
    const { rules } = await getRules();
    store.setState({ rules });
  } catch (error) {
    showLoadError(error.message);
    return;
  }

  try {
    const { organizer } = await authApi.me();
    store.setState({ organizer });
  } catch (error) {
    if (error.code !== 'UNAUTHENTICATED') showNotice(error.message);
  }

  const withStore = (view) => (context) => view({ ...context, store });

  createRouter({
    mount: document.getElementById('app'),
    routes: {
      '/entrar': withStore(loginView),
      '/criar-conta': withStore(signupView),
      '/esqueci-senha': withStore(forgotPasswordView),
      '/nova-senha': withStore(resetPasswordView),
      '/': withStore(rosterView),
      '/times': withStore(teamsView),
    },
    beforeEach(path) {
      const signedIn = Boolean(store.getState().organizer);
      if (!signedIn && !AUTH_ROUTES.has(path)) return '/entrar';
      if (signedIn && AUTH_ROUTES.has(path) && path !== '/nova-senha') return '/';
      return null;
    },
  }).start();
}

boot();
