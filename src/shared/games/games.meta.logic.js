
import {
  GAME_TYPE,
  GAME_DIFFICULTY,
  GAME_RESULT,
  GAME_HOME_AWAY,
} from './games.constants.js'

const safeArray = (v) => (Array.isArray(v) ? v : [])
const normalizeColor = (color) => color || 'neutral'

export const findConstItem = (arr, id) => {
  return safeArray(arr).find((item) => item?.id === id) || null
}

export const resolveTypeMeta = (id) => {
  const found = findConstItem(GAME_TYPE, id)
  return {
    id: found?.id || id || '',
    labelH: found?.labelH || id || 'אחר',
    idIcon: found?.idIcon || 'game',
    color: normalizeColor(found?.color),
  }
}

export const resolveDifficultyMeta = (id) => {
  const found = findConstItem(GAME_DIFFICULTY, id)
  return {
    id: found?.id || id || '',
    labelH: found?.labelH || id || '—',
    idIcon: found?.idIcon || 'difficulty',
    color: normalizeColor(found?.color),
  }
}

export const resolveResultMeta = (id) => {
  const found = findConstItem(GAME_RESULT, id)
  return {
    id: found?.id || id || '',
    labelH: found?.labelH || id || 'לא שוחק',
    idIcon: found?.idIcon || 'result',
    color: normalizeColor(found?.color),
  }
}

export const resolveHomeMeta = (id) => {
  const found = findConstItem(GAME_HOME_AWAY, id)
  return {
    id: found?.id || id || '',
    labelH: found?.labelH || id || '—',
    idIcon: found?.idIcon || 'home',
    color: normalizeColor(found?.color),
  }
}
