import * as authApi from './services/authApi.js';
import * as drawApi from './services/drawApi.js';
import { clearNotice, showNotice } from './utils/notice.js';
import { hasTeams } from './utils/screens.js';

// O que as telas Elenco e Times fazem igual: sessão vencida, sair e sortear.
export function createScreenActions({ store, navigate }) {
  function signOut() {
    store.setState({ organizer: null, roster: null, draw: null, shortfall: null, pendingPositions: null });
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

  // Sem times, guarda quantos jogadores faltam para o aviso do Elenco (research §4).
  async function drawTeams() {
    try {
      const { draw } = await drawApi.createDraw();
      store.setState({ draw, shortfall: hasTeams(draw) ? null : draw.missingPlayers, pendingPositions: null });
      clearNotice();
      return draw;
    } catch (error) {
      // Presentes sem posição: o aviso fica no Elenco, acima do botão (FR-007 da 003).
      if (error.code === 'POSITIONS_MISSING') {
        store.setState({ pendingPositions: error.missingPositions, shortfall: null });
        return null;
      }
      handleError(error);
      return null;
    }
  }

  return { signOut, handleError, logout, drawTeams };
}
