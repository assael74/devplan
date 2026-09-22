// src/shared/scouting/players/trajectory/playerTrajectory.js

import {
  PLAYER_TRAJECTORY_CONFIDENCE,
  PLAYER_TRAJECTORY_DIRECTION,
  PLAYER_TRAJECTORY_EVIDENCE,
} from './playerTrajectory.model.js'

import {
  buildPlayerSeasonSummaries,
  compareCompetitiveLevel,
  getDelta,
  normalizePlayerSeasonStints,
} from './playerTrajectory.utils.js'

import {
  buildPlayerTransferEvents,
} from './playerTransferTrajectory.js'

const MIN_RATE_DELTA = 0.08
const STRONG_RATE_DELTA = 0.18
const MIN_PRODUCTION_MINUTES = 300
const PRODUCTION_DELTA = 0.18

const unique = (values = []) => [...new Set(values.filter(Boolean))]

const compareProfiles = (previous, current) => {
  const previousIds = new Set(previous.profileIds || [])
  const currentIds = new Set(current.profileIds || [])

  return {
    added: [...currentIds].filter(id => !previousIds.has(id)),
    lost: [...previousIds].filter(id => !currentIds.has(id)),
  }
}

const buildPairEvidence = (previous, current) => {
  const evidence = []
  const minutesDelta = getDelta(previous.minutesPct, current.minutesPct)
  const startsDelta = getDelta(previous.startsPct, current.startsPct)
  const leagueChange = compareCompetitiveLevel(previous.leagueLevel, current.leagueLevel)
  const clubChange = compareCompetitiveLevel(
    previous.clubStrengthLevel || previous.clubLevel,
    current.clubStrengthLevel || current.clubLevel
  )
  const profiles = compareProfiles(previous, current)

  if (minutesDelta >= MIN_RATE_DELTA) evidence.push(PLAYER_TRAJECTORY_EVIDENCE.MINUTES_UP)
  if (minutesDelta <= -MIN_RATE_DELTA) evidence.push(PLAYER_TRAJECTORY_EVIDENCE.MINUTES_DOWN)
  if (startsDelta >= MIN_RATE_DELTA) evidence.push(PLAYER_TRAJECTORY_EVIDENCE.STARTS_UP)
  if (startsDelta <= -MIN_RATE_DELTA) evidence.push(PLAYER_TRAJECTORY_EVIDENCE.STARTS_DOWN)

  if (leagueChange > 0) evidence.push(PLAYER_TRAJECTORY_EVIDENCE.LEAGUE_LEVEL_UP)
  if (leagueChange < 0) evidence.push(PLAYER_TRAJECTORY_EVIDENCE.LEAGUE_LEVEL_DOWN)
  if (clubChange > 0) evidence.push(PLAYER_TRAJECTORY_EVIDENCE.CLUB_LEVEL_UP)
  if (clubChange < 0) evidence.push(PLAYER_TRAJECTORY_EVIDENCE.CLUB_LEVEL_DOWN)

  if (current.isYoungerAgeGroup) {
    evidence.push(PLAYER_TRAJECTORY_EVIDENCE.PLAYING_ABOVE_AGE)
  }

  if (profiles.added.length) evidence.push(PLAYER_TRAJECTORY_EVIDENCE.PROFILE_ADDED)
  if (profiles.lost.length) evidence.push(PLAYER_TRAJECTORY_EVIDENCE.PROFILE_LOST)

  if (
    previous.minutes >= MIN_PRODUCTION_MINUTES &&
    current.minutes >= MIN_PRODUCTION_MINUTES
  ) {
    const productionDelta = getDelta(previous.goalsPer90, current.goalsPer90)

    if (productionDelta >= PRODUCTION_DELTA) {
      evidence.push(PLAYER_TRAJECTORY_EVIDENCE.PRODUCTION_UP)
    }

    if (productionDelta <= -PRODUCTION_DELTA) {
      evidence.push(PLAYER_TRAJECTORY_EVIDENCE.PRODUCTION_DOWN)
    }
  }

  const currentNearProfileIds = new Set(current.nearProfileIds || [])
  const lostProfilesStillNear = profiles.lost.filter(profileId => (
    currentNearProfileIds.has(profileId)
  ))

  return {
    evidence: unique(evidence),
    profileChange: {
      added: profiles.added,
      lost: profiles.lost,
      lostProfilesStillNear,
    },
    deltas: {
      minutesPct: minutesDelta,
      startsPct: startsDelta,
      goalsPer90: getDelta(previous.goalsPer90, current.goalsPer90),
      leagueLevel: leagueChange,
      clubLevel: clubChange,
    },
  }
}

