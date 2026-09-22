// src/shared/scouting/players/profileHierarchy/playerProfileDepth.js

const ATTACK_OUTPUT_PROFILE_IDS = new Set([
  'clear_scorer',
  'secondary_threat',
  'double_digit_threat',
])

const SCORING_RATE_PROFILE_IDS = new Set([
  'killer_efficiency',
])

const DEFENSIVE_PATTERN_PROFILE_IDS = new Set([
  'last_station',
])

const SUPPORTING_OUTPUT_PROFILE_IDS = new Set([
  'back_threat',
])

const toFiniteNumber = (value) => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const getGteDepth = ({ value, target }) => {
  const current = toFiniteNumber(value)
  const threshold = toFiniteNumber(target)

  if (!Number.isFinite(current) || !Number.isFinite(threshold) || threshold <= 0) return null
  if (current < threshold) return null

  return Math.max(0, (current - threshold) / threshold)
}

const getLteDepth = ({ value, target }) => {
  const current = toFiniteNumber(value)
  const threshold = toFiniteNumber(target)

  if (!Number.isFinite(current) || !Number.isFinite(threshold) || threshold <= 0) return null
  if (current > threshold) return null

  return Math.max(0, (threshold - current) / threshold)
}

const getBetweenDepth = ({ value, min, max, direction }) => {
  const current = toFiniteNumber(value)
  const lower = toFiniteNumber(min)
  const upper = toFiniteNumber(max)

  if (!Number.isFinite(current) || !Number.isFinite(lower) || !Number.isFinite(upper)) return null
  if (current < lower || current > upper) return null
  if (direction !== 'higher' || lower <= 0) return null

  return Math.max(0, (current - lower) / lower)
}

const getRuleDepth = ({ rule, metrics }) => {
  const value = metrics?.[rule.metric]

  if (rule.op === 'gte' || rule.op === 'gt') {
    return getGteDepth({ value, target: rule.value })
  }

  if (rule.op === 'lte' || rule.op === 'lt') {
    return getLteDepth({ value, target: rule.value })
  }

  if (rule.op === 'between') {
    return getBetweenDepth({
      value,
      min: rule.min,
      max: rule.max,
      direction: rule.depthDirection,
    })
  }

  return null
}

const buildMeasurableRules = ({ profile, metrics }) => {
  const rules = Array.isArray(profile?.rules) ? profile.rules : []

  return rules
    .map((rule) => {
      const depth = getRuleDepth({ rule, metrics })

      if (!Number.isFinite(depth)) return null

      const normalizedDepth = clamp(depth, 0, 1)

      return {
        metric: rule.metric,
        reason: rule.reason || rule.metric,
        depth: normalizedDepth,
        depthPct: Math.round(normalizedDepth * 100),
      }
    })
    .filter(Boolean)
}

const getRuleDepthByMetric = ({ measurableRules, metric }) => {
  const rule = measurableRules.find(item => item.metric === metric)
  return Number.isFinite(rule?.depth) ? rule.depth : null
}

const getLeagueDepthAdjustment = ({ leagueLevel }) => {
  const level = toFiniteNumber(leagueLevel)

  if (!Number.isFinite(level)) return 0
  if (level <= 1) return 0.15
  if (level <= 2) return 0.08
  if (level <= 3) return 0

  return -0.08
}

const getGoalShareAdjustment = ({ goalShare, leagueLevel }) => {
  const share = toFiniteNumber(goalShare)
  const level = toFiniteNumber(leagueLevel)

  if (!Number.isFinite(share) || share < 0) return 0
  if (share >= 0.3) return 0.2
  if (share >= 0.2) return 0.12
  if (share >= 0.1) return 0.05

  // בליגות 1-2 אחוז נמוך אינו מחליש פרופיל התקפי קיים.
  if (Number.isFinite(level) && level <= 2) return 0
  if (Number.isFinite(level) && level >= 4) return -0.07

  return -0.03
}

const getScoringRateAdjustment = ({ goalsPerGameDuration }) => {
  const rate = toFiniteNumber(goalsPerGameDuration)

  if (!Number.isFinite(rate) || rate < 0) return 0
  if (rate >= 0.8) return 0.15
  if (rate >= 0.6) return 0.1
  if (rate >= 0.4) return 0.05

  return 0
}

