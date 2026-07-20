// shared/teams/targets/teamTargets.normalization.js

import {
  TEAM_TARGET_REFERENCE_POINT_STATUS,
  buildLeagueGoalsReferencePoint,
} from './teamTargets.referencePoint.js'

export const TEAM_TARGET_NORMALIZATION_MODE = {
  AUTO: 'auto',
  OFF: 'off',
  MANUAL: 'manual',
}

export const TEAM_TARGET_NORMALIZATION_REASON = {
  APPLIED_AUTO: 'deviation_above_5_percent',
  SKIPPED_SMALL_DEVIATION: 'deviation_within_5_percent',
  DISABLED_BY_USER: 'disabled_by_user',
  MANUAL_FACTOR: 'manual_factor',
  MISSING_LEAGUE_GOALS_PER_MATCH: 'missing_league_goals_per_match',
  MISSING_BASE_GOALS_PER_MATCH: 'missing_base_goals_per_match',
  INVALID_MANUAL_FACTOR: 'invalid_manual_factor',
  REFERENCE_POINT_LOW_SAMPLE: 'reference_point_low_sample',
  APPLIED_EARLY_SAMPLE: 'early_sample_projected_pace',
}

export const TEAM_TARGET_NORMALIZATION_CONFIG = {
  defaultBaseGoalsPerMatch: 3,
  autoThresholdPct: 5,
}

const GOAL_VALUE_KEYS = [
  'goalsFor',
  'goalsAgainst',
  'goalDifference',
]

const GOAL_GROUP_KEYS = [
  'goalsFor',
  'goalsAgainst',
]

const toNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') return fallback

  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const roundNumber = (value, digits = 2) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Number(n.toFixed(digits))
}

const normalizeMode = (value) => {
  const mode = String(value || '').trim()

  if (mode === TEAM_TARGET_NORMALIZATION_MODE.OFF) {
    return TEAM_TARGET_NORMALIZATION_MODE.OFF
  }

  if (mode === TEAM_TARGET_NORMALIZATION_MODE.MANUAL) {
    return TEAM_TARGET_NORMALIZATION_MODE.MANUAL
  }

  return TEAM_TARGET_NORMALIZATION_MODE.AUTO
}

const pickFirstNumber = (...values) => {
  for (const value of values) {
    const n = toNumber(value, null)
    if (Number.isFinite(n) && n > 0) return n
  }

  return null
}

const multiplyNumber = ({
  value,
  factor,
  digits = 2,
}) => {
  const n = toNumber(value, null)

  if (!Number.isFinite(n)) return value

  return roundNumber(n * factor, digits)
}

const hasAppliedNormalization = (normalization = {}) => {
  return (
    normalization?.applied === true &&
    Number.isFinite(toNumber(normalization?.appliedFactor, null)) &&
    toNumber(normalization?.appliedFactor, 1) !== 1
  )
}

export const resolveTeamTargetsNormalizationInput = (raw = {}) => {
  const referencePoint =
    raw?.leagueReferencePoint ||
    raw?.goalsReferencePoint ||
    (
      Array.isArray(raw?.leagueTableRows)
        ? buildLeagueGoalsReferencePoint({
            rows: raw.leagueTableRows,
            leagueNumGames: raw?.leagueNumGames,
          })
        : null
    )

  return {
    mode:
      raw?.targetNormalizationMode ||
      raw?.goalsNormalizationMode ||
      raw?.normalizationMode ||
      '',

    manualFactor:
      raw?.targetNormalizationFactor ??
      raw?.goalsNormalizationFactor ??
      raw?.normalizationFactor ??
      null,

    leagueGoalsPerMatch:
      pickFirstNumber(
        referencePoint?.cleanLeagueGoalsPerMatch,
        raw?.leagueGoalsPerMatch,
        raw?.leagueBenchmarkGoalsPerMatch,
        raw?.targetLeagueGoalsPerMatch,
        raw?.normalizationLeagueGoalsPerMatch
      ),

    baseGoalsPerMatch: pickFirstNumber(
      raw?.benchmarkBaseGoalsPerMatch,
      raw?.targetBenchmarkBaseGoalsPerMatch,
      raw?.normalizationBaseGoalsPerMatch
    ),

    referencePoint,
  }
}

