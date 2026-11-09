// Formatação para a tela em pt-BR. Nenhuma regra de negócio aqui (constituição, Princípio II).

export function formatDecimal(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '–';
  return value.toFixed(1).replace('.', ',');
}

export function initials(name) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = [...parts[0]];
  const second = parts.length > 1 ? [...parts.at(-1)][0] : (first[1] ?? '');
  return (first[0] + second).toLocaleUpperCase('pt-BR');
}

export function starsText(count) {
  return count === 1 ? '1 estrela' : `${count} estrelas`;
}

export function missingPlayersText(count, minTeams) {
  return count === 1
    ? `Falta 1 jogador para fechar ${minTeams} times.`
    : `Faltam ${count} jogadores para fechar ${minTeams} times.`;
}

export function playerCountText(count) {
  if (count === 0) return 'Nenhum jogador';
  return count === 1 ? '1 jogador' : `${count} jogadores`;
}

export function ageText(age) {
  return age === 1 ? '1 ano' : `${age} anos`;
}

// Nomes das pernas que vêm em `rules.dominantFeet` (feature 006).
const FOOT_WORDS = { right: 'Direita', left: 'Esquerda', both: 'Ambas' };

export function footText(foot) {
  return FOOT_WORDS[foot] ?? foot;
}

export function presentCountText(count) {
  return count === 1 ? '1 presente' : `${count} presentes`;
}

export function passwordHintText(minLength) {
  return `Mínimo de ${minLength} caracteres.`;
}

export function positionCountText(positions) {
  return `${positions.ATA} ATA · ${positions.DEF} DEF`;
}

export function pendingPositionsText(count) {
  return `Defina a posição de ${count === 1 ? '1 presente' : `${count} presentes`} para sortear.`;
}

const POSITION_WORDS = { ATA: ['atacante', 'atacantes'], DEF: ['defensor', 'defensores'] };

export function positionShortageText({ position, count, teams }) {
  const [singular, plural] = POSITION_WORDS[position];
  if (count === 0) return `Nenhum ${singular} para ${teams} times.`;
  return `Só ${count} ${count === 1 ? singular : plural} para ${teams} times.`;
}