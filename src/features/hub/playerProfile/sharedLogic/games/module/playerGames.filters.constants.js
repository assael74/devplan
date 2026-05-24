// playerProfile/sharedLogic/games/module/playerGames.filters.constants.js

import {
  GAME_TYPE,
  GAME_DIFFICULTY,
  GAME_RESULT,
  GAME_HOME_AWAY,
} from '../../../../../../shared/games/games.constants.js'

export const PLAYER_GAMES_FILTER_KEYS = [
  'search',
  'typeKey',
  'homeKey',
  'resultKey',
  'difficultyKey',
  'ratingKey',
]

export const PLAYER_GAME_RATING = [
  {
    id: 'positive',
    value: 'positive',
    label: 'יעילות חיובית',
    idIcon: 'scoringRating',
    color: 'success',
  },
  {
    id: 'negative',
    value: 'negative',
    label: 'יעילות שלילית',
    idIcon: 'scoringRating',
    color: 'danger',
  },
]

export const PLAYER_GAMES_OPTION_CONFIG = [
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
  {
    id: 'ratingOptions',
    source: PLAYER_GAME_RATING,
    getRowValue: game => game?.ratingKey,
    hideEmpty: true,
  },
]

export const PLAYER_GAMES_INDICATOR_CONFIG = [
  { id: 'type', key: 'typeKey', source: GAME_TYPE, fallbackIcon: 'game' },
  { id: 'home', key: 'homeKey', source: GAME_HOME_AWAY, fallbackIcon: 'home' },
  { id: 'result', key: 'resultKey', source: GAME_RESULT, fallbackIcon: 'result' },
  { id: 'difficulty', key: 'difficultyKey', source: GAME_DIFFICULTY, fallbackIcon: 'difficulty' },
  { id: 'rating', key: 'ratingKey', source: PLAYER_GAME_RATING, fallbackIcon: 'scoringRating' },
]

export const createInitialPlayerGamesFilters = () => ({
  search: '',
  typeKey: '',
  homeKey: '',
  resultKey: '',
  difficultyKey: '',
  ratingKey: '',
})