const POSITIVE_EVIDENCE = new Set([
  PLAYER_TRAJECTORY_EVIDENCE.MINUTES_UP,
  PLAYER_TRAJECTORY_EVIDENCE.STARTS_UP,
  PLAYER_TRAJECTORY_EVIDENCE.PRODUCTION_UP,
  PLAYER_TRAJECTORY_EVIDENCE.LEAGUE_LEVEL_UP,
  PLAYER_TRAJECTORY_EVIDENCE.CLUB_LEVEL_UP,
  PLAYER_TRAJECTORY_EVIDENCE.PLAYING_ABOVE_AGE,
  PLAYER_TRAJECTORY_EVIDENCE.PROFILE_ADDED,
])

const NEGATIVE_EVIDENCE = new Set([
  PLAYER_TRAJECTORY_EVIDENCE.MINUTES_DOWN,
  PLAYER_TRAJECTORY_EVIDENCE.STARTS_DOWN,
  PLAYER_TRAJECTORY_EVIDENCE.PRODUCTION_DOWN,
  PLAYER_TRAJECTORY_EVIDENCE.LEAGUE_LEVEL_DOWN,
  PLAYER_TRAJECTORY_EVIDENCE.CLUB_LEVEL_DOWN,
  PLAYER_TRAJECTORY_EVIDENCE.PROFILE_LOST,
])

const PERFORMANCE_POSITIVE_EVIDENCE = new Set([
  PLAYER_TRAJECTORY_EVIDENCE.MINUTES_UP,
  PLAYER_TRAJECTORY_EVIDENCE.STARTS_UP,
  PLAYER_TRAJECTORY_EVIDENCE.PRODUCTION_UP,
  PLAYER_TRAJECTORY_EVIDENCE.PROFILE_ADDED,
])

const PERFORMANCE_NEGATIVE_EVIDENCE = new Set([
  PLAYER_TRAJECTORY_EVIDENCE.MINUTES_DOWN,
  PLAYER_TRAJECTORY_EVIDENCE.STARTS_DOWN,
  PLAYER_TRAJECTORY_EVIDENCE.PRODUCTION_DOWN,
  PLAYER_TRAJECTORY_EVIDENCE.PROFILE_LOST,
])

const resolveCompetitiveDirection = comparison => {
  const leagueChange = Number(comparison?.deltas?.leagueLevel) || 0
  const clubChange = Number(comparison?.deltas?.clubLevel) || 0

  if (leagueChange > 0 || clubChange > 0) return 1
  if (leagueChange < 0 || clubChange < 0) return -1

  return 0
}

const countEvidence = (evidence, allowed) => (
  evidence.filter(item => allowed.has(item)).length
)

const hasLostProfileStillNear = comparison => (
  Array.isArray(comparison?.profileChange?.lostProfilesStillNear) &&
  comparison.profileChange.lostProfilesStillNear.length > 0
)

const resolveLatestPairDirection = ({ comparison, previous, current }) => {
  if (!comparison || !previous || !current) return PLAYER_TRAJECTORY_DIRECTION.UNKNOWN
  if (isBreakthrough(previous, current)) return PLAYER_TRAJECTORY_DIRECTION.BREAKTHROUGH

  const evidence = Array.isArray(comparison.evidence)
    ? comparison.evidence
    : []
  const competitiveDirection = resolveCompetitiveDirection(comparison)
  const positivePerformance = countEvidence(evidence, PERFORMANCE_POSITIVE_EVIDENCE)
  const negativePerformance = countEvidence(evidence, PERFORMANCE_NEGATIVE_EVIDENCE)
  const profileAdded = evidence.includes(PLAYER_TRAJECTORY_EVIDENCE.PROFILE_ADDED)
  const profileLost = evidence.includes(PLAYER_TRAJECTORY_EVIDENCE.PROFILE_LOST)
  const lostProfileStillNear = hasLostProfileStillNear(comparison)

  if (competitiveDirection > 0) {
    if (profileLost && lostProfileStillNear) {
      return PLAYER_TRAJECTORY_DIRECTION.STABLE
    }

    if (negativePerformance > 0) {
      return PLAYER_TRAJECTORY_DIRECTION.STABLE
    }

    return PLAYER_TRAJECTORY_DIRECTION.UP
  }

  if (competitiveDirection < 0) {
    if (negativePerformance > 0) return PLAYER_TRAJECTORY_DIRECTION.DOWN

    const strongImprovement = profileAdded && positivePerformance >= 2
    if (strongImprovement) return PLAYER_TRAJECTORY_DIRECTION.UP

    return PLAYER_TRAJECTORY_DIRECTION.STABLE
  }

  if (profileLost && lostProfileStillNear) {
    return PLAYER_TRAJECTORY_DIRECTION.STABLE
  }

  if (profileLost && !profileAdded) return PLAYER_TRAJECTORY_DIRECTION.DOWN
  if (profileAdded && !profileLost) return PLAYER_TRAJECTORY_DIRECTION.UP

  if (positivePerformance >= negativePerformance + 2) {
    return PLAYER_TRAJECTORY_DIRECTION.UP
  }

  if (negativePerformance >= positivePerformance + 2) {
    return PLAYER_TRAJECTORY_DIRECTION.DOWN
  }

  return PLAYER_TRAJECTORY_DIRECTION.STABLE
}

