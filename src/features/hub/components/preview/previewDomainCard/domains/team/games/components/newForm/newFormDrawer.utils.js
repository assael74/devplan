// previewDomainCard/domains/team/games/components/newForm/newFormDrawer.utils.js

const safe = (v) => (v == null ? '' : String(v).trim())

const isValidDateFormat = (value) => {
  const date = safe(value)
  if (!date) return false

  return /^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{2}\/\d{2}\/\d{4}$/.test(date)
}

export function buildInitialDraft(context = {}) {
  const entity = context?.entity || null
  const team = context?.team || entity || null

  const teamId = safe(context?.teamId || team?.id)
  const clubId = safe(context?.clubId || team?.clubId || team?.club?.id)

  return {
    gameDate: '',
    gameHour: '',
    rivel: '',
    teamId,
    clubId,
    home: true,
    difficulty: '',
    type: '',
    gameDuration: '',
    goalsFor: 0,
    goalsAgainst: 0,
    result: '',
  }
}

export function getFieldErrors(draft = {}) {
  const gameDate = safe(draft?.gameDate)
  const rivel = safe(draft?.rivel)
  const type = safe(draft?.type)
  const gameDuration = safe(draft?.gameDuration)
  const home = draft?.home

  return {
    gameDate: !gameDate || !isValidDateFormat(gameDate),
    rivel: !rivel,
    type: !type,
    gameDuration: !gameDuration,
    home: home !== true && home !== false,
  }
}

export function getIsValid(draft = {}) {
  return !Object.values(getFieldErrors(draft)).some(Boolean)
}

export function getIsDirty(draft = {}, initial = {}) {
  return JSON.stringify(draft) !== JSON.stringify(initial)
}
