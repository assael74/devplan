// League table + competition rules -> Club competition projection. Pure domain calculation.

import { SEASON_STATUS, normalizeSeasonStatus } from '../../../model/shared/season.model.js'
import { cleanValue, toNumberOrZero } from '../../../model/shared/value.model.js'
import { getLeagueTableRowRank, getLeagueTableRowStats } from '../teamPerformance.projection.js'
import { buildExpectedLeagueGamesPerTeam } from '../leagueSchedule.projection.js'
import {
  CLUB_COMPETITION_PROJECTION_SOURCE,
  CLUB_COMPETITION_STATUS,
  normalizeClubCompetitionProjectionSource,
  normalizeClubCompetitionStatus,
} from '../../contracts/club.contract.js'

const normalizePlaces = values => Array.from(new Set(
  (Array.isArray(values) ? values : [])
    .map(value => Number(value))
    .filter(value => Number.isInteger(value) && value > 0)
)).sort((left, right) => left - right)

export const normalizeCompetitionRules = rules => {
  const promotionDirectPlaces = normalizePlaces(rules?.promotion?.directPlaces)
  const promotionPlayoffPlaces = normalizePlaces(rules?.promotion?.playoffPlaces)
  const relegationDirectPlaces = normalizePlaces(rules?.relegation?.directPlaces)
  const relegationPlayoffPlaces = normalizePlaces(rules?.relegation?.playoffPlaces)
  const hasExplicitRules = Boolean(
    rules && typeof rules === 'object' && (
      Object.prototype.hasOwnProperty.call(rules, 'promotion') ||
      Object.prototype.hasOwnProperty.call(rules, 'relegation')
    )
  )

  return {
    configured: rules?.configured === false ? false : (rules?.configured === true || hasExplicitRules),
    promotion: {
      enabled: rules?.promotion?.enabled === true ||
        promotionDirectPlaces.length > 0 || promotionPlayoffPlaces.length > 0,
      directPlaces: promotionDirectPlaces,
      playoffPlaces: promotionPlayoffPlaces,
    },
    relegation: {
      enabled: rules?.relegation?.enabled === true ||
        relegationDirectPlaces.length > 0 || relegationPlayoffPlaces.length > 0,
      directPlaces: relegationDirectPlaces,
      playoffPlaces: relegationPlayoffPlaces,
    },
  }
}

const isPlaceInDirectZone = (rank, zone = {}) => (
  Boolean(zone?.enabled) && normalizePlaces(zone?.directPlaces).includes(Number(rank))
)

const resolveTeamKey = row => cleanValue(
  row?.birthTeamId || row?.teamId || row?.clubId
)

const buildProjectedRows = ({ rows, expectedGamesPerTeam }) => (
  (Array.isArray(rows) ? rows : []).map(row => {
    const stats = getLeagueTableRowStats(row)
    const gamesPlayed = stats.gamesPlayed
    const remainingGames = Math.max(0, expectedGamesPerTeam - gamesPlayed)
    const pointsPerGame = gamesPlayed > 0 ? stats.points / gamesPlayed : 0

    return {
      row,
      teamKey: resolveTeamKey(row),
      currentRank: getLeagueTableRowRank(row),
      projectedFinalPoints: stats.points + (remainingGames * pointsPerGame),
    }
  }).sort((left, right) => {
    if (left.projectedFinalPoints !== right.projectedFinalPoints) {
      return right.projectedFinalPoints - left.projectedFinalPoints
    }

    return left.currentRank - right.currentRank
  }).map((item, index) => ({
    ...item,
    projectedRank: index + 1,
  }))
)

const resolveProjectedLeagueLevel = ({ leagueLevel, status }) => {
  const currentLevel = toNumberOrZero(leagueLevel)
  if (!currentLevel) return null

  if (
    status === CLUB_COMPETITION_STATUS.PROMOTION_POSSIBLE ||
    status === CLUB_COMPETITION_STATUS.PROMOTED_CONFIRMED
  ) {
    return Math.max(1, currentLevel - 1)
  }

  if (
    status === CLUB_COMPETITION_STATUS.RELEGATION_RISK ||
    status === CLUB_COMPETITION_STATUS.RELEGATED_CONFIRMED
  ) {
    return currentLevel + 1
  }

  return currentLevel
}

const resolveMathematicalStatus = ({
  targetRow,
  rows,
  expectedGamesPerTeam,
  competitionRules,
}) => {
  const targetStats = getLeagueTableRowStats(targetRow)
  const targetCurrentPoints = targetStats.points
  const targetMaxPoints = targetCurrentPoints + (
    Math.max(0, expectedGamesPerTeam - targetStats.gamesPlayed) * 3
  )
  const otherRows = (Array.isArray(rows) ? rows : []).filter(row => row !== targetRow)
  const guaranteedAboveCount = otherRows.filter(row => (
    getLeagueTableRowStats(row).points > targetMaxPoints
  )).length
  const canStillFinishAboveCount = otherRows.filter(row => {
    const stats = getLeagueTableRowStats(row)
    const maxPoints = stats.points + (
      Math.max(0, expectedGamesPerTeam - stats.gamesPlayed) * 3
    )
    return maxPoints >= targetCurrentPoints
  }).length
  const bestPossibleRank = guaranteedAboveCount + 1
  const worstPossibleRank = canStillFinishAboveCount + 1
  const promotionPlaces = competitionRules.promotion.enabled
    ? normalizePlaces(competitionRules.promotion.directPlaces)
    : []
  const relegationPlaces = competitionRules.relegation.enabled
    ? normalizePlaces(competitionRules.relegation.directPlaces)
    : []
  const lastPromotionRank = promotionPlaces.length ? Math.max(...promotionPlaces) : 0
  const firstRelegationRank = relegationPlaces.length ? Math.min(...relegationPlaces) : 0

  if (lastPromotionRank && worstPossibleRank <= lastPromotionRank) {
    return CLUB_COMPETITION_STATUS.PROMOTED_CONFIRMED
  }

  if (firstRelegationRank && bestPossibleRank >= firstRelegationRank) {
    return CLUB_COMPETITION_STATUS.RELEGATED_CONFIRMED
  }

  if (firstRelegationRank && worstPossibleRank < firstRelegationRank) {
    return CLUB_COMPETITION_STATUS.SAFE_CONFIRMED
  }

  return null
}

