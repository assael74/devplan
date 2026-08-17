// src/features/playersDatabase/domain/narrative/narrativeEvidence.js

const toRate = (value, total) => {
  const numberValue = Number(value)
  const numberTotal = Number(total)

  if (!Number.isFinite(numberValue) || !Number.isFinite(numberTotal) || numberTotal <= 0) {
    return null
  }

  return numberValue / numberTotal
}

const buildStatsEvidence = season => {
  const stats = season?.stats?.actual || {}
  const context = season?.stats?.context || {}

  return {
    games: Number(stats.games) || 0,
    starts: Number(stats.starts) || 0,
    minutes: Number(stats.minutes) || 0,
    goals: Number(stats.goals) || 0,
    yellowCards: Number(stats.yellowCards) || 0,
    substituteIn: Number(stats.substituteIn) || 0,
    substitutedOut: Number(stats.substitutedOut) || 0,
    startRate: toRate(stats.starts, stats.games),
    goalsPerGame: toRate(stats.goals, stats.games),
    teamGames: Number(context.teamGames) || 0,
    teamRank: context.teamRank === null || context.teamRank === undefined
      ? null
      : Number(context.teamRank),
    teamGoalsFor: Number(context.teamGoalsFor) || 0,
    teamGoalsAgainst: Number(context.teamGoalsAgainst) || 0,
    goalShare: toRate(stats.goals, context.teamGoalsFor),
  }
}

const buildProfileEvidence = season => {
  const profile = season?.scout?.primaryProfile

  if (!profile) return null

  return {
    id: profile.id || '',
    label: profile.label || '',
    score: profile.score === undefined ? null : profile.score,
    interest: profile.interest || '',
    profileStrength: profile.profileStrength || null,
    profileDepth: profile.profileDepth || null,
    metrics: profile.metrics || {},
    reasons: profile.match?.reasons || [],
    matchEvidence: profile.matchEvidence || [],
    warnings: profile.warnings || [],
  }
}

export const buildNarrativeEvidence = season => ({
  stats: buildStatsEvidence(season),
  profile: buildProfileEvidence(season),
  teamPerformance: season?.teamPerformance || null,
  measurements: season?.scout?.statsLoadMeasurements || null,
  measurementEvents: season?.scout?.statsLoadMeasurementHistoryEvents || [],
})