const isBreakthrough = (previous, current) => {
  const minutesDelta = getDelta(previous.minutesPct, current.minutesPct)
  const startsDelta = getDelta(previous.startsPct, current.startsPct)

  return (
    previous.minutesPct < 0.4 &&
    current.minutesPct >= 0.6 &&
    minutesDelta >= STRONG_RATE_DELTA
  ) || (
    previous.startsPct < 0.35 &&
    current.startsPct >= 0.55 &&
    startsDelta >= STRONG_RATE_DELTA
  )
}

const resolveDirection = ({ comparisons, latestPrevious, latest }) => {
  if (!latestPrevious || !latest) return PLAYER_TRAJECTORY_DIRECTION.UNKNOWN

  const latestComparison = comparisons[comparisons.length - 1] || null

  return resolveLatestPairDirection({
    comparison: latestComparison,
    previous: latestPrevious,
    current: latest,
  })
}

const resolveConfidence = (seasonSummaries, comparisons) => {
  if (seasonSummaries.length >= 3 && comparisons.length >= 2) {
    return PLAYER_TRAJECTORY_CONFIDENCE.HIGH
  }

  if (seasonSummaries.length >= 2 && comparisons.length >= 1) {
    return PLAYER_TRAJECTORY_CONFIDENCE.MEDIUM
  }

  return PLAYER_TRAJECTORY_CONFIDENCE.LOW
}

const buildSeasonComparisons = (seasonSummaries = []) => {
  const comparisons = []

  for (let index = 1; index < seasonSummaries.length; index += 1) {
    const previous = seasonSummaries[index - 1]
    const current = seasonSummaries[index]
    const comparison = buildPairEvidence(previous, current)

    comparisons.push({
      fromSeasonKey: previous.seasonKey,
      toSeasonKey: current.seasonKey,
      fromClubId: previous.clubId,
      toClubId: current.clubId,
      ...comparison,
    })
  }

  return comparisons
}

export const buildPlayerTrajectory = ({ stints } = {}) => {
  const normalizedStints = normalizePlayerSeasonStints(stints)
  const seasonSummaries = buildPlayerSeasonSummaries(normalizedStints)
  const comparisons = buildSeasonComparisons(seasonSummaries)
  const latestSeason = seasonSummaries[seasonSummaries.length - 1] || null
  const latestPreviousSeason = seasonSummaries[seasonSummaries.length - 2] || null
  const latestStint = normalizedStints[normalizedStints.length - 1] || null
  const transferEvents = buildPlayerTransferEvents(normalizedStints)
  const latestTransfer = transferEvents[transferEvents.length - 1] || null

  return {
    direction: resolveDirection({
      comparisons,
      latestPrevious: latestPreviousSeason,
      latest: latestSeason,
    }),
    confidence: resolveConfidence(seasonSummaries, comparisons),
    evidence: unique(comparisons.flatMap(comparison => comparison.evidence)),
    stintsCount: normalizedStints.length,
    seasonsCount: seasonSummaries.length,
    latestStint,
    latestSeason,
    comparisons,
    transferEvents,
    latestTransfer,
    seasonSummaries,
    normalizedStints,
  }
}
