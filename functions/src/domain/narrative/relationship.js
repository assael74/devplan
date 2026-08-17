// C:\projects\devplan\functions\src\domain\narrative\relationship.js

function clean(value) {
  return String(value || '').trim()
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function ratioOrNull(numerator, denominator) {
  const safeNumerator = numberOrNull(numerator)
  const safeDenominator = numberOrNull(denominator)
  if (safeNumerator === null || safeDenominator === null || safeDenominator <= 0) return null

  return Number((safeNumerator / safeDenominator).toFixed(4))
}

function buildScoutSide(performance = null) {
  if (!performance || typeof performance !== 'object') return null

  return {
    target: {
      rate: numberOrNull(performance.targetRate),
      normalized: numberOrNull(performance.targetNormalized),
      level: clean(performance.targetLevel),
    },
    ranking: {
      rate: numberOrNull(performance.rankingRate),
      normalized: numberOrNull(performance.rankingNormalized),
      level: clean(performance.rankingLevel),
      rank: numberOrNull(performance.rank),
    },
    anomaly: {
      rate: numberOrNull(performance.anomalyRate),
      level: clean(performance.anomalyLevel),
    },
    quality: {
      rate: numberOrNull(performance.qualityRate),
    },
    priority: {
      score: numberOrNull(performance.scoutPriorityScore),
      level: clean(performance.priorityLevel),
    },
    opportunityType: clean(performance.opportunityType),
  }
}

function buildTeamScoutSnapshot(entry = {}) {
  const stats = entry.stats || {}

  return {
    team: {
      clubName: clean(entry.clubName),
      teamName: clean(entry.teamName),
      leagueName: clean(entry.leagueName),
      ageGroupId: clean(entry.ageGroupId),
      ageGroupLabel: clean(entry.ageGroupLabel),
      groupBirthYear: numberOrNull(entry.groupBirthYear),
      leagueLevel: numberOrNull(entry.leagueLevel),
      clubLevel: numberOrNull(entry.clubLevel),
      clubStrengthLevel: numberOrNull(entry.clubStrengthLevel),
    },
    results: {
      games: numberOrNull(stats.teamGames),
      rank: numberOrNull(stats.teamRank),
      goalsFor: numberOrNull(stats.teamGoalsFor),
      goalsAgainst: numberOrNull(stats.teamGoalsAgainst),
    },
    attack: buildScoutSide(stats.teamAttackPerformance),
    defense: buildScoutSide(stats.teamDefensePerformance),
  }
}

function buildPlayerInTeamSnapshot(entry = {}) {
  const stats = entry.stats || {}

  return {
    role: {
      primaryPosition: clean(entry.primaryPosition),
      positionLayer: clean(entry.positionLayer),
      profiles: (Array.isArray(entry.profiles) ? entry.profiles : []).map(profile => ({
        profileId: clean(profile.profileId),
        profileLabel: clean(profile.profileLabel),
        positionContext: clean(profile.positionContext),
        reliabilityLevel: clean(profile.reliability?.level),
      })),
    },
    appearances: numberOrNull(stats.games),
    starts: numberOrNull(stats.starts),
    minutes: numberOrNull(stats.minutes),
    goals: numberOrNull(stats.goals),
    appearanceRate: ratioOrNull(stats.games, stats.teamGames),
    startRate: ratioOrNull(stats.starts, stats.teamGames),
    startShareOfAppearances: ratioOrNull(stats.starts, stats.games),
    goalShare: ratioOrNull(stats.goals, stats.teamGoalsFor),
  }
}

function buildRelationship(context = {}) {
  const entries = Array.isArray(context.entries) ? context.entries : []

  return entries.map((entry, index) => ({
    ref: {
      index,
      seasonId: clean(entry.seasonId),
      seasonKey: clean(entry.seasonKey),
      birthTeamDocumentId: clean(entry.birthTeamDocumentId),
      birthTeamSlot: numberOrNull(entry.birthTeamSlot),
    },
    teamScoutSnapshot: buildTeamScoutSnapshot(entry),
    playerInTeamSnapshot: buildPlayerInTeamSnapshot(entry),
    interpretationGuard: {
      teamPerformanceIsContextNotPlayerAttribution: true,
      sideSpecificAttributionRequiresVerifiedRole: true,
    },
  }))
}

module.exports = {
  buildRelationship,
  buildPlayerInTeamSnapshot,
  buildTeamScoutSnapshot,
}
