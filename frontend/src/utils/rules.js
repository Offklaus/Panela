// Níveis que a tela oferece, a partir das regras que vêm do backend (GET /api/rules).
export function ratingLevels({ ratingMin, ratingMax }) {
  return Array.from({ length: ratingMax - ratingMin + 1 }, (_, index) => ratingMin + index);
}
