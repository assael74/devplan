// shared/games/insights/team/snapshots/teamGames.calculation.js

export const TEAM_GAMES_CALCULATION_MODES = {
  TEAM: 'team',
  GAMES: 'games',
}

export const DEFAULT_TEAM_GAMES_CALCULATION_MODE =
  TEAM_GAMES_CALCULATION_MODES.TEAM

export const normalizeTeamGamesCalculationMode = (mode) => {
  if (mode === TEAM_GAMES_CALCULATION_MODES.GAMES) {
    return TEAM_GAMES_CALCULATION_MODES.GAMES
  }

  return TEAM_GAMES_CALCULATION_MODES.TEAM
}

const getSourceLabel = (mode) => {
  if (mode === TEAM_GAMES_CALCULATION_MODES.GAMES) return 'נתוני משחקים'
  return 'נתוני קבוצה'
}

const getSourceDescription = (mode) => {
  if (mode === TEAM_GAMES_CALCULATION_MODES.GAMES) {
    return 'החישוב מבוצע לפי המשחקים המעודכנים בדאטה בלבד'
  }

  return 'החישוב מבוצע לפי נתוני הקבוצה בלבד'
}

export const buildTeamGamesCalculationState = ({ mode, sources = {} }) => {
  const normalizedMode = normalizeTeamGamesCalculationMode(mode)
  const active = sources?.[normalizedMode] || null

  return {
    mode: normalizedMode,
    source: normalizedMode,
    sourceLabel: getSourceLabel(normalizedMode),
    description: getSourceDescription(normalizedMode),
    active,
    isReady: active?.isReady === true,
  }
}
