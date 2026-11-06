import { createDrawBar } from './components/draw-bar/drawBar.js';
import { createHeader } from './components/header/header.js';
import { createPlayerForm } from './components/player-form/playerForm.js';
import { createRoster } from './components/roster/roster.js';
import { createScreenActions } from './screenActions.js';
import * as rosterApi from './services/rosterApi.js';
import { h } from './utils/dom.js';
import { missingPlayersText, presentCountText } from './utils/format.js';
import { clearNotice } from './utils/notice.js';
import { ratingLevels } from './utils/rules.js';
import { routeAfterDraw } from './utils/screens.js';

// Mantém o foco no mesmo controle depois que a lista é redesenhada.
function preserveFocus(update) {
  const key = document.activeElement?.dataset?.focusKey;
  update();
  if (key) document.querySelector(`[data-focus-key="${CSS.escape(key)}"]`)?.focus();
}

// Tela Elenco (#/): primeira tela depois de entrar, com o cabeçalho fixo no alto e o botão de
// sortear fixo embaixo.
export function rosterView({ mount, store, navigate }) {
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

  // Depois de mexer no elenco, o aviso de quantos faltam some (FR-009). O sorteio é lido de novo
  // quando a tela de times abre, já com o aviso de lista alterada (FR-031 da 001).
  function afterRosterChange(roster) {
    store.setState({ roster, shortfall: null });
  }

  async function saveRoster(request) {
    try {
      afterRosterChange(await request());
      clearNotice();
    } catch (error) {
      actions.handleError(error);
    }
  }

  // Com times, abre a tela de times (FR-007); sem, fica aqui com o aviso (FR-008).
  async function drawTeams() {
    const draw = await actions.drawTeams();
    if (active && draw && routeAfterDraw(draw) === '/times') navigate('/times');
  }

  const header = createHeader({ onLogout: actions.logout });
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
  const roster = createRoster({
    form: form.el,
    levels,
    onRating: (player, rating) => saveRoster(() => rosterApi.updatePlayer(player.id, { rating })),
    onTogglePresence: (player) => saveRoster(() => rosterApi.setPresence(player.id, !player.present)),
    onRemove: (player) => saveRoster(() => rosterApi.removePlayer(player.id)),
    onAllPresent: () => saveRoster(() => rosterApi.setAllPresence(true)),
    onClearPresence: () => saveRoster(() => rosterApi.setAllPresence(false)),
  });
  const drawBar = createDrawBar({ label: 'Sortear times', onDraw: drawTeams });

  mount.append(
    h('div', { class: 'screen' }, header.el, h('main', { class: 'screen-main roster-screen' }, roster.el), drawBar.el),
  );

  const render = (state) =>
    preserveFocus(() => {
      roster.update(state);
      drawBar.update({
        countText: state.roster ? presentCountText(state.roster.summary.presentCount) : null,
        shortfallText: Number.isInteger(state.shortfall) ? missingPlayersText(state.shortfall, rules.minTeams) : null,
      });
    });
  const unsubscribe = store.subscribe(render);
  render(store.getState());
  loadRoster();

  return () => {
    active = false;
    unsubscribe();
  };
}
