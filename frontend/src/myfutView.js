import { createBackHeader } from './components/header/backHeader.js';
import { createMyfut } from './components/myfut/myfut.js';
import { createPlayerForm } from './components/player-form/playerForm.js';
import { createScreenActions } from './screenActions.js';
import * as rosterApi from './services/rosterApi.js';
import { h, preserveFocus } from './utils/dom.js';
import { clearNotice } from './utils/notice.js';
import { ratingLevels } from './utils/rules.js';

// Tela MyFUT (#/myfut): cadastro dos jogadores do grupo, com nível e posição (US2 da 004).
export function myfutView({ mount, store, navigate, goBackTo }) {
  const { rules } = store.getState();
  const levels = ratingLevels(rules);
  const actions = createScreenActions({ store, navigate });
  let active = true;

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
    onBack: () => {
      if (active) goBackTo('/');
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
  const myfut = createMyfut({
    form: form.el,
    levels,
    onRating: (player, rating) => saveRoster(() => rosterApi.updatePlayer(player.id, { rating })),
    onPosition: (player) =>
      saveRoster(() => rosterApi.updatePlayer(player.id, { position: player.position === 'ATA' ? 'DEF' : 'ATA' })),
    onRemove: (player) => saveRoster(() => rosterApi.removePlayer(player.id)),
  });

  mount.append(h('div', { class: 'screen' }, header.el, h('main', { class: 'screen-main roster-screen' }, myfut.el)));

  const render = (state) => preserveFocus(() => myfut.update(state));
  const unsubscribe = store.subscribe(render);
  render(store.getState());
  loadRoster();

  return () => {
    active = false;
    unsubscribe();
  };
}