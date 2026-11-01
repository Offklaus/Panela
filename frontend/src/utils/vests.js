// Cor e rótulo de cada colete. A ordem dos coletes é decidida no backend.
const VESTS = {
  green: { color: '#33FF00', label: 'Colete verde' },
  white: { color: '#F5F5F1', label: 'Colete branco' },
  orange: { color: '#FFB020', label: 'Colete laranja' },
  blue: { color: '#4DA3FF', label: 'Colete azul' },
  pink: { color: '#FF5C8A', label: 'Colete rosa' },
  purple: { color: '#B18CFF', label: 'Colete roxo' },
  yellow: { color: '#FFE14D', label: 'Colete amarelo' },
  cyan: { color: '#5CE1E6', label: 'Colete ciano' },
};

export function vestInfo(key) {
  return VESTS[key] ?? { color: '#B9C6BC', label: 'Colete' };
}
