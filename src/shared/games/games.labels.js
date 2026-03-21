// shared/games/games.constants.js

import {
  GAME_TYPE,
  GAME_DIFFICULTY,
  GAME_RESULT,
  GAME_HOME_AWAY,
} from './games.constants.js'

const byId = (arr, id) => arr.find((x) => x.id === id) || null

export const typeLabelH = (id) => byId(GAME_TYPE, id)?.labelH || 'אחר'
export const diffLabelH = (id) => byId(GAME_DIFFICULTY, id)?.labelH || '—'
export const resultLabelH = (id) => byId(GAME_RESULT, id)?.labelH || 'לא שוחק'
export const homeLabelH = (id) => byId(GAME_HOME_AWAY, id)?.labelH || '—'
