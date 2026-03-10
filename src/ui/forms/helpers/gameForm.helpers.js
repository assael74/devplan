// ui/forms/helpers/gameForm.helpers.js

const toText = (v) => String(v ?? '').trim()
const toNumOrNull = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const toBoolOrNull = (v) => {
  if (typeof v === 'boolean') return v
  return null
}

const getGameResult = (goalsFor, goalsAgainst) => {
  if (!Number.isFinite(goalsFor) || !Number.isFinite(goalsAgainst)) return null
  if (goalsFor > goalsAgainst) return 'win'
  if (goalsFor < goalsAgainst) return 'loss'
  return 'draw'
}

export const buildGameInfoItem = ({ id, draft, now }) => ({
  id,
  clubId: toText(draft?.clubId),
  teamId: toText(draft?.teamId),
  rivel: toText(draft?.rivel),
  home: toBoolOrNull(draft?.home),
  difficulty: toText(draft?.difficulty) || null,
  type: toText(draft?.type) || null,
  createdAt: now,
  updatedAt: now,
})

export const buildGameTimeItem = ({ id, draft }) => ({
  id,
  gameDate: toText(draft?.gameDate) || null,
  gameHour: toText(draft?.gameHour) || null,
  gameDuration: toNumOrNull(draft?.gameDuration),
})

export const buildGameResultItem = ({ id, draft }) => {
  const goalsFor = toNumOrNull(draft?.goalsFor)
  const goalsAgainst = toNumOrNull(draft?.goalsAgainst)

  return {
    id,
    goalsFor,
    goalsAgainst,
    result: getGameResult(goalsFor, goalsAgainst),
  }
}
