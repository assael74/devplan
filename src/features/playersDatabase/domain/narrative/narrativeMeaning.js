// src/features/playersDatabase/domain/narrative/narrativeMeaning.js

import { createEmptyNarrativeMeaning } from './narrative.contract.js'

const clean = value => String(value || '').trim()

const toNullableNumber = value => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const unique = values => [...new Set(values.filter(Boolean))]

const getReasonId = value => clean(
  value?.id ||
  value?.reasonId ||
  value?.type ||
  value?.reason ||
  value?.code
)

const buildProfileMeaning = profile => {
  if (!profile) return null

  return {
    profileId: clean(profile.id),
    profileLabel: clean(profile.label),
    profileShortLabel: clean(profile.shortLabel),
    profileIdentity: clean(profile.profileIdentity),
    strengthDepthPct: toNullableNumber(profile?.profileStrength?.depthPct),
    requiredReview: unique(Array.isArray(profile.requiredReview)
      ? profile.requiredReview.map(clean)
      : []),
  }
}

const buildNearProfileMeaning = profile => {
  if (!profile) return null

  return {
    profileId: clean(profile.profileId),
    status: clean(profile.status),
    trend: clean(profile.trend),
    distancePct: toNullableNumber(profile.distancePct),
    distanceDeltaPct: toNullableNumber(profile.distanceDeltaPct),
  }
}

const buildPlayerInterestMeaning = value => {
  if (!value || typeof value !== 'object') return null

  return {
    assessmentScope: clean(value.assessmentScope),
    interestLevel: clean(value.interestLevel),
    primaryProfileId: clean(value.primaryProfileId),
    reasons: unique(Array.isArray(value.reasons) ? value.reasons.map(clean) : []),
    limitingFactors: unique(
      Array.isArray(value.limitingFactors) ? value.limitingFactors.map(clean) : []
    ),
    upgradeConditions: unique(
      Array.isArray(value.upgradeConditions) ? value.upgradeConditions.map(clean) : []
    ),
  }
}

const buildCaseStrengthMeaning = value => {
  if (!value || typeof value !== 'object') return null

  return {
    primaryProfileId: clean(value.primaryProfileId),
    profileCount: toNullableNumber(value.profileCount),
    supportingProfileIds: unique(
      Array.isArray(value.supportingProfileIds)
        ? value.supportingProfileIds.map(clean)
        : []
    ),
    hasDefinedCombination: Boolean(value.hasDefinedCombination),
    combinationCount: toNullableNumber(value.combinationCount),
    combinationIds: unique(
      Array.isArray(value.combinationIds)
        ? value.combinationIds.map(clean)
        : []
    ),
  }
}

const buildImmediacyMeaning = value => {
  const source = value && typeof value === 'object' ? value : {}
  const automatic = source.automatic || {}
  const manual = source.manual || {}

  return {
    effectiveActionStatus: clean(source.effectiveActionStatus),
    automatic: {
      baseActionStatus: clean(automatic.baseActionStatus),
      actionStatus: clean(automatic.actionStatus),
      boostIds: unique((Array.isArray(automatic.boosts) ? automatic.boosts : [])
        .map(getReasonId)),
      reductionIds: unique((Array.isArray(automatic.reductions) ? automatic.reductions : [])
        .map(getReasonId)),
    },
    manual: {
      hasDecision: Boolean(manual.hasDecision),
      actionStatus: clean(manual.actionStatus),
    },
  }
}

const buildPersistenceMeaning = value => {
  const source = value && typeof value === 'object' ? value : {}
  const profile = source.profile || {}
  const combination = source.combination || {}
  const signalDecay = source.signalDecay || {}

  return {
    profile: {
      profileId: clean(profile.profileId),
      seasons: toNullableNumber(profile.seasons),
    },
    combination: {
      combinationId: clean(combination.combinationId),
      profileIds: unique(Array.isArray(combination.profileIds)
        ? combination.profileIds.map(clean)
        : []),
      seasons: toNullableNumber(combination.seasons),
    },
    signalDecay: {
      seasonsWithoutSignal: toNullableNumber(signalDecay.seasonsWithoutSignal),
      profileIds: unique(Array.isArray(signalDecay.profileIds)
        ? signalDecay.profileIds.map(clean)
        : []),
      currentSeasonCounted: Boolean(signalDecay.currentSeasonCounted),
    },
  }
}