const getTeamAttackAdjustment = ({ teamContext }) => {
  const classification = String(
    teamContext?.attack?.classification || ''
  ).trim().toLowerCase()

  if (classification === 'supportive') return 0.05
  if (classification === 'adverse') return -0.05

  return 0
}

const buildAttackOutputDepth = ({
  profile,
  metrics,
  measurableRules,
  competitionContext,
  teamContext,
}) => {
  const baseDepth = getRuleDepthByMetric({ measurableRules, metric: 'goals' }) || 0
  const leagueLevel = competitionContext?.leagueLevel
  const goalShareAdjustment = getGoalShareAdjustment({
    goalShare: metrics?.goalsShareOfTeam,
    leagueLevel,
  })
  const scoringRateAdjustment = getScoringRateAdjustment({
    goalsPerGameDuration: metrics?.goalsPerGameDuration,
  })
  const leagueAdjustment = getLeagueDepthAdjustment({ leagueLevel })
  const teamAttackAdjustment = profile?.id === 'secondary_threat'
    ? getTeamAttackAdjustment({ teamContext })
    : 0
  const contextAdjustment = clamp(
    goalShareAdjustment +
    scoringRateAdjustment +
    leagueAdjustment +
    teamAttackAdjustment,
    -0.15,
    0.35
  )
  const performanceFloor = baseDepth * 0.5
  const depth = Math.max(performanceFloor, baseDepth + contextAdjustment)

  return {
    method: 'attack_output',
    depth,
    baseDepth,
    contextAdjustment,
    factors: {
      goalShareAdjustment,
      scoringRateAdjustment,
      leagueAdjustment,
      teamAttackAdjustment,
      performanceFloor,
    },
  }
}

const buildScoringRateDepth = ({ metrics, measurableRules, competitionContext }) => {
  const rateDepth = getRuleDepthByMetric({
    measurableRules,
    metric: 'goalsPerGameDuration',
  }) || 0
  const goalsDepth = getRuleDepthByMetric({ measurableRules, metric: 'goals' }) || 0
  const minutesDepth = getRuleDepthByMetric({ measurableRules, metric: 'minutes' }) || 0
  const baseDepth = rateDepth + clamp(goalsDepth * 0.15, 0, 0.15) + clamp(minutesDepth * 0.05, 0, 0.05)
  const leagueAdjustment = getLeagueDepthAdjustment({
    leagueLevel: competitionContext?.leagueLevel,
  })
  const goalShareAdjustment = getGoalShareAdjustment({
    goalShare: metrics?.goalsShareOfTeam,
    leagueLevel: competitionContext?.leagueLevel,
  })
  const contextAdjustment = clamp(leagueAdjustment + goalShareAdjustment, -0.12, 0.25)
  const performanceFloor = baseDepth * 0.5
  const depth = Math.max(performanceFloor, baseDepth + contextAdjustment)

  return {
    method: 'scoring_rate',
    depth,
    baseDepth,
    contextAdjustment,
    factors: {
      rateDepth,
      goalsSampleDepth: goalsDepth,
      minutesSampleDepth: minutesDepth,
      goalShareAdjustment,
      leagueAdjustment,
      performanceFloor,
    },
  }
}

const buildDefensivePatternDepth = ({ measurableRules, competitionContext }) => {
  const minutesDepth = getRuleDepthByMetric({ measurableRules, metric: 'minutesPct' }) || 0
  const lowGoalsDepth = getRuleDepthByMetric({ measurableRules, metric: 'goals' }) || 0
  const baseDepth = clamp((minutesDepth * 0.65) + (lowGoalsDepth * 0.35), 0, 1)
  const leagueAdjustment = getLeagueDepthAdjustment({
    leagueLevel: competitionContext?.leagueLevel,
  })
  const contextAdjustment = clamp(leagueAdjustment, -0.08, 0.15)
  const performanceFloor = baseDepth * 0.5
  const depth = Math.max(performanceFloor, baseDepth + contextAdjustment)

  return {
    method: 'defensive_pattern',
    depth,
    baseDepth,
    contextAdjustment,
    factors: {
      minutesDepth,
      lowGoalsDepth,
      leagueAdjustment,
      performanceFloor,
    },
  }
}

