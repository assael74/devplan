// teamProfile/sharedLogic/games/drawerLogic/teamGameEdit.logic.js

import { getFullDateIl } from '../../../../../../shared/format/dateUtiles.js'

export const safe = (value) => (value == null ? '' : String(value))

export const toNumOrEmpty = (value) => {
  if (value === '' || value == null) return ''
  const num = Number(value)
  return Number.isFinite(num) ? num : ''
}

export const calcResultByGoals = (goalsFor, goalsAgainst) => {
  const gf = Number(goalsFor)
  const ga = Number(goalsAgainst)

  if (!Number.isFinite(gf) || !Number.isFinite(ga)) return ''
  if (gf > ga) return 'win'
  if (gf < ga) return 'loss'
  return 'draw'
}

export const calcPointsByResult = (result, goalsFor, goalsAgainst) => {
  const normalized = safe(result).trim().toLowerCase()

  if (normalized === 'win') return 3
  if (normalized === 'draw') return 1
  if (normalized === 'loss') return 0

  const derived = calcResultByGoals(goalsFor, goalsAgainst)
  if (derived === 'win') return 3
  if (derived === 'draw') return 1
  if (derived === 'loss') return 0

  return 0
}

export const getFieldErrors = (draft = {}) => {
  const clean = (value) => String(value ?? '').trim()

  const gameDate = clean(draft?.gameDate)
  const rivel = clean(draft?.rivel)
  const type = clean(draft?.type)
  const gameDuration = clean(draft?.gameDuration)
  const home = draft?.home

  return {
    gameDate:
      !gameDate ||
      !(/^\d{4}-\d{2}-\d{2}$/.test(gameDate) || /^\d{2}\/\d{2}\/\d{4}$/.test(gameDate)),
    rivel: !rivel,
    type: !type,
    gameDuration: !gameDuration,
    home: home !== true && home !== false,
  }
}

export const buildGameName = (game = {}) => {
  const rival = safe(game?.rivel).trim() || safe(game?.rival).trim() || ''
  const date = safe(game?.gameDate).trim()

  return [rival, date].filter(Boolean).join(' • ') || 'משחק'
}

export const buildGameMeta = (game = {}) => {
  const teamName = game?.team?.teamName || ''
  const rawDate = safe(game?.gameDate).trim()

  const dateLabel = safe(game?.dateLabel).trim() || safe(getFullDateIl(rawDate)).trim()
  const hour = safe(game?.gameHour).trim()

  return [teamName, dateLabel, hour].filter(Boolean).join(' | ') || 'פרטי משחק'
}

export const buildInitialDraft = (game = {}) => {
  const row = game || {}
  const source = row?.game || row || {}

  const goalsFor = toNumOrEmpty(source?.goalsFor)
  const goalsAgainst = toNumOrEmpty(source?.goalsAgainst)
  const result =
    safe(source?.result).trim() ||
    safe(row?.result).trim() ||
    calcResultByGoals(goalsFor, goalsAgainst) ||
    ''

  return {
    id: source?.id || row?.id || row?.gameId || '',
    clubId: source?.clubId || '',
    teamId: source?.teamId || '',
    rivel: source?.rivel || source?.rival || '',
    gameDate: source?.gameDate || '',
    gameHour: source?.gameHour || '',
    vLink: source?.vLink || '',
    home: source?.home ?? '',
    type: source?.type || '',
    difficulty: source?.difficulty || '',
    gameDuration: toNumOrEmpty(source?.gameDuration ?? source?.duration),
    goalsFor,
    goalsAgainst,
    result,
    score:
      goalsFor !== '' && goalsAgainst !== ''
        ? `${goalsFor} - ${goalsAgainst}`
        : '',
    points: calcPointsByResult(result, goalsFor, goalsAgainst),
    raw: source,
    metaLabel: buildGameMeta(source),
  }
}

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
      safe(draft.result).trim() ||
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

export const getIsValid = (draft = {}) => {
  return !Object.values(getFieldErrors(draft)).some(Boolean)
}