export const buildCompetitionProjection = ({
  rows = [],
  targetTeam = {},
  leagueLevel = null,
  competitionRules = {},
  expectedGamesPerTeam: suppliedExpectedGamesPerTeam = 0,
} = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const targetKey = resolveTeamKey(targetTeam)
  const targetRow = targetKey
    ? safeRows.find(row => resolveTeamKey(row) === targetKey) || null
    : null
  const normalizedRules = normalizeCompetitionRules(competitionRules)
  const expectedGamesPerTeam = toNumberOrZero(suppliedExpectedGamesPerTeam) ||
    buildExpectedLeagueGamesPerTeam(safeRows.length)

  if (!targetRow || !expectedGamesPerTeam || !normalizedRules.configured) {
    return {
      projectedNextLeagueLevel: toNumberOrZero(leagueLevel) || null,
      status: CLUB_COMPETITION_STATUS.UNKNOWN,
      projectedRank: null,
      seasonProgressPct: 0,
    }
  }

  const targetStats = getLeagueTableRowStats(targetRow)
  const seasonProgressPct = Math.min(
    100,
    (targetStats.gamesPlayed / expectedGamesPerTeam) * 100
  )

  if (seasonProgressPct < 50) {
    return {
      projectedNextLeagueLevel: toNumberOrZero(leagueLevel) || null,
      status: CLUB_COMPETITION_STATUS.UNKNOWN,
      projectedRank: null,
      seasonProgressPct,
    }
  }

  const confirmedStatus = resolveMathematicalStatus({
    targetRow,
    rows: safeRows,
    expectedGamesPerTeam,
    competitionRules: normalizedRules,
  })
  const projectedRows = buildProjectedRows({ rows: safeRows, expectedGamesPerTeam })
  const projectedTarget = projectedRows.find(row => row.teamKey === targetKey)
  const projectedRank = projectedTarget?.projectedRank || null
  let status = CLUB_COMPETITION_STATUS.STABLE

  if (confirmedStatus) {
    status = confirmedStatus
  } else if (isPlaceInDirectZone(projectedRank, normalizedRules.promotion)) {
    status = CLUB_COMPETITION_STATUS.PROMOTION_POSSIBLE
  } else if (isPlaceInDirectZone(projectedRank, normalizedRules.relegation)) {
    status = CLUB_COMPETITION_STATUS.RELEGATION_RISK
  }

  return {
    projectedNextLeagueLevel: resolveProjectedLeagueLevel({ leagueLevel, status }),
    status,
    projectedRank,
    seasonProgressPct,
  }
}

export const normalizeManualCompetitionProjection = projection => {
  if (!projection || typeof projection !== 'object') return null

  const leagueLevel = Number(projection.projectedNextLeagueLevel)
  if (!Number.isFinite(leagueLevel) || leagueLevel <= 0) return null

  return {
    projectedNextLeagueLevel: leagueLevel,
    status: normalizeClubCompetitionStatus(projection.status),
  }
}

export const buildEffectiveCompetitionProjection = ({
  automaticProjection = {},
  manualProjection = null,
  seasonStatus = SEASON_STATUS.ACTIVE,
} = {}) => {
  const automatic = {
    projectedNextLeagueLevel: Number(automaticProjection?.projectedNextLeagueLevel) || null,
    status: normalizeClubCompetitionStatus(automaticProjection?.status),
    source: CLUB_COMPETITION_PROJECTION_SOURCE.AUTOMATIC,
  }
  const manual = normalizeManualCompetitionProjection(manualProjection)

  if (
    normalizeSeasonStatus(seasonStatus) === SEASON_STATUS.ACTIVE &&
    manual
  ) {
    return {
      ...manual,
      source: CLUB_COMPETITION_PROJECTION_SOURCE.MANUAL,
    }
  }

  return automatic
}

export const buildCompetitionProjectionState = ({
  automaticProjection = {},
  manualProjection = null,
  seasonStatus = SEASON_STATUS.ACTIVE,
} = {}) => {
  const normalizedManual = normalizeManualCompetitionProjection(manualProjection)
  const effective = buildEffectiveCompetitionProjection({
    automaticProjection,
    manualProjection: normalizedManual,
    seasonStatus,
  })

  return {
    automatic: {
      projectedNextLeagueLevel: Number(automaticProjection?.projectedNextLeagueLevel) || null,
      status: normalizeClubCompetitionStatus(automaticProjection?.status),
    },
    manual: normalizedManual,
    effective: {
      ...effective,
      source: normalizeClubCompetitionProjectionSource(effective.source),
    },
  }
}
