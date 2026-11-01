import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/auth.css';
import './styles/roster.css';
import './styles/teams.css';
import { forgotPasswordView } from './components/auth/forgotPasswordView.js';
import { loginView } from './components/auth/loginView.js';
import { resetPasswordView } from './components/auth/resetPasswordView.js';
import { signupView } from './components/auth/signupView.js';
import { homeView } from './homeView.js';
import { createRouter } from './router.js';
import * as authApi from './services/authApi.js';
import { createStore } from './state/store.js';
import { mountNotice, showNotice } from './utils/notice.js';

const AUTH_ROUTES = new Set(['/entrar', '/criar-conta', '/esqueci-senha', '/nova-senha']);
const store = createStore({ organizer: null, roster: null, draw: null });

async function boot() {
  mountNotice();

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
      '/': withStore(homeView),
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
