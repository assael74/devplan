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

  return null
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

  return []
}

function buildProfileMeaning(profile = null) {
  if (!profile) return null

  return {
    profileId: clean(profile.profileId),
    profileLabel: clean(profile.profileLabel),
    profileShortLabel: clean(profile.profileShortLabel),
    profileIdentity: clean(profile.profileIdentity),
    profileStrength: profile.profileStrength || null,
    requiredReview: Array.isArray(profile.requiredReview)
      ? profile.requiredReview.map(clean).filter(Boolean)
      : [],
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

function cleanUserLabel(value) {
  return clean(value)
    .replace(/סיגנלים/g, 'סימנים')
    .replace(/סיגנאלים/g, 'סימנים')
    .replace(/סיגנל/g, 'סימן')
    .replace(/סיגנאל/g, 'סימן')
    .replace(/המנוע/g, 'מודל הסקאוט')
    .replace(/מנוע/g, 'מודל הסקאוט')
}

function normalizeVerificationCheck(check = {}) {
  return {
    questionId: clean(check.questionId),
    category: clean(check.category),
    priority: clean(check.priority),
    recommendationScore: numberOrNull(check.recommendationScore),
    answer: clean(check.answer),
    answered: Boolean(check.answered),
    label: cleanUserLabel(check.label),
  }
}

function buildVerificationContext(verification = null) {
  if (!verification || typeof verification !== 'object') return null

  const answeredChecks = Array.isArray(verification.answeredChecks)
    ? verification.answeredChecks.map(normalizeVerificationCheck)
    : []
  const missingChecks = Array.isArray(verification.missingChecks)
    ? verification.missingChecks.map(normalizeVerificationCheck)
    : []
  const nextBestCheck = verification.nextBestCheck
    ? normalizeVerificationCheck(verification.nextBestCheck)
    : null

  return {
    completion: verification.completion || null,
    nextBestCheck,
    answeredChecks,
    missingChecks,
  }
}

function normalizeReviewValue(review = {}) {
  const status = clean(review.status)
  const value = clean(review.value)

  return {
    status,
    value,
    note: clean(review.note),
    seasonKey: clean(review.seasonKey),
    isKnown: Boolean(
      (status && status !== 'unknown') ||
      (value && value !== 'unknown')
    ),
  }
}

function buildPlayerReviewContext(playerReview = null) {
  if (!playerReview || typeof playerReview !== 'object') return null

  const entries = Object.entries(playerReview).map(([field, review]) => ({
    field: clean(field),
    ...normalizeReviewValue(review || {}),
  }))

  return {
    known: entries.filter(item => item.isKnown),
    open: entries.filter(item => !item.isKnown),
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
    isLatestSeason: Boolean(entry.isLatestSeason),
    temporalRole: clean(entry.temporalRole),
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
      professionalProfileIds: Array.isArray(entry.profileHierarchy?.professionalProfileIds)
        ? entry.profileHierarchy.professionalProfileIds.map(clean).filter(Boolean)
        : [],
      opportunityProfileIds: Array.isArray(entry.profileHierarchy?.opportunityProfileIds)
        ? entry.profileHierarchy.opportunityProfileIds.map(clean).filter(Boolean)
        : [],
      preliminaryProfileIds: Array.isArray(entry.profileHierarchy?.preliminaryProfileIds)
        ? entry.profileHierarchy.preliminaryProfileIds.map(clean).filter(Boolean)
        : [],
    },
    immediacy: isDecisionSeason ? {
      effectiveActionStatus: clean(opportunity?.effectiveActionStatus),
      automaticActionStatus: clean(opportunity?.automaticActionStatus),
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
    verification: buildVerificationContext(entry.verification),
    scoutEvidence: Array.isArray(entry.scoutEvidence) ? entry.scoutEvidence : [],
  }
}

function buildMeaning({ context = {}, timeline = {}, decision = {} } = {}) {
  const entries = Array.isArray(context.entries) ? context.entries : []

  const entryMeanings = entries.map(entry => buildEntryMeaning(entry, decision))
  const focusEntry = entryMeanings.find(entry => entry.seasonKey === clean(decision.seasonKey)) || null

  const historyEntries = entryMeanings.filter(entry => (
    !focusEntry || entry.seasonKey !== focusEntry.seasonKey
  ))

  return {
    version: 6,
    focus: {
      season: focusEntry,
      history: historyEntries,
    },
    currentAssessment: {
      seasonKey: clean(decision.seasonKey),
      playerInterest: decision.interestAssessment || null,
      playerInterestLevel: clean(decision.playerInterestLevel || decision.interestLevel),
      actionStatus: clean(decision.actionStatus),
      automaticActionStatus: clean(decision.automaticActionStatus),
      manualActionStatus: clean(decision.manualActionStatus),
      hasManualDecision: Boolean(decision.hasManualDecision),
      profileCaseStrength: focusEntry?.profiles?.caseStrength || null,
      primaryProfile: focusEntry?.profiles?.primary || null,
      supportingProfiles: focusEntry?.profiles?.supporting || [],
      verification: focusEntry?.verification || null,
      playerReview: buildPlayerReviewContext(context.playerReview),
      scoutEvidence: focusEntry?.scoutEvidence || [],
    },
    historyContext: historyEntries.map(entry => ({
      seasonKey: entry.seasonKey,
      temporalRole: entry.temporalRole,
      profiles: entry.profiles,
      persistence: entry.persistence,
      trajectory: entry.trajectory,
      progression: entry.progression,
      teamScout: entry.teamScout,
    })),
    entries: entryMeanings,
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
    playerReview: buildPlayerReviewContext(context.playerReview),
    verification: buildVerificationContext(context.verification),
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
