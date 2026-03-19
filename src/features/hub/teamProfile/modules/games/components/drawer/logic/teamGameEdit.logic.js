import { getFullDateIl } from '../../../../../../../../shared/format/dateUtiles.js'

export const safe = (v) => (v == null ? '' : String(v))

export const toNumOrEmpty = (v) => {
  if (v === '' || v == null) return ''
  const n = Number(v)
  return Number.isFinite(n) ? n : ''
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
  const r = safe(result).trim().toLowerCase()

  if (r === 'win') return 3
  if (r === 'draw') return 1
  if (r === 'loss') return 0

  return calcResultByGoals(goalsFor, goalsAgainst) === 'win'
    ? 3
    : calcResultByGoals(goalsFor, goalsAgainst) === 'draw'
    ? 1
    : calcResultByGoals(goalsFor, goalsAgainst) === 'loss'
    ? 0
    : 0
}

export const buildGameName = (game) => {
  const rival =
    safe(game?.rivel).trim() ||
    safe(game?.rival).trim() ||
    safe(game?.rivalName).trim() ||
    safe(game?.opponent).trim()

  const date =
    safe(game?.gameDate).trim() ||
    safe(game?.dateRaw).trim()

  return [rival, date].filter(Boolean).join(' • ') || 'משחק'
}

export const buildGameMeta = (game) => {
  const teamName =
    game?.teamName ||
    game?.team?.teamName ||
    game?.team?.name ||
    ''

  const rawDate =
    safe(game?.gameDate).trim() ||
    safe(game?.dateRaw).trim()

  const dateLabel =
    safe(game?.dateLabel).trim() ||
    safe(getFullDateIl(rawDate)).trim()

  const hour =
    safe(game?.gameHour).trim() ||
    safe(game?.hourRaw).trim()

  return [teamName, dateLabel, hour].filter(Boolean).join(' | ') || 'פרטי משחק'
}

export const buildInitialDraft = (game) => {
  const g = game || {}
  const source = g?.game || g || {}

  const goalsFor = toNumOrEmpty(source?.goalsFor)
  const goalsAgainst = toNumOrEmpty(source?.goalsAgainst)
  const result =
    safe(source?.result).trim() ||
    safe(g?.result).trim() ||
    calcResultByGoals(goalsFor, goalsAgainst) ||
    ''

  return {
    id: source?.id || g?.id || g?.gameId || '',
    clubId: source?.clubId || g?.clubId || g?.team?.clubId || '',
    teamId: source?.teamId || g?.teamId || g?.team?.id || '',
    rivel: source?.rivel || source?.rival || '',
    gameDate: source?.gameDate || source?.dateRaw || '',
    gameHour: source?.gameHour || source?.hourRaw || '',
    vLink: source?.vLink || '',
    home:
      typeof source?.home === 'boolean'
        ? source.home
        : typeof source?.isHome === 'boolean'
        ? source.isHome
        : false,
    type: source?.type || '',
    difficulty: source?.difficulty || '',
    gameDuration: toNumOrEmpty(source?.gameDuration || source?.duration),
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

export const buildPatch = (draft, initial) => {
  const next = {}

  if (draft.rivel !== initial.rivel) next.rivel = draft.rivel || ''
  if (draft.vLink !== initial.vLink) next.vLink = draft.vLink || ''
  if (draft.gameDate !== initial.gameDate) next.gameDate = draft.gameDate || ''
  if (draft.gameHour !== initial.gameHour) next.gameHour = draft.gameHour || ''
  if (draft.home !== initial.home) next.home = draft.home === true
  if (draft.type !== initial.type) next.type = draft.type || ''
  if (draft.difficulty !== initial.difficulty) next.difficulty = draft.difficulty || ''
  if (draft.gameDuration !== initial.gameDuration) {
    next.gameDuration = draft.gameDuration === '' ? '' : Number(draft.gameDuration)
  }
  if (draft.goalsFor !== initial.goalsFor) {
    next.goalsFor = draft.goalsFor === '' ? '' : Number(draft.goalsFor)
  }
  if (draft.goalsAgainst !== initial.goalsAgainst) {
    next.goalsAgainst = draft.goalsAgainst === '' ? '' : Number(draft.goalsAgainst)
  }
  if (draft.result !== initial.result) {
    next.result = draft.result || ''
  }

  return next
}

export const getIsDirty = (draft, initial) =>
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
