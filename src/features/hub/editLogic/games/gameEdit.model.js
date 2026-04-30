// features/hub/editLogic/games/gameEdit.model.js

import { getFullDateIl } from '../../../../shared/format/dateUtiles.js'

export const safe = (value) => (value == null ? '' : String(value))
export const clean = (value) => safe(value).trim()

export const toNumOrEmpty = (value) => {
  if (value === '' || value == null) return ''

  const num = Number(value)

  return Number.isFinite(num) ? num : ''
}

export const calcResultByGoals = (goalsFor, goalsAgainst) => {
  const goalsForNum = Number(goalsFor)
  const goalsAgainstNum = Number(goalsAgainst)

  if (!Number.isFinite(goalsForNum) || !Number.isFinite(goalsAgainstNum)) return ''
  if (goalsForNum > goalsAgainstNum) return 'win'
  if (goalsForNum < goalsAgainstNum) return 'loss'

  return 'draw'
}

export const calcPointsByResult = (result, goalsFor, goalsAgainst) => {
  const normalized = clean(result).toLowerCase()

  if (normalized === 'win') return 3
  if (normalized === 'draw') return 1
  if (normalized === 'loss') return 0

  const derived = calcResultByGoals(goalsFor, goalsAgainst)

  if (derived === 'win') return 3
  if (derived === 'draw') return 1
  if (derived === 'loss') return 0

  return 0
}

export const buildGameName = (game = {}) => {
  const rival = clean(game?.rivel) || clean(game?.rival)
  const date = clean(game?.gameDate)

  return [rival, date].filter(Boolean).join(' • ') || 'משחק'
}

export const buildGameMeta = (game = {}) => {
  const teamName = clean(game?.teamName || game?.team?.teamName || game?.team?.name)
  const rawDate = clean(game?.gameDate)
  const dateLabel = clean(game?.dateLabel) || clean(getFullDateIl(rawDate))
  const hour = clean(game?.gameHour)

  return [teamName, dateLabel, hour].filter(Boolean).join(' | ') || 'פרטי משחק'
}

const unwrapGame = (game = {}) => {
  if (!game || typeof game !== 'object') return {}

  return {
    ...game?.raw,
    ...game?.game,
    ...game,
  }
}

export const buildGameEditInitial = (game = {}) => {
  const source = unwrapGame(game)

  const goalsFor = toNumOrEmpty(source?.goalsFor)
  const goalsAgainst = toNumOrEmpty(source?.goalsAgainst)

  const result =
    clean(source?.result) ||
    calcResultByGoals(goalsFor, goalsAgainst) ||
    ''

  return {
    id: clean(source?.id || source?.gameId),

    clubId: clean(source?.clubId),
    teamId: clean(source?.teamId),

    name: buildGameName(source),
    teamName: clean(source?.teamName || source?.team?.teamName || source?.team?.name),
    clubName: clean(source?.clubName || source?.club?.clubName || source?.club?.name),

    rivel: clean(source?.rivel || source?.rival),
    gameDate: clean(source?.gameDate),
    gameHour: clean(source?.gameHour),
    vLink: clean(source?.vLink),

    home: source?.home ?? '',
    type: clean(source?.type),
    difficulty: clean(source?.difficulty),

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

export const buildGameEditPatch = (draft = {}, initial = {}) => {
  const next = {}

  if (draft.rivel !== initial.rivel) next.rivel = clean(draft.rivel)
  if (draft.vLink !== initial.vLink) next.vLink = clean(draft.vLink)
  if (draft.gameDate !== initial.gameDate) next.gameDate = clean(draft.gameDate)
  if (draft.gameHour !== initial.gameHour) next.gameHour = clean(draft.gameHour)
  if (draft.home !== initial.home) next.home = draft.home
  if (draft.type !== initial.type) next.type = clean(draft.type)
  if (draft.difficulty !== initial.difficulty) next.difficulty = clean(draft.difficulty)

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
      clean(draft.result) ||
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

export const isGameEditDirty = (draft = {}, initial = {}) => {
  return (
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
  )
}
