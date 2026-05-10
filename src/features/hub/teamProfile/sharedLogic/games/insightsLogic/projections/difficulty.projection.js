// teamProfile/sharedLogic/games/insightsLogic/projections/difficulty.projection.js

import {
  resolveTeamGamesTableLevelByProjectedPoints,
} from '../../../../../../../shared/teams/targets/index.js'

import {
  getGamesRows,
  getPlayedRows,
  getUpcomingRows,
} from '../rows/gameRows.selectors.js'

import {
  toNum,
  round1,
  resolveProgressColor,
  buildLevelView,
} from '../common/view.shared.js'

const DIFFICULTY_ORDER = ['easy', 'equal', 'hard']

const DIFFICULTY_LABELS = {
  easy: 'רמה קלה',
  equal: 'אותה רמה',
  hard: 'רמה קשה',
}

const DIFFICULTY_ICONS = {
  easy: 'easy',
  equal: 'equal',
  hard: 'hard',
}

const getGameObject = (row = {}) => {
  return row?.game || row
}

const resolveDifficultyId = (row = {}) => {
  const game = getGameObject(row)

  const direct =
    row?.difficulty ||
    row?.difficultyId ||
    row?.gameDifficulty ||
    row?.level ||
    row?.matchLevel ||
    row?.opponentLevel ||
    game?.difficulty ||
    game?.difficultyId ||
    game?.gameDifficulty ||
    game?.level ||
    game?.matchLevel ||
    game?.opponentLevel ||
    ''

  const normalized = String(direct || '').trim().toLowerCase()

  if (
    normalized === 'easy' ||
    normalized === 'low' ||
    normalized === 'weak' ||
    normalized === 'קל' ||
    normalized === 'רמה קלה'
  ) {
    return 'easy'
  }

  if (
    normalized === 'equal' ||
    normalized === 'same' ||
    normalized === 'samelevel' ||
    normalized === 'medium' ||
    normalized === 'balanced' ||
    normalized === 'אותה רמה' ||
    normalized === 'שווה' ||
    normalized === 'רמה שווה'
  ) {
    return 'equal'
  }

  if (
    normalized === 'hard' ||
    normalized === 'high' ||
    normalized === 'strong' ||
    normalized === 'קשה' ||
    normalized === 'רמה קשה'
  ) {
    return 'hard'
  }

  return 'equal'
}

const resolveGoalsFor = (row = {}) => {
  const game = getGameObject(row)

  return toNum(
    row?.goalsFor ??
      row?.gf ??
      row?.scoreFor ??
      game?.goalsFor ??
      game?.gf ??
      game?.scoreFor
  )
}

const resolveGoalsAgainst = (row = {}) => {
  const game = getGameObject(row)

  return toNum(
    row?.goalsAgainst ??
      row?.ga ??
      row?.scoreAgainst ??
      game?.goalsAgainst ??
      game?.ga ??
      game?.scoreAgainst
  )
}

const resolvePoints = (row = {}) => {
  const game = getGameObject(row)
  const explicit = row?.points ?? row?.gamePoints ?? game?.points

  if (explicit !== undefined && explicit !== null && explicit !== '') {
    return toNum(explicit)
  }

  const goalsFor = resolveGoalsFor(row)
  const goalsAgainst = resolveGoalsAgainst(row)

  if (goalsFor > goalsAgainst) return 3
  if (goalsFor === goalsAgainst) return 1
  return 0
}

const getGroupedDifficulty = (games = {}) => {
  const grouped = games?.grouped || {}
  const byDifficulty = Array.isArray(grouped?.byDifficulty)
    ? grouped.byDifficulty
    : []

  return DIFFICULTY_ORDER.reduce((acc, id) => {
    acc[id] = byDifficulty.find((item) => item?.id === id) || null
    return acc
  }, {})
}

const buildFallbackBucketFromRows = (rows = [], difficultyId) => {
  const filtered = rows.filter((row) => {
    return resolveDifficultyId(row) === difficultyId
  })

  const games = filtered.length
  const points = filtered.reduce((sum, row) => sum + resolvePoints(row), 0)
  const maxPoints = games * 3
  const pointsPct = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0

  return {
    id: difficultyId,
    label: DIFFICULTY_LABELS[difficultyId],
    games,
    total: games,
    points,
    maxPoints,
    pointsPct,
    rows: filtered,
  }
}

const buildCurrentBucket = ({
  groupedBucket,
  fallbackBucket,
  difficultyId,
}) => {
  const source = groupedBucket || fallbackBucket || {}

  const games = toNum(source?.games ?? source?.total)
  const points = toNum(source?.points)
  const maxPoints = toNum(source?.maxPoints || games * 3)

  const pointsPct = toNum(
    source?.pointsPct ??
      source?.pct ??
      (maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0)
  )

  const rawPpg = games > 0 ? points / games : 0

  const rows = Array.isArray(source?.rows)
    ? source.rows
    : Array.isArray(fallbackBucket?.rows)
      ? fallbackBucket.rows
      : []

  return {
    id: difficultyId,
    label: source?.label || DIFFICULTY_LABELS[difficultyId],
    icon: DIFFICULTY_ICONS[difficultyId] || source?.idIcon || 'difficulty',

    games,
    total: games,
    points,
    maxPoints,
    pointsPct,
    ppg: rawPpg,
    ppgLabel: round1(rawPpg),

    rows,
    color: resolveProgressColor(pointsPct),
  }
}

