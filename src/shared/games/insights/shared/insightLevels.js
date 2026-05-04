// shared/games/insights/shared/insightLevels.js

export const GAME_INSIGHT_LEVELS = {
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
}

export const GAME_INSIGHT_SOURCES = {
  TEAM: 'team',
  TEAM_GAMES: 'teamGames',
  PLAYER_GAMES: 'playerGames',
  PERFORMANCE: 'performance',
}

export const GAME_INSIGHT_LEVEL_META = {
  [GAME_INSIGHT_LEVELS.LIGHT]: {
    id: GAME_INSIGHT_LEVELS.LIGHT,
    label: 'קלה',
    color: 'success',
    tone: 'green',
    source: GAME_INSIGHT_SOURCES.TEAM,
  },
  [GAME_INSIGHT_LEVELS.MEDIUM]: {
    id: GAME_INSIGHT_LEVELS.MEDIUM,
    label: 'בינונית',
    color: 'warning',
    tone: 'orange',
    source: GAME_INSIGHT_SOURCES.TEAM_GAMES,
  },
  [GAME_INSIGHT_LEVELS.HEAVY]: {
    id: GAME_INSIGHT_LEVELS.HEAVY,
    label: 'כבדה',
    color: 'danger',
    tone: 'red',
    source: GAME_INSIGHT_SOURCES.PERFORMANCE,
  },
}

export const getGameInsightLevelMeta = (level) => {
  return GAME_INSIGHT_LEVEL_META[level] || null
}
