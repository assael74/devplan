// src/features/playersDatabase/domain/orchestration/mutatePlayerScoutProfileState.js

import {
  buildPlayerScoutOpportunity,
  aggregatePlayerScoutSpotlights,
  buildPlayerProfileCaseStrength,
  buildPlayerProfileHierarchy,
  buildPlayerInterest,
  buildPlayerVerification,
  buildScoutProfileCombinations,
} from '../../../../shared/scouting/players/index.js'

const clean = value => String(value || '').trim()

const resolveProfileId = value => clean(value?.profileId || value?.id)

const filterProfileValues = (values, profileId) => (
  (Array.isArray(values) ? values : [])
    .filter(value => resolveProfileId(value) !== profileId)
)

const resolveVerificationAnswers = verification => (
  (Array.isArray(verification?.checks) ? verification.checks : [])
    .filter(check => clean(check?.questionId))
    .map(check => ({
      questionId: clean(check.questionId),
      answer: clean(check.answer),
    }))
)

const removeProfileFromProgression = (progression, profileId) => {
  if (!progression || typeof progression !== 'object') return null

  const distances = filterProfileValues(progression.distances, profileId)
  const nearProfiles = filterProfileValues(progression.nearProfiles, profileId)

  return {
    ...progression,
    distances,
    nearProfiles,
    nearestProfile: nearProfiles[0] || null,
  }
}

export const removePlayerScoutProfileFromComputedState = ({ player = {}, profileId = '' } = {}) => {
  const removeProfileId = clean(profileId)
  if (!removeProfileId) return player

  const signals = filterProfileValues(
    Array.isArray(player.scoutSignals)
      ? player.scoutSignals
      : player.scoutProfiles,
    removeProfileId
  )
  const candidateSignals = filterProfileValues(
    player.scoutCandidateSignals,
    removeProfileId
  )
  const combinations = buildScoutProfileCombinations({ signals })
  const profileHierarchy = buildPlayerProfileHierarchy({ signals })
  const profileCaseStrength = buildPlayerProfileCaseStrength({
    signals,
    combinations,
    profileHierarchy,
  })
  const opportunity = buildPlayerScoutOpportunity({
    signals,
    candidateSignals,
    combinations,
    profileCaseStrength,
    playerTrajectory: player.scoutTrajectory,
    futureCompetitionPath: player.futureCompetitionPath,
    immediacyContext: player.immediacyContext,
    currentSeasonKey: player.seasonKey || player.season || '',
    currentSeasonStatus: player.seasonStatus || '',
    manualImmediacyDecision: player.manualImmediacyDecision,
  })
  const verification = buildPlayerVerification({
    player,
    signals,
    candidateSignals,
    opportunity,
    answers: resolveVerificationAnswers(player.scoutVerification),
  })
  const playerInterest = buildPlayerInterest({
    signals,
    combinations,
    profileHierarchy,
    profileCaseStrength,
    opportunity,
    verification,
    playerReview: player.playerReview,
  })

  return {
    ...player,
    scoutSignals: signals,
    scoutProfiles: signals,
    scoutCombinations: combinations,
    bestScoutSignal: profileHierarchy.primarySignal,
    scoutCandidateSignals: candidateSignals,
    scoutSpotlights: aggregatePlayerScoutSpotlights(signals),
    scoutOpportunity: opportunity,
    scoutVerification: verification,
    scoutProfileProgression: removeProfileFromProgression(
      player.scoutProfileProgression,
      removeProfileId
    ),
    scoutProfileHierarchy: profileHierarchy,
    scoutProfileCaseStrength: profileCaseStrength,
    scoutPlayerInterest: playerInterest,
  }
}
