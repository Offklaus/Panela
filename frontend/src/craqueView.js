import { createProfileCard } from './components/craque/profileCard.js';
import { createProfileForm } from './components/craque/profileForm.js';
import { createBackHeader } from './components/header/backHeader.js';
import { createScreenActions } from './screenActions.js';
import * as profileApi from './services/profileApi.js';
import { h } from './utils/dom.js';

const INTRO = { form: 'Monte o seu perfil de jogador.', edit: 'Edite o seu perfil de jogador.' };

// Tela Craque (#/craque): o perfil de jogador da conta. Sem perfil, o formulário; com perfil, o card;
// "Editar perfil" abre o formulário preenchido (US1 e US2 da 006).
export function craqueView({ mount, store, navigate, goBackTo }) {
  const { rules, organizer } = store.getState();
  const actions = createScreenActions({ store, navigate });
  let active = true;
  let mode = null;
  let editing = false;
  let focusEdit = false;

  async function loadProfile() {
    try {
      const { profile } = await profileApi.getProfile();
      if (active) store.setState({ profile });
    } catch (error) {
      actions.handleError(error);
    }
  }

  async function saveProfile(input) {
    try {
      const { profile } = await profileApi.saveProfile(input);
      editing = false;
      focusEdit = true;
      store.setState({ profile });
    } catch (error) {
      if (error.code === 'UNAUTHENTICATED') {
        error.handled = true;
        actions.signOut();
      }
      throw error;
    }
  }

  function startEditing() {
    editing = true;
    render(store.getState());
  }

  function cancelEditing() {
    editing = false;
    focusEdit = true;
    render(store.getState());
  }

  const header = createBackHeader({
    onBack: () => {
      if (active) goBackTo('/');
    },
  });
  const title = h('h1', { id: 'craque-title', class: 'display section-title', tabindex: '-1', 'data-screen-title': true }, 'Craque');
  const intro = h('p', { class: 'craque-intro', hidden: true });
  const card = createProfileCard({ email: organizer?.email, onEdit: startEditing });
  const body = h('div', { class: 'craque-body' });

  mount.append(
    h(
      'div',
      { class: 'screen' },
      header.el,
      h(
        'main',
        { class: 'screen-main roster-screen' },
        h(
          'section',
          { class: 'card roster-card', 'aria-labelledby': 'craque-title' },
          h('div', { class: 'card-header craque-header' }, title, intro),
          body,
        ),
      ),
    ),
  );

  // Só troca o conteúdo quando o modo muda, para não apagar o que foi digitado (research §6 da 006).
  function render(state) {
    const next = state.profile === undefined ? 'loading' : !state.profile ? 'form' : editing ? 'edit' : 'card';
    if (next !== mode) {
      mode = next;
      intro.textContent = INTRO[mode] ?? '';
      intro.hidden = !INTRO[mode];
      if (mode === 'form' || mode === 'edit') {
        const form = createProfileForm({
          feet: rules.dominantFeet,
          editing: mode === 'edit',
          onSubmit: saveProfile,
          onCancel: cancelEditing,
        });
        if (mode === 'edit') form.fill(state.profile);
        body.replaceChildren(form.el);
        // Quem tocou em "Editar perfil" perdeu o botão: o foco vai para o título, sem abrir o teclado.
        if (mode === 'edit') title.focus();
      } else {
        body.replaceChildren(...(mode === 'card' ? [card.el] : []));
      }
    }
    if (mode === 'card') {
      card.update(state.profile);
      if (focusEdit) {
        focusEdit = false;
        card.focus();
      }
    }
  }

  const unsubscribe = store.subscribe(render);
  render(store.getState());
  loadProfile();

  return () => {
    active = false;
    unsubscribe();
  };
}