export const buildTeamTargetsNormalization = ({
  mode,
  manualFactor,
  leagueGoalsPerMatch,
  baseGoalsPerMatch,
  referencePoint,
} = {}) => {
  const userMode = normalizeMode(mode)
  const base = pickFirstNumber(
    baseGoalsPerMatch,
    TEAM_TARGET_NORMALIZATION_CONFIG.defaultBaseGoalsPerMatch
  )
  const league = pickFirstNumber(leagueGoalsPerMatch)
  const manual = toNumber(manualFactor, null)
  const sampleStatus = referencePoint?.status || ''
  const hasLowReferenceSample =
    sampleStatus &&
    sampleStatus !== TEAM_TARGET_REFERENCE_POINT_STATUS.READY

  const unavailable = ({
    reason,
  }) => {
    return {
      available: false,
      baseGoalsPerMatch: base,
      leagueGoalsPerMatch: league,
      rawFactor: 1,
      deviationPct: 0,
      autoShouldNormalize: false,
      userMode,
      manualFactor: manual,
      applied: false,
      appliedFactor: 1,
      reason,
      referencePoint: referencePoint || null,
      sampleStatus,
    }
  }

  if (!base) {
    return unavailable({
      reason: TEAM_TARGET_NORMALIZATION_REASON.MISSING_BASE_GOALS_PER_MATCH,
    })
  }

  if (!league) {
    if (userMode === TEAM_TARGET_NORMALIZATION_MODE.MANUAL && manual > 0) {
      return {
        available: true,
        baseGoalsPerMatch: base,
        leagueGoalsPerMatch: null,
        rawFactor: 1,
        deviationPct: 0,
        autoShouldNormalize: false,
        userMode,
        manualFactor: roundNumber(manual, 3),
        applied: manual !== 1,
        appliedFactor: roundNumber(manual, 3),
        reason: TEAM_TARGET_NORMALIZATION_REASON.MANUAL_FACTOR,
        referencePoint: referencePoint || null,
        sampleStatus,
      }
    }

    return unavailable({
      reason: TEAM_TARGET_NORMALIZATION_REASON.MISSING_LEAGUE_GOALS_PER_MATCH,
    })
  }

  const rawFactor = league / base
  const deviationPct = Math.abs(rawFactor - 1) * 100
  const autoShouldNormalize =
    deviationPct > TEAM_TARGET_NORMALIZATION_CONFIG.autoThresholdPct

  if (userMode === TEAM_TARGET_NORMALIZATION_MODE.OFF) {
    return {
      available: true,
      baseGoalsPerMatch: roundNumber(base, 2),
      leagueGoalsPerMatch: roundNumber(league, 2),
      rawFactor: roundNumber(rawFactor, 3),
      deviationPct: roundNumber(deviationPct, 2),
      autoShouldNormalize,
      userMode,
      manualFactor: manual,
      applied: false,
      appliedFactor: 1,
      reason: TEAM_TARGET_NORMALIZATION_REASON.DISABLED_BY_USER,
      referencePoint: referencePoint || null,
      sampleStatus,
    }
  }

  if (userMode === TEAM_TARGET_NORMALIZATION_MODE.MANUAL) {
    if (!manual || manual <= 0) {
      return {
        available: true,
        baseGoalsPerMatch: roundNumber(base, 2),
        leagueGoalsPerMatch: roundNumber(league, 2),
        rawFactor: roundNumber(rawFactor, 3),
        deviationPct: roundNumber(deviationPct, 2),
        autoShouldNormalize,
        userMode,
        manualFactor: manual,
        applied: false,
        appliedFactor: 1,
        reason: TEAM_TARGET_NORMALIZATION_REASON.INVALID_MANUAL_FACTOR,
        referencePoint: referencePoint || null,
        sampleStatus,
      }
    }

    return {
      available: true,
      baseGoalsPerMatch: roundNumber(base, 2),
      leagueGoalsPerMatch: roundNumber(league, 2),
      rawFactor: roundNumber(rawFactor, 3),
      deviationPct: roundNumber(deviationPct, 2),
      autoShouldNormalize,
      userMode,
      manualFactor: roundNumber(manual, 3),
      applied: manual !== 1,
      appliedFactor: roundNumber(manual, 3),
      reason: TEAM_TARGET_NORMALIZATION_REASON.MANUAL_FACTOR,
      referencePoint: referencePoint || null,
      sampleStatus,
    }
  }

  return {
    available: true,
    baseGoalsPerMatch: roundNumber(base, 2),
    leagueGoalsPerMatch: roundNumber(league, 2),
    rawFactor: roundNumber(rawFactor, 3),
    deviationPct: roundNumber(deviationPct, 2),
    autoShouldNormalize,
    userMode,
    manualFactor: manual,
    applied: autoShouldNormalize,
    appliedFactor: autoShouldNormalize ? roundNumber(rawFactor, 3) : 1,
    reason: autoShouldNormalize
      ? hasLowReferenceSample
        ? TEAM_TARGET_NORMALIZATION_REASON.APPLIED_EARLY_SAMPLE
        : TEAM_TARGET_NORMALIZATION_REASON.APPLIED_AUTO
      : hasLowReferenceSample
        ? TEAM_TARGET_NORMALIZATION_REASON.REFERENCE_POINT_LOW_SAMPLE
        : TEAM_TARGET_NORMALIZATION_REASON.SKIPPED_SMALL_DEVIATION,
    referencePoint: referencePoint || null,
    sampleStatus,
  }
}

export const normalizeTeamTargetValues = ({
  values,
  normalization,
} = {}) => {
  if (!values || !hasAppliedNormalization(normalization)) return values || {}

  const factor = toNumber(normalization.appliedFactor, 1)

  return {
    ...values,
    ...GOAL_VALUE_KEYS.reduce((acc, key) => {
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        acc[key] = multiplyNumber({
          value: values[key],
          factor,
          digits: key === 'goalDifference' ? 0 : 0,
        })
      }

      return acc
    }, {}),
  }
}

export const normalizeTeamTargetGroups = ({
  groups,
  normalization,
} = {}) => {
  if (!groups || !hasAppliedNormalization(normalization)) return groups || {}

  const factor = toNumber(normalization.appliedFactor, 1)

  const normalizeBucket = (bucket = {}) => {
    if (!bucket || typeof bucket !== 'object') return bucket

    return {
      ...bucket,
      ...GOAL_GROUP_KEYS.reduce((acc, key) => {
        if (Object.prototype.hasOwnProperty.call(bucket, key)) {
          acc[key] = multiplyNumber({
            value: bucket[key],
            factor,
          })
        }

        return acc
      }, {}),
    }
  }

  return {
    ...groups,
    homeAway: groups.homeAway
      ? {
          ...groups.homeAway,
          home: normalizeBucket(groups.homeAway.home),
          away: normalizeBucket(groups.homeAway.away),
        }
      : groups.homeAway,
    difficulty: groups.difficulty
      ? {
          ...groups.difficulty,
          easy: normalizeBucket(groups.difficulty.easy),
          equal: normalizeBucket(groups.difficulty.equal),
          hard: normalizeBucket(groups.difficulty.hard),
        }
      : groups.difficulty,
  }
}