const buildFutureCompetitionMeaning = value => {
  if (!value || typeof value !== 'object') return null

  return {
    outlook: clean(value.outlook),
    currentLeagueLevel: toNullableNumber(value?.current?.leagueLevel),
    futureLeagueLevels: (Array.isArray(value.steps) ? value.steps : [])
      .map(step => toNullableNumber(step?.leagueLevel))
      .filter(level => level !== null),
    directions: unique((Array.isArray(value.steps) ? value.steps : [])
      .map(step => clean(step?.directionFromCurrent))),
    hasCompletePath: Boolean(value.hasCompletePath),
  }
}


const buildReviewMeaning = value => {
  if (!value || typeof value !== 'object') return { known: [], open: [] }

  const entries = Object.entries(value)
    .map(([field, review]) => {
      const status = clean(review?.status)
      const reviewValue = clean(review?.value)
      const isKnown = Boolean(
        (status && status !== 'unknown') ||
        (reviewValue && reviewValue !== 'unknown')
      )

      return {
        field: clean(field),
        status,
        value: reviewValue,
        seasonKey: clean(review?.seasonKey),
        isKnown,
      }
    })
    .filter(item => item.field)

  return {
    known: entries.filter(item => item.isKnown),
    open: entries.filter(item => !item.isKnown),
  }
}

const cleanUserLabel = value => clean(value)
  .replace(/סיגנלים/g, 'סימנים')
  .replace(/סיגנאלים/g, 'סימנים')
  .replace(/סיגנל/g, 'סימן')
  .replace(/סיגנאל/g, 'סימן')
  .replace(/המנוע/g, 'מודל הסקאוט')
  .replace(/מנוע/g, 'מודל הסקאוט')

const buildVerificationMeaning = (verification, openQuestions) => {
  const normalizeCheck = check => ({
    questionId: clean(check?.questionId),
    category: clean(check?.category),
    priority: clean(check?.priority),
    recommendationScore: toNullableNumber(check?.recommendationScore),
    answer: clean(check?.answer),
    answered: Boolean(check?.answered),
    label: cleanUserLabel(check?.label),
  })

  return {
    status: clean(verification?.status),
    completion: verification?.completion || null,
    nextBestCheck: verification?.nextBestCheck
      ? normalizeCheck(verification.nextBestCheck)
      : null,
    answeredChecks: (Array.isArray(verification?.answeredChecks)
      ? verification.answeredChecks
      : []).map(normalizeCheck),
    missingChecks: (Array.isArray(verification?.missingChecks)
      ? verification.missingChecks
      : []).map(normalizeCheck),
    openQuestions: unique(Array.isArray(openQuestions)
      ? openQuestions.map(cleanUserLabel)
      : []),
  }
}

const buildClosingGapMeaning = value => {
  if (!value || typeof value !== 'object') return null

  return {
    profileId: clean(value.profileId),
    status: clean(value.status),
    trend: clean(value.trend),
    distancePct: toNullableNumber(value.distancePct),
    distanceDeltaPct: toNullableNumber(value.distanceDeltaPct),
    basedOn: clean(value.basedOn),
  }
}

const buildEntryMeaning = entry => {
  const contract = entry?.scout?.contract || {}
  const primaryProfile = buildProfileMeaning(contract?.profiles?.primary)
  const supportingProfiles = (Array.isArray(contract?.profiles?.supporting)
    ? contract.profiles.supporting
    : [])
    .map(buildProfileMeaning)
    .filter(Boolean)
  const isCurrent = entry?.lifecycle?.type === 'current' || entry?.sourceTarget === 'current'
  const temporalRole = clean(entry?.temporalRole) || (isCurrent ? 'current' : 'historical')

  return {
    lifecycle: isCurrent ? 'current' : 'historical',
    temporalRole,
    teamId: clean(entry?.team?.teamId),
    clubId: clean(entry?.team?.clubId),
    leagueLevel: toNullableNumber(entry?.team?.leagueLevel),
    clubStrengthLevel: toNullableNumber(entry?.team?.clubStrengthLevel),
    ageGroupId: clean(entry?.team?.ageGroupId),
    isPlayingUp: entry?.age?.isPlayingUp === null || entry?.age?.isPlayingUp === undefined
      ? null
      : Boolean(entry.age.isPlayingUp),
    ageGap: toNullableNumber(entry?.age?.ageGap),
    profiles: {
      primary: primaryProfile,
      supporting: supportingProfiles,
      near: buildNearProfileMeaning(contract?.profiles?.near),
    },
    profileCaseStrength: buildCaseStrengthMeaning(contract?.profileCaseStrength),
    playerInterest: buildPlayerInterestMeaning(contract?.playerInterest),
    immediacy: buildImmediacyMeaning(contract?.immediacy),
    persistence: buildPersistenceMeaning(contract?.persistence),
    trajectory: clean(contract?.trajectory?.direction),
    progression: clean(contract?.progression?.status),
    closingGap: buildClosingGapMeaning(contract?.closingGap),
    transferDirection: clean(contract?.transferContext?.direction),
    futureCompetition: isCurrent
      ? buildFutureCompetitionMeaning(contract?.futureCompetition)
      : null,
    verification: buildVerificationMeaning(
      contract?.verification,
      contract?.openQuestions
    ),
    playerReview: buildReviewMeaning(contract?.playerReview),
    scoutEvidence: Array.isArray(contract?.scoutEvidence) ? contract.scoutEvidence : [],
  }
}

