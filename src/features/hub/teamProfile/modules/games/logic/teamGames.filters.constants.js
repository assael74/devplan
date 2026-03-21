import {
  GAME_TYPE,
  GAME_DIFFICULTY,
  GAME_RESULT,
  GAME_HOME_AWAY,
} from '../../../../../../shared/games/games.constants.js'

export const TEAM_GAMES_FILTER_KEYS = [
  'search',
  'typeKey',
  'homeKey',
  'resultKey',
  'difficultyKey',
]

export const TEAM_GAMES_OPTION_CONFIG = [
  {
    id: 'typeOptions',
    source: GAME_TYPE,
    getRowValue: (game) => game?.type,
    hideEmpty: false,
  },
  {
    id: 'difficultyOptions',
    source: GAME_DIFFICULTY,
    getRowValue: (game) => game?.difficulty,
    hideEmpty: false,
  },
  {
    id: 'resultOptions',
    source: GAME_RESULT,
    getRowValue: (game) => game?.result,
    hideEmpty: true,
  },
  {
    id: 'homeOptions',
    source: GAME_HOME_AWAY,
    getRowValue: (game) => game?.homeKey,
    hideEmpty: true,
  },
]

export const TEAM_GAMES_INDICATOR_CONFIG = [
  { id: 'type', key: 'typeKey', source: GAME_TYPE, fallbackIcon: 'game' },
  { id: 'home', key: 'homeKey', source: GAME_HOME_AWAY, fallbackIcon: 'home' },
  { id: 'result', key: 'resultKey', source: GAME_RESULT, fallbackIcon: 'result' },
  { id: 'difficulty', key: 'difficultyKey', source: GAME_DIFFICULTY, fallbackIcon: 'difficulty' },
]

export const createInitialTeamGamesFilters = () => ({
  search: '',
  typeKey: '',
  homeKey: '',
  resultKey: '',
  difficultyKey: '',
})