const buildReadiness = ({
  allRows = [],
  playedRows = [],
  upcomingRows = [],
  buckets = {},
}) => {
  const hasGames = allRows.length > 0 || playedRows.length > 0

  const hasPlayedEasy = toNum(buckets?.easy?.games) > 0
  const hasPlayedEqual = toNum(buckets?.equal?.games) > 0
  const hasPlayedHard = toNum(buckets?.hard?.games) > 0

  const hasAnyPlayedDifficulty = hasPlayedEasy || hasPlayedEqual || hasPlayedHard
  const hasUpcomingGames = upcomingRows.length > 0

  const remaining = DIFFICULTY_ORDER.reduce((acc, id) => {
    acc[id] = upcomingRows.filter((row) => {
      return resolveDifficultyId(row) === id
    }).length

    return acc
  }, {})

  const hasUpcomingDifficultySplit =
    toNum(remaining.easy) + toNum(remaining.equal) + toNum(remaining.hard) > 0

  const missing = []

  if (!hasGames) missing.push('לא קיימים משחקים להצגה')

  if (hasGames && !hasAnyPlayedDifficulty) {
    missing.push('חסרים משחקים ששוחקו לפי רמת יריבה')
  }

  if (!hasUpcomingGames) missing.push('חסרים משחקים עתידיים')

  if (hasUpcomingGames && !hasUpcomingDifficultySplit) {
    missing.push('חסר סימון רמת יריבה במשחקים העתידיים')
  }

  return {
    hasGames,
    hasPlayedEasy,
    hasPlayedEqual,
    hasPlayedHard,
    hasAnyPlayedDifficulty,
    hasUpcomingGames,
    hasUpcomingDifficultySplit,
    isCurrentReady: hasGames && hasAnyPlayedDifficulty,
    isProjectionReady:
      hasGames &&
      hasAnyPlayedDifficulty &&
      hasUpcomingGames &&
      hasUpcomingDifficultySplit,
    missing,
    remaining,
  }
}

const buildProjection = ({
  readiness = {},
  buckets = {},
}) => {
  if (!readiness?.isProjectionReady) {
    return {
      isReady: false,
      title: 'תחזית לא זמינה',
      text: readiness?.missing?.length
        ? readiness.missing.join(' · ')
        : 'חסרים נתונים לחישוב תחזית לפי רמת יריבה',
      color: 'neutral',
      projectedPoints: null,
      level: null,
    }
  }

  const currentPoints = DIFFICULTY_ORDER.reduce((sum, id) => {
    return sum + toNum(buckets?.[id]?.points)
  }, 0)

  const projectedPoints = round1(
    currentPoints +
      toNum(buckets?.easy?.ppg) * toNum(readiness?.remaining?.easy) +
      toNum(buckets?.equal?.ppg) * toNum(readiness?.remaining?.equal) +
      toNum(buckets?.hard?.ppg) * toNum(readiness?.remaining?.hard)
  )

  const level = buildLevelView(
    resolveTeamGamesTableLevelByProjectedPoints(projectedPoints)
  )

  return {
    isReady: true,
    title: level?.rankRangeLabel || '—',
    text: `${projectedPoints} נק׳ לפי קצב רמת יריבה`,
    projectedPoints,
    level,
    color: level?.color || 'neutral',
    remaining: readiness?.remaining || {},
  }
}

const buildInsightPlaceholder = () => {
  return {
    title: 'תובנה תתווסף בהמשך',
    text: 'כאן תוצג בהמשך תובנה על התוצאות מול רמות יריבה שונות.',
    color: 'neutral',
    icon: 'insights',
  }
}

export const buildTeamGamesDifficultyProjection = ({
  games = {},
  benchmarkLevel = null,
  targetProfile = null,
} = {}) => {
  const allRows = getGamesRows(games)
  const playedRows = getPlayedRows(games)
  const upcomingRows = getUpcomingRows(games)

  const grouped = getGroupedDifficulty(games)

  const buckets = DIFFICULTY_ORDER.reduce((acc, id) => {
    const fallback = buildFallbackBucketFromRows(playedRows, id)

    acc[id] = buildCurrentBucket({
      groupedBucket: grouped[id],
      fallbackBucket: fallback,
      difficultyId: id,
    })

    return acc
  }, {})

  const readiness = buildReadiness({
    allRows,
    playedRows,
    upcomingRows,
    buckets,
  })

  const resolvedTargetProfile = targetProfile || benchmarkLevel || null

  return {
    readiness,
    targetProfile: resolvedTargetProfile,
    benchmarkLevel: resolvedTargetProfile,

    current: buckets,
    buckets: DIFFICULTY_ORDER.map((id) => buckets[id]),

    insight: buildInsightPlaceholder(),

    projection: buildProjection({
      readiness,
      buckets,
    }),
  }
}