const buildSeasonMeaning = season => ({
  seasonKey: clean(season?.seasonKey || season?.seasonId),
  entries: (Array.isArray(season?.entries) ? season.entries : [])
    .map(buildEntryMeaning),
})

const buildHistoricalProfileEvidence = seasons => seasons
  .map(season => ({
    seasonKey: season.seasonKey,
    profileIds: unique(season.entries.flatMap(entry => [
      entry?.profiles?.primary?.profileId,
      ...(entry?.profiles?.supporting || []).map(profile => profile.profileId),
    ])),
    clubIds: unique(season.entries.map(entry => entry.clubId)),
    leagueLevels: unique(season.entries
      .map(entry => entry.leagueLevel === null ? '' : String(entry.leagueLevel))),
  }))
  .filter(item => item.profileIds.length || item.clubIds.length || item.leagueLevels.length)

const buildCareerMeaning = ({ seasons, events }) => {
  const entries = seasons.flatMap(season => season.entries || [])
  const currentEntries = entries.filter(entry => entry.lifecycle === 'current')
  const historicalSeasons = seasons
    .map(season => ({
      ...season,
      entries: season.entries.filter(entry => entry.lifecycle !== 'current'),
    }))
    .filter(season => season.entries.length)
  const safeEvents = Array.isArray(events) ? events : []

  return {
    current: currentEntries,
    history: buildHistoricalProfileEvidence(historicalSeasons),
    transferDirections: unique([
      ...entries.map(entry => entry.transferDirection),
      ...safeEvents.map(event => clean(event?.direction)),
    ]),
    transferTypes: unique(safeEvents.map(event => clean(event?.moveType || event?.type))),
    playingUpSeasons: seasons
      .filter(season => season.entries.some(entry => entry.isPlayingUp === true))
      .map(season => season.seasonKey),
    profileChanges: unique(entries.flatMap(entry => [
      entry?.profiles?.primary?.profileId,
      ...(entry?.profiles?.supporting || []).map(profile => profile.profileId),
    ])),
    competitionLevels: unique(entries
      .map(entry => entry.leagueLevel === null ? '' : String(entry.leagueLevel))),
    clubs: unique(entries.map(entry => entry.clubId)),
  }
}

export const buildNarrativeMeaning = input => {
  const result = createEmptyNarrativeMeaning()
  const seasons = (Array.isArray(input?.seasons) ? input.seasons : [])
    .map(buildSeasonMeaning)

  const seasonEntries = seasons.flatMap(season => (
    (season.entries || []).map(entry => ({
      ...entry,
      seasonKey: season.seasonKey,
    }))
  ))
  const currentEntries = seasonEntries.filter(entry => entry.temporalRole === 'current')
  const latestEntries = seasonEntries.filter(entry => entry.temporalRole === 'latest')
  const focusEntries = currentEntries.length ? currentEntries : latestEntries
  const focusSeasonKey = focusEntries[0]?.seasonKey || ''

  return {
    ...result,
    focus: {
      seasonKey: focusSeasonKey,
      entries: focusEntries,
    },
    historyContext: seasonEntries.filter(entry => entry.seasonKey !== focusSeasonKey),
    seasons,
    career: buildCareerMeaning({
      seasons,
      events: input?.events,
    }),
  }
}
