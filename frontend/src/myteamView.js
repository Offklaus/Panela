import { createBackHeader } from './components/header/backHeader.js';
import { createClubCard } from './components/myteam/clubCard.js';
import { createClubForm } from './components/myteam/clubForm.js';
import { createScreenActions } from './screenActions.js';
import * as clubApi from './services/clubApi.js';
import * as rosterApi from './services/rosterApi.js';
import { h } from './utils/dom.js';

// Tela MyTeam (#/myteam): o card do time ou, sem time, o "Criar time" (US1 e US2 da 005).
export function myteamView({ mount, store, navigate, goBackTo }) {
  const { rules } = store.getState();
  const actions = createScreenActions({ store, navigate });
  let active = true;
  let mode = null;
  let justCreated = false;

  async function loadClub() {
    try {
      const { club } = await clubApi.getClub();
      if (active) store.setState({ club });
    } catch (error) {
      actions.handleError(error);
    }
  }

  async function loadRoster() {
    try {
      const roster = await rosterApi.getRoster();
      if (active) store.setState({ roster });
    } catch (error) {
      actions.handleError(error);
    }
  }

  // Duas abas ou toque duplo: a conta já tem time, então mostra o que existe (edge case da 005).
  async function createClub(input) {
    try {
      const { club } = await clubApi.createClub(input);
      justCreated = true;
      store.setState({ club });
      // Sem time o elenco vinha vazio; com o time, os jogadores da conta voltam (FR-019).
      loadRoster();
    } catch (error) {
      if (error.code === 'UNAUTHENTICATED') {
        error.handled = true;
        actions.signOut();
      } else if (error.code === 'CLUB_EXISTS') {
        error.handled = true;
        await loadClub();
      }
      throw error;
    }
  }

  const header = createBackHeader({
    onBack: () => {
      if (active) goBackTo('/');
    },
  });
  const intro = h(
    'p',
    { class: 'club-intro', hidden: true },
    'Você ainda não tem um time. Crie o time do seu grupo para montar o elenco.',
  );
  const form = createClubForm({ icons: rules.clubIcons, onSubmit: createClub });
  const card = createClubCard();
  const body = h('div', { class: 'club-body' });

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
          { class: 'card roster-card', 'aria-labelledby': 'myteam-title' },
          h(
            'div',
            { class: 'card-header myteam-header' },
            h('h1', { id: 'myteam-title', class: 'display section-title', tabindex: '-1', 'data-screen-title': true }, 'MyTeam'),
            intro,
          ),
          body,
        ),
      ),
    ),
  );

  // Só troca o conteúdo quando muda de "sem time" para "com time", para não apagar o que foi digitado.
  function render(state) {
    const next = state.club === undefined ? 'loading' : state.club ? 'card' : 'form';
    if (next !== mode) {
      mode = next;
      intro.hidden = mode !== 'form';
      body.replaceChildren(...(mode === 'form' ? [form.el] : mode === 'card' ? [card.el] : []));
      if (mode === 'card' && justCreated) card.el.focus();
    }
    if (mode === 'card') card.update({ club: state.club, playerCount: state.roster?.players.length });
  }

  const unsubscribe = store.subscribe(render);
  render(store.getState());
  loadClub();
  loadRoster();

  return () => {
    active = false;
    unsubscribe();
  };
}