const buildPreliminaryLowOutputDepth = ({
  measurableRules,
  competitionContext,
}) => {
  const minutesDepth = getRuleDepthByMetric({
    measurableRules,
    metric: 'minutesPct',
  }) || 0
  const lowGoalsDepth = getRuleDepthByMetric({
    measurableRules,
    metric: 'goals',
  }) || 0
  const baseDepth = clamp(
    (minutesDepth * 0.75) +
    (lowGoalsDepth * 0.25),
    0,
    1
  )
  const leagueAdjustment = getLeagueDepthAdjustment({
    leagueLevel: competitionContext?.leagueLevel,
  })
  const contextAdjustment = clamp(
    leagueAdjustment,
    -0.08,
    0.15
  )
  const depth = clamp(baseDepth + contextAdjustment, 0, 1)

  return {
    method: 'preliminary_low_output',
    depth,
    baseDepth,
    contextAdjustment,
    factors: {
      minutesDepth,
      lowGoalsDepth,
      leagueAdjustment,
    },
  }
}

const buildSupportingOutputDepth = ({ metrics, measurableRules, competitionContext }) => {
  const goalsDepth = getRuleDepthByMetric({ measurableRules, metric: 'goals' }) || 0
  const minutesDepth = getRuleDepthByMetric({ measurableRules, metric: 'minutesPct' }) || 0
  const baseDepth = clamp((goalsDepth * 0.6) + (minutesDepth * 0.4), 0, 1)
  const leagueLevel = competitionContext?.leagueLevel
  const goalShareAdjustment = getGoalShareAdjustment({
    goalShare: metrics?.goalsShareOfTeam,
    leagueLevel,
  })
  const leagueAdjustment = getLeagueDepthAdjustment({ leagueLevel })
  const contextAdjustment = clamp(goalShareAdjustment + leagueAdjustment, -0.12, 0.25)
  const performanceFloor = baseDepth * 0.5
  const depth = Math.max(performanceFloor, baseDepth + contextAdjustment)

  return {
    method: 'supporting_output',
    depth,
    baseDepth,
    contextAdjustment,
    factors: {
      goalsDepth,
      minutesDepth,
      goalShareAdjustment,
      leagueAdjustment,
      performanceFloor,
    },
  }
}


const buildGenericDepth = ({ measurableRules }) => {
  const depth = measurableRules.length
    ? Math.min(...measurableRules.map(item => item.depth))
    : 0

  return {
    method: 'generic_threshold',
    depth,
    baseDepth: depth,
    contextAdjustment: 0,
    factors: {},
  }
}

export const buildPlayerProfileDepth = ({
  profile,
  metrics,
  competitionContext,
  teamContext,
} = {}) => {
  const measurableRules = buildMeasurableRules({ profile, metrics })
  let result = buildGenericDepth({ measurableRules })

  if (profile?.id === 'preliminary_low_output') {
    result = buildPreliminaryLowOutputDepth({
      measurableRules,
      competitionContext,
    })
  } else if (ATTACK_OUTPUT_PROFILE_IDS.has(profile?.id)) {
    result = buildAttackOutputDepth({
      profile,
      metrics,
      measurableRules,
      competitionContext,
      teamContext,
    })
  } else if (SCORING_RATE_PROFILE_IDS.has(profile?.id)) {
    result = buildScoringRateDepth({ metrics, measurableRules, competitionContext })
  } else if (DEFENSIVE_PATTERN_PROFILE_IDS.has(profile?.id)) {
    result = buildDefensivePatternDepth({ measurableRules, competitionContext })
  } else if (SUPPORTING_OUTPUT_PROFILE_IDS.has(profile?.id)) {
    result = buildSupportingOutputDepth({ metrics, measurableRules, competitionContext })
  }

  const depth = clamp(result.depth, 0, 1)
  const baseDepth = clamp(result.baseDepth, 0, 1)

  return {
    ...result,
    depth,
    baseDepth,
    depthPct: Math.round(depth * 100),
    baseDepthPct: Math.round(baseDepth * 100),
    contextAdjustmentPct: Math.round(result.contextAdjustment * 100),
    measurableRuleCount: measurableRules.length,
    rules: measurableRules,
  }
}
