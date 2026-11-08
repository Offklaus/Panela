import { MIN_TEAMS, POSITIONS, TEAM_SIZE, VESTS } from '../config/domain.js';
import * as drawModel from '../models/drawModel.js';
import * as organizerModel from '../models/organizerModel.js';
import * as playerModel from '../models/playerModel.js';
import { AppError } from '../utils/AppError.js';
import { hasClub, requireClub } from './clubService.js';
import { balanceTeams } from './teamBalancer.js';

const sumRatings = (players) => players.reduce((sum, player) => sum + player.rating, 0);

const countPositions = (players) =>
  Object.fromEntries(POSITIONS.map((position) => [position, players.filter((player) => player.position === position).length]));

// A posição com menos jogadores do que times entre os que estão nos times, se houver (FR-017 da 003).
function findPositionShortage(teams) {
  for (const position of POSITIONS) {
    const count = teams.reduce((sum, team) => sum + team.positions[position], 0);
    if (count < teams.length) return { position, count, teams: teams.length };
  }
  return null;
}

const positionsMissing = (count) =>
  new AppError(409, 'POSITIONS_MISSING', `Defina a posição de ${count === 1 ? '1 presente' : `${count} presentes`} para sortear.`, {
    extra: { missingPositions: count },
  });

export function createDrawService({ db, rng, now }) {
  // Monta o Draw de contracts/api.md com os dados atuais do elenco; quem foi removido some (FR-032).
  // Sem time não há sorteio, nem um antigo guardado (FR-018 da 005).
  async function getDraw(organizerId) {
    if (!(await hasClub(db, organizerId))) return null;
    const saved = await drawModel.findByOrganizer(db, organizerId);
    if (!saved) return null;

    const playersById = new Map((await playerModel.listByOrganizer(db, organizerId)).map((player) => [player.id, player]));
    const toRefs = (ids) =>
      ids
        .map((id) => playersById.get(id))
        .filter(Boolean)
        .map(({ id, name, rating, position }) => ({ id, name, rating, position }));

    const teams = saved.teams.map((ids, index) => {
      const players = toRefs(ids).sort((a, b) => b.rating - a.rating);
      const total = sumRatings(players);
      return {
        letter: String.fromCharCode(65 + index),
        vest: VESTS[index % VESTS.length],
        players,
        total,
        average: players.length > 0 ? total / players.length : 0,
        positions: countPositions(players),
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
      positionShortage: teams.length > 0 ? findPositionShortage(teams) : null,
    };
  }

  return {
    getDraw,

    // Com o organizador travado, uma alteração simultânea no elenco fica antes ou depois do sorteio,
    // nunca no meio: se vier depois, marca o sorteio como desatualizado.
    async createDraw(organizerId) {
      await db.transaction(async (tx) => {
        await organizerModel.lock(tx, organizerId);
        await requireClub(tx, organizerId);
        const present = await playerModel.listPresentByOrganizer(tx, organizerId);
        // Com gente para 2 times, todo presente precisa de posição; sem isso, nada é gravado (FR-007 da 003).
        if (present.length >= MIN_TEAMS * TEAM_SIZE) {
          const missing = present.filter((player) => !player.position).length;
          if (missing > 0) throw positionsMissing(missing);
        }
        const { teams, bench } = balanceTeams(present, { teamSize: TEAM_SIZE, minTeams: MIN_TEAMS, rng });
        await drawModel.upsert(tx, { organizerId, createdAt: now().toISOString(), teams, bench });
      });
      return getDraw(organizerId);
    },
  };
}
