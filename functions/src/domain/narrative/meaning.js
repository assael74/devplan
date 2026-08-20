// C:\projects\devplan\functions\src\domain\narrative\meaning.js

function clean(value) {
  return String(value || '').trim()
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function buildTeamScoutMeaning(performance = null) {
  if (!performance || typeof performance !== 'object') return null

  return {
    targetLevel: clean(performance.targetLevel),
    rankingLevel: clean(performance.rankingLevel),
    anomalyLevel: clean(performance.anomalyLevel),
    priorityLevel: clean(performance.priorityLevel),
    opportunityType: clean(performance.opportunityType),
  }
}

function resolvePrimaryProfile(entry = {}) {
  const profiles = Array.isArray(entry.profiles) ? entry.profiles : []
  const primaryId = clean(entry.profileHierarchy?.primaryProfileId)

  if (primaryId) {
    return profiles.find(profile => clean(profile.profileId) === primaryId) || null
  }

  return profiles[0] || null
}

function resolveSupportingProfiles(entry = {}, primaryProfile = null) {
  const profiles = Array.isArray(entry.profiles) ? entry.profiles : []
  const supportingIds = Array.isArray(entry.profileHierarchy?.supportingProfileIds)
    ? entry.profileHierarchy.supportingProfileIds.map(clean).filter(Boolean)
    : []

  if (supportingIds.length) {
    return supportingIds
      .map(profileId => profiles.find(profile => clean(profile.profileId) === profileId) || null)
      .filter(Boolean)
  }

  const primaryId = clean(primaryProfile?.profileId)
  return profiles.filter(profile => clean(profile.profileId) !== primaryId)
}

function buildProfileMeaning(profile = null) {
  if (!profile) return null

  return {
    profileId: clean(profile.profileId),
    profileLabel: clean(profile.profileLabel),
    profileStrength: profile.profileStrength || null,
    warnings: Array.isArray(profile.warnings) ? profile.warnings.map(clean).filter(Boolean) : [],
  }
}

function buildNearProfileMeaning(entry = {}) {
  const nearest = entry.progression?.nearestProfile || null
  if (!nearest || typeof nearest !== 'object') return null

  return {
    profileId: clean(nearest.profileId),
    status: clean(nearest.status),
    trend: clean(nearest.trend),
    distancePct: numberOrNull(nearest.distancePct),
    distanceDeltaPct: numberOrNull(nearest.distanceDeltaPct),
  }
}

function buildPersistenceMeaning(opportunity = null) {
  const persistence = opportunity?.signalPersistence || null
  if (!persistence || typeof persistence !== 'object') return null

  return {
    profileRepeat: persistence.profileRepeat || null,
    combinationRepeat: persistence.combinationRepeat || null,
    decay: persistence.decay || null,
  }
}

function buildEntryMeaning(entry = {}, decision = {}) {
  const primaryProfile = resolvePrimaryProfile(entry)
  const supportingProfiles = resolveSupportingProfiles(entry, primaryProfile)
  const opportunity = entry.opportunity || null
  const isDecisionSeason = clean(entry.seasonKey || entry.seasonId) === clean(decision.seasonKey)

  return {
    sourceTarget: clean(entry.sourceTarget),
    isActiveSeason: Boolean(entry.isActiveSeason),
    seasonKey: clean(entry.seasonKey || entry.seasonId),
    birthTeamDocumentId: clean(entry.birthTeamDocumentId),
    birthTeamSlot: entry.birthTeamSlot,
    ageGroupId: clean(entry.ageGroupId),
    ageGroupLabel: clean(entry.ageGroupLabel),
    isPlayingUp: entry.isPlayingUp,
    leagueLevel: entry.leagueLevel,
    clubStrengthLevel: entry.clubStrengthLevel,
    profiles: {
      primary: buildProfileMeaning(primaryProfile),
      supporting: supportingProfiles.map(buildProfileMeaning).filter(Boolean),
      near: buildNearProfileMeaning(entry),
      caseStrength: entry.profileCaseStrength || null,
    },
    immediacy: isDecisionSeason ? {
      effectiveActionStatus: clean(opportunity?.effectiveActionStatus),
      automaticActionStatus: clean(
        opportunity?.automaticActionStatus || opportunity?.baseActionStatus
      ),
      manualActionStatus: clean(opportunity?.manualActionStatus),
      hasManualDecision: Boolean(opportunity?.hasManualDecision),
      baseActionStatus: clean(opportunity?.baseActionStatus),
      boosts: Array.isArray(opportunity?.boosts)
        ? opportunity.boosts.map(item => clean(item?.id)).filter(Boolean)
        : [],
      reductions: Array.isArray(opportunity?.reductions)
        ? opportunity.reductions.map(item => clean(item?.id)).filter(Boolean)
        : [],
    } : null,
    persistence: isDecisionSeason ? buildPersistenceMeaning(opportunity) : null,
    trajectory: entry.trajectory || null,
    progression: entry.progression || null,
    teamScout: {
      attack: buildTeamScoutMeaning(entry.stats?.teamAttackPerformance),
      defense: buildTeamScoutMeaning(entry.stats?.teamDefensePerformance),
    },
    verification: entry.verification || null,
  }
}

function buildMeaning({ context = {}, timeline = {}, decision = {} } = {}) {
  const entries = Array.isArray(context.entries) ? context.entries : []

  return {
    version: 3,
    entries: entries.map(entry => buildEntryMeaning(entry, decision)),
    transitions: (timeline.transitions || []).map(item => ({
      type: clean(item.type),
      seasonKey: clean(item.seasonKey),
      direction: clean(item.direction),
      moveType: clean(item.moveType),
      fromClubStrengthLevel: item.fromClubStrengthLevel,
      toClubStrengthLevel: item.toClubStrengthLevel,
      fromLeagueLevel: item.fromLeagueLevel,
      toLeagueLevel: item.toLeagueLevel,
    })),
    playerReview: context.playerReview || null,
    verification: context.verification || null,
    decision: {
      interestLevel: clean(decision.interestLevel),
      playerInterestLevel: clean(decision.playerInterestLevel || decision.interestLevel),
      profileInterestLevel: clean(decision.profileInterestLevel),
      combinationInterestLevel: clean(decision.combinationInterestLevel),
      interestAssessment: decision.interestAssessment || null,
      actionStatus: clean(decision.actionStatus),
      automaticActionStatus: clean(decision.automaticActionStatus),
      manualActionStatus: clean(decision.manualActionStatus),
      hasManualDecision: Boolean(decision.hasManualDecision),
      futureOutlook: clean(decision.futureOutlook),
      currentCompetitionLevel: decision.currentCompetitionLevel,
      nextCompetitionLevel: decision.nextCompetitionLevel,
    },
  }
}

module.exports = { buildMeaning }
