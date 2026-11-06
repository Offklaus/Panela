import { createBench } from './components/bench/bench.js';
import { createHeader } from './components/header/header.js';
import { createPlayerForm } from './components/player-form/playerForm.js';
import { createRoster } from './components/roster/roster.js';
import { createTeams } from './components/teams/teams.js';
import * as authApi from './services/authApi.js';
import * as drawApi from './services/drawApi.js';
import * as rosterApi from './services/rosterApi.js';
import { h } from './utils/dom.js';
import { clearNotice, showNotice } from './utils/notice.js';
import { ratingLevels } from './utils/rules.js';

// Mantém o foco no mesmo controle depois que a lista é redesenhada.
function preserveFocus(update) {
  const key = document.activeElement?.dataset?.focusKey;
  update();
  if (key) document.querySelector(`[data-focus-key="${CSS.escape(key)}"]`)?.focus();
}

export function homeView({ mount, store, navigate }) {
  const { rules } = store.getState();
  const levels = ratingLevels(rules);

  function signOut() {
    store.setState({ organizer: null, roster: null, draw: null });
    navigate('/entrar');
  }

  // Sessão vencida volta para "Entrar"; o resto vira aviso. Nada muda na tela sem o backend confirmar (FR-035).
  function handleError(error) {
    if (error.code === 'UNAUTHENTICATED') {
      error.handled = true;
      signOut();
      return;
    }
    showNotice(error.message);
  }

  async function refreshDraw() {
    try {
      const { draw } = await drawApi.getDraw();
      store.setState({ draw });
    } catch (error) {
      handleError(error);
    }
  }

  // Depois de mexer no elenco, o sorteio vem de novo do backend: aviso de lista alterada e removidos (FR-031, FR-032).
  async function afterRosterChange(roster) {
    store.setState({ roster });
    if (store.getState().draw) await refreshDraw();
  }

  async function saveRoster(request) {
    try {
      await afterRosterChange(await request());
      clearNotice();
    } catch (error) {
      handleError(error);
    }
  }

  async function drawTeams() {
    try {
      const { draw } = await drawApi.createDraw();
      store.setState({ draw });
      clearNotice();
    } catch (error) {
      handleError(error);
    }
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch (error) {
      if (error.code !== 'UNAUTHENTICATED') {
        showNotice(error.message);
        return;
      }
    }
    signOut();
  }

  const header = createHeader({ onLogout: logout });
  const form = createPlayerForm({
    levels,
    defaultRating: rules.defaultRating,
    onSubmit: async (player) => {
      try {
        await afterRosterChange(await rosterApi.addPlayer(player));
      } catch (error) {
        if (error.code === 'UNAUTHENTICATED') {
          error.handled = true;
          signOut();
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

  const bench = createBench();
  const teams = createTeams({ levels, minTeams: rules.minTeams, onDraw: drawTeams, footer: bench.el });

  mount.append(
    h(
      'div',
      { class: 'page' },
      h('div', { class: 'container' }, header.el, h('div', { class: 'columns' }, roster.el, teams.el)),
    ),
  );

  const render = (state) =>
    preserveFocus(() => {
      header.update(state);
      roster.update(state);
      teams.update(state);
      bench.update(state);
    });
  const unsubscribe = store.subscribe(render);
  render(store.getState());
  saveRoster(() => rosterApi.getRoster());
  refreshDraw();

  return unsubscribe;
}
