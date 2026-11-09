// Regras do domínio. Este é o único lugar com estes números (constituição, Princípio III).

export const TEAM_SIZE = 5;
export const MIN_TEAMS = 2;
export const MAX_PLAYERS = 100;
export const NAME_MAX_LENGTH = 40;

export const RATING_MIN = 1;
export const RATING_MAX = 5;
export const DEFAULT_RATING = 3;

export const PASSWORD_MIN_LENGTH = 8;
export const SESSION_DAYS = 30;
export const LOGIN_MAX_FAILURES = 5;
export const LOGIN_LOCK_MINUTES = 15;
export const RESET_TOKEN_MINUTES = 60;
export const RESET_MAX_PER_HOUR = 3;

export const POSITIONS = Object.freeze(['ATA', 'DEF']);

export const VESTS = Object.freeze(['green', 'white', 'orange', 'blue', 'pink', 'purple', 'yellow', 'cyan']);

// Time do MyTeam (feature 005): um por conta, com nome e um ícone desta lista, na ordem da grade.
export const CLUB_ICONS = Object.freeze(['ball', 'shield', 'bolt', 'star', 'crown', 'flame', 'trophy', 'target']);
export const DEFAULT_CLUB_ICON = 'ball';
export const CLUB_NAME_MAX_LENGTH = 40;

// Craque, o perfil de jogador da conta (feature 006). A idade sai da data de nascimento e da data de
// hoje neste fuso; os limites só barram datas digitadas errado.
export const DOMINANT_FEET = Object.freeze(['right', 'left', 'both']);
export const NICKNAME_MAX_LENGTH = 40;
export const PROFILE_MIN_AGE = 5;
export const PROFILE_MAX_AGE = 100;
export const APP_TIME_ZONE = 'America/Sao_Paulo';
