import { MIN_TEAMS, TEAM_SIZE, VESTS } from '../config/domain.js';
import * as drawModel from '../models/drawModel.js';
import * as playerModel from '../models/playerModel.js';
import { balanceTeams } from './teamBalancer.js';

const sumRatings = (players) => players.reduce((sum, player) => sum + player.rating, 0);

export function createDrawService({ db, rng, now }) {
  // Monta o Draw de contracts/api.md com os dados atuais do elenco; quem foi removido some (FR-032).
  function getDraw(organizerId) {
    const saved = drawModel.findByOrganizer(db, organizerId);
    if (!saved) return null;

    const playersById = new Map(playerModel.listByOrganizer(db, organizerId).map((player) => [player.id, player]));
    const toRefs = (ids) =>
      ids
        .map((id) => playersById.get(id))
        .filter(Boolean)
        .map(({ id, name, rating }) => ({ id, name, rating }));

    const teams = saved.teams.map((ids, index) => {
      const players = toRefs(ids).sort((a, b) => b.rating - a.rating);
      const total = sumRatings(players);
      return {
        letter: String.fromCharCode(65 + index),
        vest: VESTS[index % VESTS.length],
        players,
        total,
        average: players.length > 0 ? total / players.length : 0,
      };
    });
    const bench = toRefs(saved.bench);
    const totals = teams.map((team) => team.total);

    return {
      createdAt: saved.createdAt,
      stale: saved.stale,
      teamSize: TEAM_SIZE,
      teams,
      bench,
      difference: teams.length > 0 ? Math.max(...totals) - Math.min(...totals) : null,
      missingPlayers: teams.length > 0 ? 0 : Math.max(0, MIN_TEAMS * TEAM_SIZE - bench.length),
    };
  }

  return {
    getDraw,

    createDraw(organizerId) {
      const present = playerModel.listPresentByOrganizer(db, organizerId);
      const { teams, bench } = balanceTeams(present, { teamSize: TEAM_SIZE, minTeams: MIN_TEAMS, rng });
      drawModel.upsert(db, { organizerId, createdAt: now().toISOString(), teams, bench });
      return getDraw(organizerId);
    },
  };
}
