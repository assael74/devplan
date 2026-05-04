// playerGames.domain.logic.js

export const GAME_TYPE = [
  { id: 'league', labelH: 'משחק ליגה', idIcon: 'league', color: 'primary', disabled: false },
  { id: 'cup', labelH: 'משחק גביע', idIcon: 'cup', color: 'warning', disabled: false },
  { id: 'friendly', labelH: 'משחק ידידות', idIcon: 'friendly', color: 'neutral', disabled: false },
  { id: 'training', labelH: 'אימון', idIcon: 'training', color: 'neutral', disabled: false },
]

export const GAME_DIFFICULTY = [
  { id: 'easy', labelH: 'רמה קלה', idIcon: 'easy', color: 'success', disabled: false },
  { id: 'equal', labelH: 'אותה רמה', idIcon: 'equal', color: 'warning', disabled: false },
  { id: 'hard', labelH: 'רמה קשה', idIcon: 'hard', color: 'danger', disabled: false },
]

export const GAME_RESULT = [
  { id: 'win', labelH: 'ניצחון', idIcon: 'win', color: 'success', disabled: false },
  { id: 'draw', labelH: 'תיקו', idIcon: 'draw', color: 'warning', disabled: false },
  { id: 'loss', labelH: 'הפסד', idIcon: 'loss', color: 'danger', disabled: false },
]

export const GAME_HOME_AWAY = [
  { id: 'home', labelH: 'בית', idIcon: 'home', color: 'success', disabled: false },
  { id: 'away', labelH: 'חוץ', idIcon: 'away', color: 'danger', disabled: false },
]

export const GAME_STATUS = [
  { id: 'scheduled', labelH: 'מתוכנן', idIcon: 'calendar', color: 'neutral', disabled: false },
  { id: 'played', labelH: 'שוחק', idIcon: 'played', color: 'success', disabled: false },
  { id: 'postponed', labelH: 'נדחה', idIcon: 'time', color: 'warning', disabled: false },
  { id: 'canceled', labelH: 'בוטל', idIcon: 'canceled', color: 'danger', disabled: false },
]

const createGameMetaMap = (items = []) => {
  return items.reduce((acc, item) => {
    acc[item.id] = item
    return acc
  }, {})
}

export const GAME_STATUS_MAP = createGameMetaMap(GAME_STATUS)

export const resolveGameStatusMeta = (value, fallback = 'scheduled') => {
  const statusId =
    typeof value === 'object'
      ? value?.gameStatus || value?.id
      : value

  return GAME_STATUS_MAP[statusId] || GAME_STATUS_MAP[fallback] || {
    id: fallback,
    labelH: 'מתוכנן',
    idIcon: 'calendar',
    color: 'neutral',
    disabled: false,
  }
}

export const isGamePlayed = (game = {}) => {
  return game?.gameStatus === 'played'
}
