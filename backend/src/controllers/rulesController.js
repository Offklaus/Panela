import {
  CLUB_ICONS,
  DEFAULT_RATING,
  DOMINANT_FEET,
  MIN_TEAMS,
  PASSWORD_MIN_LENGTH,
  RATING_MAX,
  RATING_MIN,
} from '../config/domain.js';

// Só o que a tela precisa para montar estrelas e textos; quem valida continua sendo o backend.
export function createRulesController() {
  return {
    getRules(req, res) {
      res.json({
        rules: {
          ratingMin: RATING_MIN,
          ratingMax: RATING_MAX,
          defaultRating: DEFAULT_RATING,
          passwordMinLength: PASSWORD_MIN_LENGTH,
          minTeams: MIN_TEAMS,
          clubIcons: CLUB_ICONS,
          dominantFeet: DOMINANT_FEET,
        },
      });
    },
  };
}
