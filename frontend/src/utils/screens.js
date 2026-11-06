// Qual tela mostrar depois de um sorteio. Só lê o resultado que a API devolveu (constituição, Princípio II).

export function hasTeams(draw) {
  return Boolean(draw?.teams?.length);
}

export function routeAfterDraw(draw) {
  return hasTeams(draw) ? '/times' : '/';
}
