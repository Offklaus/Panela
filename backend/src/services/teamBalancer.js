import { randomInt, shuffle } from '../utils/random.js';

// Sorteio puro (research.md §9). Recebe [{ id, rating }] e devolve ids por time e no banco.
export function balanceTeams(players, { teamSize, minTeams, rng }) {
  const teamCount = Math.floor(players.length / teamSize);
  if (teamCount < minTeams) {
    return { teams: [], bench: players.map((player) => player.id) };
  }

  // 1. Banco: os primeiros de um embaralhamento uniforme; cada presente tem a mesma chance (FR-021).
  const shuffled = shuffle(players, rng);
  const benchSize = players.length - teamCount * teamSize;
  const bench = shuffled.slice(0, benchSize);

  // 2. Divisão gulosa: maior nível primeiro (a ordenação estável mantém os empates em ordem aleatória),
  //    cada um para o time incompleto de menor total.
  const playing = shuffled.slice(benchSize).sort((a, b) => b.rating - a.rating);
  const teams = Array.from({ length: teamCount }, () => ({ players: [], total: 0 }));
  for (const player of playing) {
    const team = pickLightestOpenTeam(teams, teamSize, rng);
    team.players.push(player);
    team.total += player.rating;
  }

  // 3. Refinamento: troca jogadores enquanto alguma troca diminuir a diferença entre dois times (FR-024).
  refine(teams, rng);

  return {
    teams: teams.map((team) => team.players.map((player) => player.id)),
    bench: bench.map((player) => player.id),
  };
}

function pickLightestOpenTeam(teams, teamSize, rng) {
  let candidates = [];
  for (const team of teams) {
    if (team.players.length >= teamSize) continue;
    const best = candidates[0];
    if (
      !best ||
      team.total < best.total ||
      (team.total === best.total && team.players.length < best.players.length)
    ) {
      candidates = [team];
    } else if (team.total === best.total && team.players.length === best.players.length) {
      candidates.push(team);
    }
  }
  return candidates[randomInt(rng, candidates.length)];
}

// Cada troca reduz estritamente a soma dos quadrados dos totais, então o laço termina.
function refine(teams, rng) {
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        if (swapBest(teams[i], teams[j], rng)) improved = true;
      }
    }
  }
}

function swapBest(x, y, rng) {
  const difference = x.total - y.total;
  if (difference === 0) return false;

  let bestGap = Math.abs(difference);
  let options = [];
  for (let a = 0; a < x.players.length; a++) {
    for (let b = 0; b < y.players.length; b++) {
      const gap = Math.abs(difference - 2 * (x.players[a].rating - y.players[b].rating));
      if (gap < bestGap) {
        bestGap = gap;
        options = [[a, b]];
      } else if (gap === bestGap && options.length > 0) {
        options.push([a, b]);
      }
    }
  }
  if (options.length === 0) return false;

  const [a, b] = options[randomInt(rng, options.length)];
  const fromX = x.players[a];
  const fromY = y.players[b];
  x.players[a] = fromY;
  y.players[b] = fromX;
  x.total += fromY.rating - fromX.rating;
  y.total += fromX.rating - fromY.rating;
  return true;
}
