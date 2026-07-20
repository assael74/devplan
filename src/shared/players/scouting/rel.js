// src/shared/players/scouting/rel.js

import {
  SCOUT_RELIABILITY,
  SCOUT_WARNING,
} from './ids.js'

const DEP_SCORE = {
  low: 90,
  medium: 65,
  high: 40,
}

const WEIGHTS = {
  sampleSize: 0.2,
  dataCompleteness: 0.2,
  positionDependency: 0.18,
  teamContextDependency: 0.16,
  teamGamesSample: 0.14,
  timeConsistency: 0.12,
}

const levelFromScore = (score) => {
  if (score >= 75) return SCOUT_RELIABILITY.HIGH
  if (score >= 50) return SCOUT_RELIABILITY.MEDIUM

  return SCOUT_RELIABILITY.LOW
}

const factor = ({ score, reason }) => {
  return {
    score: Math.round(score),
    level: levelFromScore(score),
    reason,
  }
}

const dataCompletenessScore = (availability = {}) => {
  const keys = [
    'minutes',
    'games',
    'starts',
    'substitutions',
    'goals',
    'yellowCards',
    'birthYear',
    'teamGoals',
    'timeSeries',
  ]

  const filled = keys.filter((key) => availability[key] === true).length

  return (filled / keys.length) * 100
}

const dependencyScore = ({ dependency, isResolved }) => {
  if (dependency === 'low') return 90
  if (dependency === 'medium') return isResolved ? 80 : 55
  if (dependency === 'high') return isResolved ? 75 : 30

  return 70
}

const buildWarnings = ({ profile, metrics, availability, factors }) => {
  const warnings = new Set(profile?.warnings || [])

  if (!metrics.hasPosition) warnings.add(SCOUT_WARNING.POSITION_MISSING)
  if (factors.sampleSize.level === SCOUT_RELIABILITY.LOW) {
    warnings.add(SCOUT_WARNING.LOW_SAMPLE)
  }
  if (factors.teamGamesSample.level === SCOUT_RELIABILITY.LOW) {
    warnings.add(SCOUT_WARNING.LOW_TEAM_SAMPLE)
  }
  if (profile?.deps?.team === 'high') {
    warnings.add(SCOUT_WARNING.TEAM_CONTEXT_SENSITIVE)
  }

  return [...warnings]
}

export const buildScoutReliability = ({ profile, metrics, availability }) => {
  const sampleScore = Math.min(100, Math.max(
    metrics.minutesPct * 100,
    metrics.games >= 12 ? 80 : metrics.games * 6
  ))
  const completenessScore = dataCompletenessScore(availability)
  const positionScore = dependencyScore({
    dependency: profile?.deps?.position,
    isResolved: metrics.hasPosition,
  })
  const teamScore = dependencyScore({
    dependency: profile?.deps?.team,
    isResolved: metrics.teamGames >= 8,
  })
  const teamGamesScore = metrics.teamGames >= 8
    ? Math.min(100, 55 + metrics.teamGames * 3)
    : metrics.teamGames * 7
  const consistencyScore = availability.timeSeries
    ? Math.min(100, 50 + metrics.scoringGamesPct * 100)
    : DEP_SCORE.medium

  const factors = {
    sampleSize: factor({ score: sampleScore, reason: 'player_minutes_and_games' }),
    dataCompleteness: factor({ score: completenessScore, reason: 'available_fields' }),
    positionDependency: factor({ score: positionScore, reason: 'position_dependency' }),
    teamContextDependency: factor({ score: teamScore, reason: 'team_context_dependency' }),
    teamGamesSample: factor({ score: teamGamesScore, reason: 'team_games_sample' }),
    timeConsistency: factor({ score: consistencyScore, reason: 'time_series_consistency' }),
  }

  const rawScore = Object.entries(WEIGHTS).reduce((sum, [key, weight]) => {
    return sum + factors[key].score * weight
  }, 0)
  const score = metrics.hasPosition ? rawScore : Math.min(rawScore, 49)

  return {
    score: Math.round(score),
    level: levelFromScore(score),
    factors,
    warnings: buildWarnings({ profile, metrics, availability, factors }),
  }
}
