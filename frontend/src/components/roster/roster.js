import { clubIcon } from '../../assets/icons/clubIcons.js';
import { h } from '../../utils/dom.js';
import { rosterRow } from './rosterRow.js';

// Elenco do dia do jogo: só presença; o cadastro fica no elenco do time, no MyTeam (FR-013 da 005).
// Sem time, não há elenco: mostra o convite para criar o time (FR-017 da 005).
export function createRoster({ levels, onTogglePresence, onAllPresent, onClearPresence }) {
  const count = h('span', { class: 'roster-count' });
  const list = h('ul', { class: 'roster-list' });
  const empty = h(
    'div',
    { class: 'roster-empty', hidden: true },
    h('p', {}, 'Nenhum jogador ainda.'),
    h('a', { class: 'btn btn-primary', href: '#/myteam' }, 'Abrir MyTeam'),
  );
  const noClub = h(
    'div',
    { class: 'roster-empty roster-no-club', hidden: true },
    h('span', { class: 'club-badge', 'aria-hidden': 'true' }, clubIcon('shield', { size: 30 })),
    h('p', { class: 'roster-no-club-title' }, 'Você ainda não tem um time.'),
    h('p', {}, 'Crie o time no MyTeam e cadastre os jogadores. Só quem está no time aparece aqui para o sorteio.'),
    h('a', { class: 'btn btn-primary', href: '#/myteam' }, 'Criar time'),
  );
  const presenceActions = h(
    'div',
    { class: 'card-actions' },
    h('button', { type: 'button', class: 'btn btn-ghost', onClick: onAllPresent }, 'Todos presentes'),
    h('button', { type: 'button', class: 'btn btn-ghost', onClick: onClearPresence }, 'Limpar'),
  );

  const el = h(
    'section',
    { class: 'card roster-card', 'aria-labelledby': 'roster-title' },
    h(
      'div',
      { class: 'card-header' },
      h('h1', { id: 'roster-title', class: 'display section-title', tabindex: '-1', 'data-screen-title': true }, 'Elenco ', count),
      presenceActions,
    ),
    list,
    empty,
    noClub,
  );

  // `club`: undefined enquanto não foi lido, null sem time. Até saber, nenhum dos avisos aparece.
  return {
    el,
    update(state) {
      const withoutClub = state.club === null;
      const ready = Boolean(state.roster) && state.club !== undefined;
      const players = withoutClub ? [] : (state.roster?.players ?? []);
      count.textContent = ready && !withoutClub ? `· ${players.length}` : '';
      presenceActions.hidden = withoutClub;
      list.replaceChildren(...players.map((player) => rosterRow({ player, ratingMax: levels.at(-1), onTogglePresence })));
      empty.hidden = !ready || withoutClub || players.length > 0;
      noClub.hidden = !withoutClub;
    },
  };
}