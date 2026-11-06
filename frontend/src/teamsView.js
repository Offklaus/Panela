import { createBench } from './components/bench/bench.js';
import { createDrawBar } from './components/draw-bar/drawBar.js';
import { createBackHeader } from './components/header/backHeader.js';
import { createTeams } from './components/teams/teams.js';
import { createScreenActions } from './screenActions.js';
import * as drawApi from './services/drawApi.js';
import { h } from './utils/dom.js';
import { ratingLevels } from './utils/rules.js';
import { hasTeams } from './utils/screens.js';

// Tela Times (#/times): o último sorteio, com "Sortear de novo" fixo embaixo.
export function teamsView({ mount, store, navigate, goBackTo }) {
  const { rules } = store.getState();
  const actions = createScreenActions({ store, navigate });
  let active = true;

  const backToRoster = () => {
    if (active) goBackTo('/');
  };

  // Com times, o novo sorteio fica nesta tela; sem, o Elenco mostra quantos faltam (FR-008).
  async function drawAgain() {
    const draw = await actions.drawTeams();
    if (draw && !hasTeams(draw)) backToRoster();
  }

  // Sem um sorteio com times, esta tela não tem o que mostrar (FR-015).
  async function loadDraw() {
    try {
      const { draw } = await drawApi.getDraw();
      store.setState({ draw });
      if (!hasTeams(draw)) backToRoster();
    } catch (error) {
      actions.handleError(error);
    }
  }

  const bench = createBench();
  const teams = createTeams({ levels: ratingLevels(rules), footer: bench.el });
  const drawBar = createDrawBar({ label: 'Sortear de novo', onDraw: drawAgain });

  mount.append(
    h(
      'div',
      { class: 'screen teams-screen on-dark' },
      createBackHeader({ onBack: backToRoster }).el,
      h('main', { class: 'screen-main' }, teams.el),
      drawBar.el,
    ),
  );

  const render = (state) => {
    teams.update(state);
    bench.update(state);
  };
  const unsubscribe = store.subscribe(render);
  render(store.getState());
  drawBar.update();
  loadDraw();

  return () => {
    active = false;
    unsubscribe();
  };
}
