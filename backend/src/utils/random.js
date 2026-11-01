// Aleatoriedade injetável (constituição, Princípio III): produção usa Math.random, testes usam semente.

export const defaultRng = () => Math.random();

// mulberry32: gerador pequeno e determinístico para testes.
export function createSeededRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInt(rng, max) {
  return Math.floor(rng() * max);
}

// Fisher–Yates sobre uma cópia.
export function shuffle(list, rng) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(rng, i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
