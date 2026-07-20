// src/shared/teams/scout/teamScout.model.js

export const TEAM_SCOUT_ANOMALY_LEVEL = {
  BELOW: 'below',
  EXPECTED: 'expected',
  MODERATE: 'moderate',
  STRONG: 'strong',
  EXTREME: 'extreme',
  UNAVAILABLE: 'unavailable',
}

export const TEAM_SCOUT_ANOMALY_THRESHOLDS = {
  below: 90,
  expectedMax: 110,
  moderateMax: 125,
  strongMax: 150,
}

export const TEAM_SCOUT_SORT_MODE = {
  OFFENSE: 'offense',
  DEFENSE: 'defense',
  TABLE: 'table',
}

export const TEAM_SCOUT_NORMALIZATION_MODE = {
  OFF: 'off',
  AUTO: 'auto',
  MANUAL: 'manual',
}

export const TEAM_SCOUT_PRIORITY_LEVEL = {
  ELITE: 'elite',
  HIGH: 'high',
  POSITIVE: 'positive',
  NEUTRAL: 'neutral',
  LOW: 'low',
  UNAVAILABLE: 'unavailable',
}

export const TEAM_SCOUT_NORMALIZATION_CONFIG = {
  autoThresholdPct: 5,
}

export const resolveTeamScoutPriorityLevel = (rate) => {
  const value = Number(rate)

  if (!Number.isFinite(value)) return TEAM_SCOUT_PRIORITY_LEVEL.UNAVAILABLE
  if (value >= 140) return TEAM_SCOUT_PRIORITY_LEVEL.ELITE
  if (value >= 115) return TEAM_SCOUT_PRIORITY_LEVEL.HIGH
  if (value >= 100) return TEAM_SCOUT_PRIORITY_LEVEL.POSITIVE
  if (value >= 85) return TEAM_SCOUT_PRIORITY_LEVEL.NEUTRAL

  return TEAM_SCOUT_PRIORITY_LEVEL.LOW
}

export const resolveTeamScoutAnomalyLevel = (rate) => {
  const value = Number(rate)

  if (!Number.isFinite(value)) return TEAM_SCOUT_ANOMALY_LEVEL.UNAVAILABLE
  if (value < TEAM_SCOUT_ANOMALY_THRESHOLDS.below) {
    return TEAM_SCOUT_ANOMALY_LEVEL.BELOW
  }
  if (value <= TEAM_SCOUT_ANOMALY_THRESHOLDS.expectedMax) {
    return TEAM_SCOUT_ANOMALY_LEVEL.EXPECTED
  }
  if (value <= TEAM_SCOUT_ANOMALY_THRESHOLDS.moderateMax) {
    return TEAM_SCOUT_ANOMALY_LEVEL.MODERATE
  }
  if (value <= TEAM_SCOUT_ANOMALY_THRESHOLDS.strongMax) {
    return TEAM_SCOUT_ANOMALY_LEVEL.STRONG
  }

  return TEAM_SCOUT_ANOMALY_LEVEL.EXTREME
}
