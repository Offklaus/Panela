import { MAX_PLAYERS, TEAM_SIZE } from '../config/domain.js';
import * as drawModel from '../models/drawModel.js';
import * as organizerModel from '../models/organizerModel.js';
import * as playerModel from '../models/playerModel.js';
import { AppError } from '../utils/AppError.js';
import {
  toNameKey,
  validateNewPlayer,
  validatePlayerId,
  validatePlayerUpdate,
  validatePresent,
} from '../validators/playerValidator.js';

const notFound = () => new AppError(404, 'NOT_FOUND', 'Jogador não encontrado.');
const nameTaken = () =>
  new AppError(409, 'NAME_TAKEN', 'Já existe um jogador com esse nome no elenco.', { field: 'name' });
const rosterFull = () => new AppError(409, 'ROSTER_FULL', `O elenco já tem ${MAX_PLAYERS} jogadores.`);

export function createRosterService({ db, now }) {
  async function getRosterState(organizerId) {
    const players = await playerModel.listByOrganizer(db, organizerId);
    const present = players.filter((player) => player.present);
    const totalRating = present.reduce((sum, player) => sum + player.rating, 0);

    return {
      players,
      summary: {
        presentCount: present.length,
        possibleTeams: Math.floor(present.length / TEAM_SIZE),
        averageRating: present.length > 0 ? totalRating / present.length : null,
      },
      drawStale: await drawModel.isStale(db, organizerId),
    };
  }

  // Toda alteração roda numa transação com o organizador travado (limite de jogadores e nome repetido
  // valem mesmo com pedidos simultâneos), marca o sorteio como desatualizado (FR-031) e devolve o elenco.
  async function mutate(organizerId, change) {
    await db.transaction(async (tx) => {
      await organizerModel.lock(tx, organizerId);
      await change(tx);
      await drawModel.setStale(tx, organizerId);
    });
    return getRosterState(organizerId);
  }

  return {
    getRosterState,

    async addPlayer(organizerId, input) {
      const { name, rating } = validateNewPlayer(input);
      const nameKey = toNameKey(name);
      return mutate(organizerId, async (tx) => {
        if ((await playerModel.countByOrganizer(tx, organizerId)) >= MAX_PLAYERS) throw rosterFull();
        if (await playerModel.findByNameKey(tx, organizerId, nameKey)) throw nameTaken();
        await playerModel.insert(tx, { organizerId, name, nameKey, rating, createdAt: now().toISOString() });
      });
    },

    async updatePlayer(organizerId, playerIdParam, input) {
      const playerId = validatePlayerId(playerIdParam);
      const changes = validatePlayerUpdate(input);
      return mutate(organizerId, async (tx) => {
        if (!(await playerModel.findByIdForOrganizer(tx, organizerId, playerId))) throw notFound();
        if (changes.rating !== undefined) await playerModel.updateRating(tx, organizerId, playerId, changes.rating);
        if (changes.present !== undefined) await playerModel.updatePresent(tx, organizerId, playerId, changes.present);
      });
    },

    async removePlayer(organizerId, playerIdParam) {
      const playerId = validatePlayerId(playerIdParam);
      return mutate(organizerId, async (tx) => {
        if (!(await playerModel.remove(tx, organizerId, playerId))) throw notFound();
      });
    },

    async setAllPresent(organizerId, input) {
      const present = validatePresent(input?.present);
      return mutate(organizerId, (tx) => playerModel.setAllPresent(tx, organizerId, present));
    },
  };
}
