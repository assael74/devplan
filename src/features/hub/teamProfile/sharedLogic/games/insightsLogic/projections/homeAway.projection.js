// teamProfile/sharedLogic/games/insightsLogic/projections/homeAway.projection.js

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

const VENUE_ICONS = {
  home: 'home',
  away: 'away',
}

const VENUE_LABELS = {
  home: 'בית',
  away: 'חוץ',
}

const getGameObject = (row = {}) => {
  return row?.game || row
}

const resolveVenueId = (row = {}) => {
  const game = getGameObject(row)

  const direct =
    row?.homeOrAway ||
    row?.venue ||
    row?.venueId ||
    row?.homeAway ||
    row?.locationType ||
    row?.homeType ||
    game?.homeOrAway ||
    game?.venue ||
    game?.venueId ||
    game?.homeAway ||
    game?.locationType ||
    game?.homeType ||
    ''

  const normalized = String(direct || '').trim().toLowerCase()

  if (normalized === 'home' || normalized === 'בית') return 'home'
  if (normalized === 'away' || normalized === 'חוץ') return 'away'

  if (row?.home === true || row?.isHome === true) return 'home'
  if (game?.home === true || game?.isHome === true) return 'home'

  if (row?.home === false || row?.isAway === true) return 'away'
  if (game?.home === false || game?.isAway === true) return 'away'

  return ''
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

const getGroupedHomeAway = (games = {}) => {
  const grouped = games?.grouped || {}
  const byHomeOrAway = Array.isArray(grouped?.byHomeOrAway)
    ? grouped.byHomeOrAway
    : []

  return {
    home: byHomeOrAway.find((item) => item?.id === 'home') || null,
    away: byHomeOrAway.find((item) => item?.id === 'away') || null,
  }
}

const buildFallbackBucketFromRows = (rows = [], venueId) => {
  const filtered = rows.filter((row) => resolveVenueId(row) === venueId)
  const games = filtered.length
  const points = filtered.reduce((sum, row) => sum + resolvePoints(row), 0)
  const maxPoints = games * 3
  const pointsPct = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0

  return {
    id: venueId,
    label: VENUE_LABELS[venueId],
    games,
    points,
    maxPoints,
    pointsPct,
    rows: filtered,
  }
}

const buildCurrentBucket = ({
  groupedBucket,
  fallbackBucket,
  venueId,
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

  const rows = Array.isArray(source?.rows)
    ? source.rows
    : Array.isArray(fallbackBucket?.rows)
      ? fallbackBucket.rows
      : []

  return {
    id: venueId,
    label: source?.label || VENUE_LABELS[venueId],
    icon: VENUE_ICONS[venueId] || source?.idIcon || 'game',

    games,
    total: games,
    points,
    maxPoints,
    pointsPct,
    ppg: games > 0 ? round1(points / games) : 0,

    rows,
    color: resolveProgressColor(pointsPct),
  }
}

const buildReadiness = ({
  allRows = [],
  playedRows = [],
  upcomingRows = [],
  home,
  away,
}) => {
  const hasGames = allRows.length > 0 || playedRows.length > 0
  const hasPlayedHome = toNum(home?.games) > 0
  const hasPlayedAway = toNum(away?.games) > 0
  const hasUpcomingGames = upcomingRows.length > 0

  const remainingHomeGames = upcomingRows.filter((row) => {
    return resolveVenueId(row) === 'home'
  }).length

  const remainingAwayGames = upcomingRows.filter((row) => {
    return resolveVenueId(row) === 'away'
  }).length

  const hasUpcomingVenueSplit = remainingHomeGames + remainingAwayGames > 0

  const missing = []

  if (!hasGames) missing.push('לא קיימים משחקים להצגה')
  if (hasGames && !hasPlayedHome) missing.push('חסר לפחות משחק בית ששוחק')
  if (hasGames && !hasPlayedAway) missing.push('חסר לפחות משחק חוץ ששוחק')
  if (!hasUpcomingGames) missing.push('חסרים משחקים עתידיים')

  if (hasUpcomingGames && !hasUpcomingVenueSplit) {
    missing.push('חסר סימון בית / חוץ במשחקים העתידיים')
  }

  return {
    hasGames,
    hasPlayedHome,
    hasPlayedAway,
    hasUpcomingGames,
    hasUpcomingVenueSplit,
    isCurrentReady: hasGames && (hasPlayedHome || hasPlayedAway),
    isProjectionReady:
      hasGames &&
      hasPlayedHome &&
      hasPlayedAway &&
      hasUpcomingGames &&
      hasUpcomingVenueSplit,
    missing,
    remainingHomeGames,
    remainingAwayGames,
  }
}

const buildProjection = ({
  league = {},
  readiness = {},
  home = {},
  away = {},
}) => {
  if (!readiness?.isProjectionReady) {
    return {
      isReady: false,
      title: 'תחזית לא זמינה',
      text: readiness?.missing?.length
        ? readiness.missing.join(' · ')
        : 'חסרים נתונים לחישוב תחזית לפי בית / חוץ',
      color: 'neutral',
      projectedPoints: null,
      level: null,
    }
  }

  const currentPoints = toNum(league?.points)

  const projectedPoints = round1(
    currentPoints +
      toNum(home?.ppg) * toNum(readiness?.remainingHomeGames) +
      toNum(away?.ppg) * toNum(readiness?.remainingAwayGames)
  )

  const level = buildLevelView(
    resolveTeamGamesTableLevelByProjectedPoints(projectedPoints)
  )

  return {
    isReady: true,
    title: level?.rankRangeLabel || '—',
    text: `${projectedPoints} נק׳ לפי קצב בית / חוץ`,
    projectedPoints,
    level,
    color: level?.color || 'neutral',
    remainingHomeGames: readiness?.remainingHomeGames || 0,
    remainingAwayGames: readiness?.remainingAwayGames || 0,
  }
}

const buildInsightPlaceholder = () => {
  return {
    title: 'תובנה תתווסף בהמשך',
    text: 'כאן תוצג בהמשך תובנה על ההבדלים בין משחקי בית וחוץ.',
    color: 'neutral',
    icon: 'insights',
  }
}

export const buildTeamGamesHomeAwayProjection = ({
  league = {},
  games = {},
  benchmarkLevel = null,
  targetProfile = null,
} = {}) => {
  const allRows = getGamesRows(games)
  const playedRows = getPlayedRows(games)
  const upcomingRows = getUpcomingRows(games)

  const grouped = getGroupedHomeAway(games)

  const homeFallback = buildFallbackBucketFromRows(playedRows, 'home')
  const awayFallback = buildFallbackBucketFromRows(playedRows, 'away')

  const home = buildCurrentBucket({
    groupedBucket: grouped.home,
    fallbackBucket: homeFallback,
    venueId: 'home',
  })

  const away = buildCurrentBucket({
    groupedBucket: grouped.away,
    fallbackBucket: awayFallback,
    venueId: 'away',
  })

  const readiness = buildReadiness({
    allRows,
    playedRows,
    upcomingRows,
    home,
    away,
  })

  const resolvedTargetProfile = targetProfile || benchmarkLevel || null

  return {
    readiness,
    targetProfile: resolvedTargetProfile,
    benchmarkLevel: resolvedTargetProfile,

    current: {
      home,
      away,
    },

    buckets: [home, away],

    insight: buildInsightPlaceholder(),

    projection: buildProjection({
      league,
      readiness,
      home,
      away,
    }),
  }
}
