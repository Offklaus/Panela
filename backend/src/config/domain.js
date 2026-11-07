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
