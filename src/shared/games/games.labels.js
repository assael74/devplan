/// shared/games/games.constants.js

import { GAME_TYPE, GAME_DIFFICULTY } from './games.constants.js'

export const typeLabelH = (id) => GAME_TYPE.find((x) => x.id === id)?.labelH || 'אחר'
export const diffLabelH = (id) => GAME_DIFFICULTY.find((x) => x.id === id)?.labelH || '—'
