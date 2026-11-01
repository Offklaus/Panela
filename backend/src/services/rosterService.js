import { MAX_PLAYERS, TEAM_SIZE } from '../config/domain.js';
import * as drawModel from '../models/drawModel.js';
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
  function getRosterState(organizerId) {
    const players = playerModel.listByOrganizer(db, organizerId);
    const present = players.filter((player) => player.present);
    const totalRating = present.reduce((sum, player) => sum + player.rating, 0);

    return {
      players,
      summary: {
        presentCount: present.length,
        possibleTeams: Math.floor(present.length / TEAM_SIZE),
        averageRating: present.length > 0 ? totalRating / present.length : null,
      },
      drawStale: drawModel.isStale(db, organizerId),
    };
  }

  // Toda alteração roda numa transação, marca o sorteio como desatualizado (FR-031) e devolve o elenco.
  function mutate(organizerId, change) {
    db.transaction(() => {
      change();
      drawModel.setStale(db, organizerId);
    })();
    return getRosterState(organizerId);
  }

  return {
    getRosterState,

    addPlayer(organizerId, input) {
      const { name, rating } = validateNewPlayer(input);
      const nameKey = toNameKey(name);
      return mutate(organizerId, () => {
        if (playerModel.countByOrganizer(db, organizerId) >= MAX_PLAYERS) throw rosterFull();
        if (playerModel.findByNameKey(db, organizerId, nameKey)) throw nameTaken();
        playerModel.insert(db, { organizerId, name, nameKey, rating, createdAt: now().toISOString() });
      });
    },

    updatePlayer(organizerId, playerIdParam, input) {
      const playerId = validatePlayerId(playerIdParam);
      const changes = validatePlayerUpdate(input);
      return mutate(organizerId, () => {
        if (!playerModel.findByIdForOrganizer(db, organizerId, playerId)) throw notFound();
        if (changes.rating !== undefined) playerModel.updateRating(db, organizerId, playerId, changes.rating);
        if (changes.present !== undefined) playerModel.updatePresent(db, organizerId, playerId, changes.present);
      });
    },

    removePlayer(organizerId, playerIdParam) {
      const playerId = validatePlayerId(playerIdParam);
      return mutate(organizerId, () => {
        if (!playerModel.remove(db, organizerId, playerId)) throw notFound();
      });
    },

    setAllPresent(organizerId, input) {
      const present = validatePresent(input?.present);
      return mutate(organizerId, () => playerModel.setAllPresent(db, organizerId, present));
    },
  };
}
