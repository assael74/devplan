// src/features/playersDatabase/domain/narrative/narrativeEvidence.js

const toRate = (value, total) => {
  const numberValue = Number(value)
  const numberTotal = Number(total)

  if (!Number.isFinite(numberValue) || !Number.isFinite(numberTotal) || numberTotal <= 0) {
    return null
  }

  return numberValue / numberTotal
}

const toNullableNumber = value => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const buildUsageEvidence = season => {
  const stats = season?.stats?.actual || {}
  const context = season?.stats?.context || {}

  return {
    games: toNullableNumber(stats.games),
    starts: toNullableNumber(stats.starts),
    minutes: toNullableNumber(stats.minutes),
    goals: toNullableNumber(stats.goals),
    startRate: toRate(stats.starts, stats.games),
    appearanceRate: toRate(stats.games, context.teamGames),
    goalShare: toRate(stats.goals, context.teamGoalsFor),
  }
}

const buildTeamContextEvidence = season => {
  const context = season?.stats?.context || {}

  return {
    teamGames: toNullableNumber(context.teamGames),
    teamRank: toNullableNumber(context.teamRank),
    teamGoalsFor: toNullableNumber(context.teamGoalsFor),
    teamGoalsAgainst: toNullableNumber(context.teamGoalsAgainst),
    performance: season?.teamPerformance || null,
  }
}

const buildProfileEvidenceItem = profile => {
  if (!profile) return null

  return {
    profileId: profile.id || '',
    profileLabel: profile.label || '',
    profileStrength: profile.profileStrength || null,
    matchEvidence: Array.isArray(profile.matchEvidence) ? profile.matchEvidence : [],
    requiredReview: Array.isArray(profile.requiredReview) ? profile.requiredReview : [],
    warnings: Array.isArray(profile.warnings) ? profile.warnings : [],
  }
}

const buildProfileCaseEvidence = contract => ({
  primary: buildProfileEvidenceItem(contract?.profiles?.primary),
  supporting: (Array.isArray(contract?.profiles?.supporting)
    ? contract.profiles.supporting
    : [])
    .map(buildProfileEvidenceItem)
    .filter(Boolean),
  near: contract?.profiles?.near || null,
  caseStrength: contract?.profileCaseStrength || null,
})

const buildImmediacyEvidence = contract => {
  const immediacy = contract?.immediacy || {}

  return {
    effectiveActionStatus: immediacy.effectiveActionStatus || '',
    automatic: immediacy.automatic || null,
    manual: immediacy.manual || null,
  }
}

const buildProgressEvidence = contract => ({
  persistence: contract?.persistence || null,
  trajectory: contract?.trajectory || null,
  progression: contract?.progression || null,
  closingGap: contract?.closingGap || null,
  measurements: contract?.measurements || null,
  measurementEvents: Array.isArray(contract?.measurementEvents)
    ? contract.measurementEvents
    : [],
})

export const buildNarrativeEvidence = (season, contract = null) => {
  const isCurrent = season?.lifecycle?.type === 'current' ||
    season?.metadata?.sourceTarget === 'current'

  return {
    profileCase: buildProfileCaseEvidence(contract),
    immediacy: buildImmediacyEvidence(contract),
    progress: buildProgressEvidence(contract),
    usage: buildUsageEvidence(season),
    teamContext: buildTeamContextEvidence(season),
    futureCompetition: isCurrent ? contract?.futureCompetition || null : null,
    playerReview: contract?.playerReview || null,
    verification: contract?.verification || null,
    openQuestions: Array.isArray(contract?.openQuestions)
      ? contract.openQuestions
      : [],
  }
}
