// previewDomainCard/domains/team/games/components/drawer/editDrawer.utils.js

import { getFullDateIl } from '../../../../../../../../../../shared/format/dateUtiles.js'

const safe = (value) => (value == null ? '' : String(value))
const trim = (value) => safe(value).trim()

const isValidDateFormat = (value) => {
  const date = trim(value)
  if (!date) return false

  return /^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{2}\/\d{2}\/\d{4}$/.test(date)
}

const toNumOrEmpty = (value) => {
  if (value === '' || value == null) return ''
  const num = Number(value)
  return Number.isFinite(num) ? num : ''
}

const calcResultByGoals = (goalsFor, goalsAgainst) => {
  const gf = Number(goalsFor)
  const ga = Number(goalsAgainst)

  if (!Number.isFinite(gf) || !Number.isFinite(ga)) return ''
  if (gf > ga) return 'win'
  if (gf < ga) return 'loss'
  return 'draw'
}

const calcPointsByResult = (result, goalsFor, goalsAgainst) => {
  const normalized = trim(result).toLowerCase()

  if (normalized === 'win') return 3
  if (normalized === 'draw') return 1
  if (normalized === 'loss') return 0

  const derived = calcResultByGoals(goalsFor, goalsAgainst)
  if (derived === 'win') return 3
  if (derived === 'draw') return 1
  if (derived === 'loss') return 0

  return 0
}

const buildGameName = (game = {}) => {
  const rival = trim(game?.rivel) || trim(game?.rival)
  const date = trim(game?.gameDate)

  return [rival, date].filter(Boolean).join(' • ') || 'משחק'
}

const buildGameMeta = (game = {}) => {
  const teamName = trim(game?.team?.teamName)
  const rawDate = trim(game?.gameDate)
  const dateLabel = rawDate ? trim(getFullDateIl(rawDate)) : ''
  const hour = trim(game?.gameHour)

  return [teamName, dateLabel, hour].filter(Boolean).join(' | ') || 'פרטי משחק'
}

export const buildInitialDraft = (game = {}) => {
  const row = game || {}
  const base = row?.game || row || {}

  const goalsFor = toNumOrEmpty(base?.goalsFor)
  const goalsAgainst = toNumOrEmpty(base?.goalsAgainst)

  const result =
    trim(base?.result) ||
    trim(row?.result) ||
    calcResultByGoals(goalsFor, goalsAgainst) ||
    ''

  return {
    id: base?.id || row?.id || row?.gameId || '',
    name: buildGameName(base),
    photo: base?.team?.photo || '',
    teamId: base?.teamId || '',
    clubId: base?.clubId || '',
    teamName: base?.team?.teamName || '',
    clubName: base?.clubName || '',
    rivel: base?.rivel || base?.rival || '',
    gameDate: base?.gameDate || '',
    gameHour: base?.gameHour || '',
    vLink: base?.vLink || '',
    home: base?.home ?? '',
    type: base?.type || '',
    difficulty: base?.difficulty || '',
    gameDuration: toNumOrEmpty(base?.gameDuration ?? base?.duration),
    goalsFor,
    goalsAgainst,
    result,
    score:
      goalsFor !== '' && goalsAgainst !== ''
        ? `${goalsFor} - ${goalsAgainst}`
        : '',
    points: calcPointsByResult(result, goalsFor, goalsAgainst),
    raw: base,
    metaLabel: buildGameMeta(base),
  }
}

export const getFieldErrors = (draft = {}) => {
  const gameDate = trim(draft?.gameDate)
  const gameHour = trim(draft?.gameHour)
  const rivel = trim(draft?.rivel)
  const type = trim(draft?.type)
  const gameDuration = trim(draft?.gameDuration)
  const home = draft?.home

  return {
    rivel: !rivel,
    gameDate: !gameDate || !isValidDateFormat(gameDate),
    gameHour: !gameHour,
    type: !type,
    gameDuration: !gameDuration,
    home: home !== true && home !== false,
  }
}

export const getIsValid = (draft = {}) => {
  return !Object.values(getFieldErrors(draft)).some(Boolean)
}

export const getIsDirty = (draft = {}, initial = {}) =>
  draft.rivel !== initial.rivel ||
  draft.vLink !== initial.vLink ||
  draft.gameDate !== initial.gameDate ||
  draft.gameHour !== initial.gameHour ||
  draft.home !== initial.home ||
  draft.type !== initial.type ||
  draft.difficulty !== initial.difficulty ||
  draft.gameDuration !== initial.gameDuration ||
  draft.goalsFor !== initial.goalsFor ||
  draft.goalsAgainst !== initial.goalsAgainst ||
  draft.result !== initial.result

export const buildPatch = (draft = {}, initial = {}) => {
  const next = {}

  if (draft.rivel !== initial.rivel) next.rivel = draft.rivel || ''
  if (draft.vLink !== initial.vLink) next.vLink = draft.vLink || ''
  if (draft.gameDate !== initial.gameDate) next.gameDate = draft.gameDate || ''
  if (draft.gameHour !== initial.gameHour) next.gameHour = draft.gameHour || ''
  if (draft.home !== initial.home) next.home = draft.home
  if (draft.type !== initial.type) next.type = draft.type || ''
  if (draft.difficulty !== initial.difficulty) next.difficulty = draft.difficulty || ''

  if (draft.gameDuration !== initial.gameDuration) {
    next.gameDuration = draft.gameDuration === '' ? '' : Number(draft.gameDuration)
  }

  const goalsForChanged = draft.goalsFor !== initial.goalsFor
  const goalsAgainstChanged = draft.goalsAgainst !== initial.goalsAgainst
  const resultChanged = draft.result !== initial.result

  if (goalsForChanged) {
    next.goalsFor = draft.goalsFor === '' ? '' : Number(draft.goalsFor)
  }

  if (goalsAgainstChanged) {
    next.goalsAgainst = draft.goalsAgainst === '' ? '' : Number(draft.goalsAgainst)
  }

  if (goalsForChanged || goalsAgainstChanged || resultChanged) {
    const nextGoalsFor = draft.goalsFor === '' ? '' : Number(draft.goalsFor)
    const nextGoalsAgainst = draft.goalsAgainst === '' ? '' : Number(draft.goalsAgainst)

    const nextResult =
      trim(draft?.result) ||
      calcResultByGoals(nextGoalsFor, nextGoalsAgainst) ||
      ''

    next.result = nextResult
    next.score =
      draft.goalsFor !== '' && draft.goalsAgainst !== ''
        ? `${draft.goalsFor} - ${draft.goalsAgainst}`
        : ''
    next.points = calcPointsByResult(nextResult, nextGoalsFor, nextGoalsAgainst)
  }

  return next
}
