import { randomInt, shuffle } from '../utils/random.js';

// Sorteio puro (research.md §9 da 001; §4 a §6 da 003). Recebe [{ id, rating, position }] e devolve
// ids por time e no banco.
export function balanceTeams(players, { teamSize, minTeams, rng }) {
  const teamCount = Math.floor(players.length / teamSize);
  if (teamCount < minTeams) {
    return { teams: [], bench: players.map((player) => player.id) };
  }

  // 1. Banco: segue um embaralhamento uniforme, mas pula quem deixaria a própria posição com menos
  //    jogadores do que times (FR-010 e FR-011 da 003). Sem posição no limite, cada presente tem a
  //    mesma chance, como antes (FR-021 da 001).
  const shuffled = shuffle(players, rng);
  const benchSize = players.length - teamCount * teamSize;
  const benchQuota = new Map();
  for (const player of players) benchQuota.set(player.position, (benchQuota.get(player.position) ?? 0) + 1);
  for (const [position, count] of benchQuota) benchQuota.set(position, Math.max(0, count - teamCount));
  const bench = [];
  const playing = [];
  for (const player of shuffled) {
    if (bench.length < benchSize && benchQuota.get(player.position) > 0) {
      bench.push(player);
      benchQuota.set(player.position, benchQuota.get(player.position) - 1);
    } else {
      playing.push(player);
    }
  }

  // 2. Vagas de cada posição em cada time: atacantes e defensores por igual (FR-012 da 003).
  const teams = Array.from({ length: teamCount }, () => ({ players: [], total: 0, slots: {} }));
  assignPositionSlots(teams, playing, rng);

  // 3. Divisão gulosa: maior nível primeiro (a ordenação estável mantém os empates em ordem aleatória),
  //    cada um para o time de menor total que ainda tem vaga na posição dele.
  playing.sort((a, b) => b.rating - a.rating);
  for (const player of playing) {
    const team = pickLightestOpenTeam(teams, player.position, rng);
    team.players.push(player);
    team.total += player.rating;
    team.slots[player.position] -= 1;
  }

  // 4. Refinamento: troca jogadores da mesma posição enquanto alguma troca diminuir a diferença entre
  //    dois times (FR-013 da 003).
  refine(teams, rng);

  return {
    teams: teams.map((team) => team.players.map((player) => player.id)),
    bench: bench.map((player) => player.id),
  };
}

// Cada posição recebe ⌊quantidade ÷ times⌋ vagas por time e uma a mais em (quantidade mod times) times.
// Os times das vagas extras são sorteados, e a posição seguinte continua de onde a anterior parou: como
// ATA + DEF = times × tamanho, cada time fica com exatamente uma vaga extra ou nenhuma.
function assignPositionSlots(teams, playing, rng) {
  const counts = new Map();
  for (const player of playing) counts.set(player.position, (counts.get(player.position) ?? 0) + 1);

  const order = shuffle(
    teams.map((_, index) => index),
    rng,
  );
  let cursor = 0;
  for (const [position, count] of counts) {
    for (const team of teams) team.slots[position] = Math.floor(count / teams.length);
    for (let extra = count % teams.length; extra > 0; extra--) {
      teams[order[cursor % teams.length]].slots[position] += 1;
      cursor += 1;
    }
  }
}

function pickLightestOpenTeam(teams, position, rng) {
  let candidates = [];
  for (const team of teams) {
    if (!(team.slots[position] > 0)) continue;
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

// Só troca jogadores da mesma posição, para não desfazer a divisão do passo 2.
function swapBest(x, y, rng) {
  const difference = x.total - y.total;
  if (difference === 0) return false;

  let bestGap = Math.abs(difference);
  let options = [];
  for (let a = 0; a < x.players.length; a++) {
    for (let b = 0; b < y.players.length; b++) {
      if (x.players[a].position !== y.players[b].position) continue;
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
