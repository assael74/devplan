// teamProfile/sharedLogic/games/insightsLogic/teamGames.homeAway.logic.js

import { resolveTeamGamesTableLevelByProjectedPoints } from '../../../../../../shared/games/insights/team/index.js'

import {
  getGamesRows,
  getPlayedRows,
  getUpcomingRows,
} from './teamGames.rows.shared.js'

import {
  toNum,
  round1,
  resolveProgressColor,
  buildLevelView,
} from './teamGames.view.shared.js'

const VENUE_ICONS = {
  home: 'home',
  away: 'away',
}

const resolveVenueId = (row = {}) => {
  const direct =
    row?.homeOrAway ||
    row?.venue ||
    row?.venueId ||
    row?.homeAway ||
    row?.locationType ||
    row?.homeType ||
    ''

  const normalized = String(direct || '').trim().toLowerCase()

  if (normalized === 'home' || normalized === 'בית') return 'home'
  if (normalized === 'away' || normalized === 'חוץ') return 'away'

  if (row?.home === true || row?.isHome === true) return 'home'
  if (row?.home === false || row?.isAway === true) return 'away'

  return ''
}

const getGroupedHomeAway = (games = {}) => {
  const grouped = games?.grouped || {}
  const byHomeOrAway = Array.isArray(grouped?.byHomeOrAway)
    ? grouped.byHomeOrAway
    : []

  const home = byHomeOrAway.find((item) => item?.id === 'home') || null
  const away = byHomeOrAway.find((item) => item?.id === 'away') || null

  return { home, away }
}

const buildFallbackBucketFromRows = (rows = [], venueId) => {
  const filtered = rows.filter((row) => resolveVenueId(row) === venueId)
  const total = filtered.length
  const points = filtered.reduce((sum, row) => sum + toNum(row?.points), 0)
  const maxPoints = total * 3
  const pointsPct = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0

  return {
    id: venueId,
    label: venueId === 'home' ? 'בית' : 'חוץ',
    total,
    points,
    maxPoints,
    pointsPct,
  }
}

const buildCurrentBucket = (bucket, fallbackBucket, venueId) => {
  const source = bucket || fallbackBucket || {}

  const total = toNum(source?.total)
  const points = toNum(source?.points)
  const maxPoints = total * 3

  const pointsPct = toNum(
    source?.pointsPct ||
      source?.pct ||
      (maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0)
  )

  return {
    id: venueId,
    label: source?.label || (venueId === 'home' ? 'בית' : 'חוץ'),
    icon: VENUE_ICONS[venueId] || source?.idIcon || 'game',
    games: total,
    points,
    maxPoints,
    pointsPct,
    ppg: total > 0 ? round1(points / total) : 0,
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
} = {}) => {
  const allRows = getGamesRows(games)
  const playedRows = getPlayedRows(games)
  const upcomingRows = getUpcomingRows(games)

  const grouped = getGroupedHomeAway(games)

  const homeFallback = buildFallbackBucketFromRows(playedRows, 'home')
  const awayFallback = buildFallbackBucketFromRows(playedRows, 'away')

  const home = buildCurrentBucket(grouped.home, homeFallback, 'home')
  const away = buildCurrentBucket(grouped.away, awayFallback, 'away')

  const readiness = buildReadiness({
    allRows,
    playedRows,
    upcomingRows,
    home,
    away,
  })

  return {
    readiness,
    current: {
      home,
      away,
    },
    insight: buildInsightPlaceholder(),
    projection: buildProjection({
      league,
      readiness,
      home,
      away,
    }),
  }
}
