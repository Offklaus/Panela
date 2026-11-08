import { createDrawBar } from './components/draw-bar/drawBar.js';
import { createHeader } from './components/header/header.js';
import { createRoster } from './components/roster/roster.js';
import { createScreenActions } from './screenActions.js';
import * as clubApi from './services/clubApi.js';
import * as rosterApi from './services/rosterApi.js';
import { h, preserveFocus } from './utils/dom.js';
import { missingPlayersText, pendingPositionsText, presentCountText } from './utils/format.js';
import { clearNotice } from './utils/notice.js';
import { ratingLevels } from './utils/rules.js';
import { routeAfterDraw } from './utils/screens.js';

const MYTEAM_LINK = { href: '#/myteam/elenco', text: 'Abrir MyTeam' };

// Tela Elenco (#/): o dia do jogo. Mostra os jogadores do elenco do time para marcar presença e
// sortear; o cadastro fica no MyTeam (US3 da 004 e da 005). Sem time, leva a "Criar time" (US4 da 005).
export function rosterView({ mount, store, navigate }) {
  const { rules, organizer } = store.getState();
  const levels = ratingLevels(rules);
  const actions = createScreenActions({ store, navigate });
  let active = true;

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
      store.setState({ roster: await rosterApi.getRoster() });
    } catch (error) {
      actions.handleError(error);
    }
  }

  // Depois de mexer na presença, o aviso de quantos faltam some (FR-009 da 002). O sorteio é lido
  // de novo quando a tela de times abre, já com o aviso de lista alterada (FR-031 da 001).
  async function saveRoster(request) {
    try {
      store.setState({ roster: await request(), shortfall: null, pendingPositions: null });
      clearNotice();
    } catch (error) {
      actions.handleError(error);
    }
  }

  // Com times, abre a tela de times (FR-007 da 002); sem, fica aqui com o aviso (FR-008 da 002).
  async function drawTeams() {
    const draw = await actions.drawTeams();
    if (active && draw && routeAfterDraw(draw) === '/times') navigate('/times');
  }

  const header = createHeader({ email: organizer?.email, onLogout: actions.logout });
  const roster = createRoster({
    levels,
    onTogglePresence: (player) => saveRoster(() => rosterApi.setPresence(player.id, !player.present)),
    onAllPresent: () => saveRoster(() => rosterApi.setAllPresence(true)),
    onClearPresence: () => saveRoster(() => rosterApi.setAllPresence(false)),
  });
  const drawBar = createDrawBar({ label: 'Sortear times', onDraw: drawTeams });

  mount.append(
    h('div', { class: 'screen' }, header.el, h('main', { class: 'screen-main roster-screen' }, roster.el), drawBar.el),
  );

  // Posição pendente se resolve no elenco do time, então o aviso leva até lá (FR-014 da 005). Sem time
  // não há o que sortear, então o rodapé some (FR-017 da 005).
  const render = (state) =>
    preserveFocus(() => {
      roster.update(state);
      drawBar.el.hidden = state.club === null;
      const pending = Number.isInteger(state.pendingPositions);
      drawBar.update({
        countText: state.roster ? presentCountText(state.roster.summary.presentCount) : null,
        shortfallText: pending
          ? pendingPositionsText(state.pendingPositions)
          : Number.isInteger(state.shortfall)
            ? missingPlayersText(state.shortfall, rules.minTeams)
            : null,
        noticeLink: pending ? MYTEAM_LINK : null,
      });
    });
  const unsubscribe = store.subscribe(render);
  render(store.getState());
  loadClub();
  loadRoster();

  return () => {
    active = false;
    header.close();
    unsubscribe();
  };
}