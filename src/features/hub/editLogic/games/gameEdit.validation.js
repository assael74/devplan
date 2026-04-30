// features/hub/editLogic/games/gameEdit.validation.js

const clean = (value) => String(value ?? '').trim()

const isValidDateFormat = (value) => {
  const date = clean(value)

  if (!date) return false

  return /^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{2}\/\d{2}\/\d{4}$/.test(date)
}

export const getGameEditFieldErrors = (draft = {}) => {
  const gameDate = clean(draft?.gameDate)
  const rivel = clean(draft?.rivel)
  const type = clean(draft?.type)
  const gameDuration = clean(draft?.gameDuration)
  const home = draft?.home

  return {
    gameDate: !gameDate || !isValidDateFormat(gameDate),
    rivel: !rivel,
    type: !type,
    gameDuration: !gameDuration,
    home: home !== true && home !== false,
  }
}

export const getIsGameEditValid = (draft = {}) => {
  return !Object.values(getGameEditFieldErrors(draft)).some(Boolean)
}
