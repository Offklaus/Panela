import { createBackHeader } from './components/header/backHeader.js';
import { createClubRoster } from './components/myteam/clubRoster.js';
import { createPlayerForm } from './components/player-form/playerForm.js';
import { createScreenActions } from './screenActions.js';
import * as clubApi from './services/clubApi.js';
import * as rosterApi from './services/rosterApi.js';
import { h, preserveFocus } from './utils/dom.js';
import { clearNotice } from './utils/notice.js';
import { ratingLevels } from './utils/rules.js';

// Elenco do time (#/myteam/elenco): cadastro dos jogadores com nível e posição, como o MyFUT da 004,
// com o time no título e "Convocar jogador" em breve (US2 da 005).
export function clubRosterView({ mount, store, navigate, goBackTo }) {
  const { rules } = store.getState();
  const levels = ratingLevels(rules);
  const actions = createScreenActions({ store, navigate });
  let active = true;

  // Sem time não há elenco do time: vai para o "Criar time" sem deixar esta tela no histórico (FR-011).
  async function loadClub() {
    try {
      const { club } = await clubApi.getClub();
      if (!active) return;
      store.setState({ club });
      if (!club) location.replace('#/myteam');
    } catch (error) {
      actions.handleError(error);
    }
  }

  async function loadRoster() {
    try {
      store.setState({ roster: await rosterApi.getRoster() });
    } catch (error) {
      actions.handleError(error);
    }
  }

  // Mexer no grupo apaga os avisos do botão de sortear, que ficam desatualizados (FR-009 da 002).
  function afterRosterChange(roster) {
    store.setState({ roster, shortfall: null, pendingPositions: null });
  }

  async function saveRoster(request) {
    try {
      afterRosterChange(await request());
      clearNotice();
    } catch (error) {
      actions.handleError(error);
    }
  }

  const header = createBackHeader({
    label: 'MyTeam',
    ariaLabel: 'Voltar ao MyTeam',
    onBack: () => {
      if (active) goBackTo('/myteam');
    },
  });
  const form = createPlayerForm({
    levels,
    defaultRating: rules.defaultRating,
    onSubmit: async (player) => {
      try {
        afterRosterChange(await rosterApi.addPlayer(player));
      } catch (error) {
        if (error.code === 'UNAUTHENTICATED') {
          error.handled = true;
          actions.signOut();
        }
        throw error;
      }
    },
  });
  const clubRoster = createClubRoster({
    form: form.el,
    levels,
    onRating: (player, rating) => saveRoster(() => rosterApi.updatePlayer(player.id, { rating })),
    onPosition: (player) =>
      saveRoster(() => rosterApi.updatePlayer(player.id, { position: player.position === 'ATA' ? 'DEF' : 'ATA' })),
    onRemove: (player) => saveRoster(() => rosterApi.removePlayer(player.id)),
  });

  mount.append(h('div', { class: 'screen' }, header.el, h('main', { class: 'screen-main roster-screen' }, clubRoster.el)));

  const render = (state) => preserveFocus(() => clubRoster.update(state));
  const unsubscribe = store.subscribe(render);
  render(store.getState());
  loadClub();
  loadRoster();

  return () => {
    active = false;
    unsubscribe();
  };
}