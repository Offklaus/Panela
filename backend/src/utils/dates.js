// Datas de calendário como texto "YYYY-MM-DD" (feature 006). Nesse formato, comparar os textos é o
// mesmo que comparar as datas.

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

// A data de `instant` no fuso pedido (por exemplo, "America/Sao_Paulo").
export function localDate(instant, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(instant)
    .reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

// Só aceita "YYYY-MM-DD" de um dia que existe no calendário (nada de 2023-02-29).
export function isValidDate(value) {
  const match = typeof value === 'string' ? DATE_PATTERN.exec(value) : null;
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

// Anos completos em `today`. Quem nasceu em 29/02 faz aniversário em 1º/03 nos anos não bissextos,
// porque "02-28" ainda vem antes de "02-29" (research §3 da 006).
export function ageOn(birthDate, today) {
  const years = Number(today.slice(0, 4)) - Number(birthDate.slice(0, 4));
  return today.slice(5) < birthDate.slice(5) ? years - 1 : years;
}
