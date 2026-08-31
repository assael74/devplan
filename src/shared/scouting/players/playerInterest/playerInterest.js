// src/shared/scouting/players/playerInterest/playerInterest.js

import {
  PLAYER_POSITION_EVIDENCE,
} from '../context/index.js'

import {
  PLAYER_VERIFICATION_ANSWER,
  PLAYER_VERIFICATION_QUESTION,
} from '../verification/index.js'

import {
  PLAYER_SCOUT_IMMEDIACY_BOOST,
} from '../opportunity/playerOpportunity.model.js'

import {
  PLAYER_INTEREST_LEVEL,
  PLAYER_INTEREST_REASON,
} from './playerInterest.model.js'

const clean = value => String(value || '').trim()

const toNullableNumber = value => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const resolvePrimarySignal = ({ signals, profileHierarchy }) => {
  const primaryProfileId = clean(profileHierarchy?.primaryProfileId)

  if (!primaryProfileId) return null

  const hierarchyPrimarySignal = profileHierarchy?.primarySignal || null

  if (clean(hierarchyPrimarySignal?.profileId) === primaryProfileId) {
    return hierarchyPrimarySignal
  }

  return (Array.isArray(signals) ? signals : [])
    .find(signal => clean(signal?.profileId) === primaryProfileId) || null
}

const resolvePositionVerificationAnswer = verification => (
  (Array.isArray(verification?.checks) ? verification.checks : [])
    .find(check => clean(check?.questionId) === PLAYER_VERIFICATION_QUESTION.POSITION_CONTEXT_VERIFIED)
)

const resolvePositionState = ({ primarySignal, verification }) => {
  const positionContext = primarySignal?.scoutContext?.position || {}
  const requiredContext = clean(
    positionContext.requiredContext || primarySignal?.positionContext
  )
  const evidence = clean(positionContext.evidence).toLowerCase()
  const verificationAnswer = clean(
    resolvePositionVerificationAnswer(verification)?.answer
  ).toLowerCase()
  if (!requiredContext || evidence === PLAYER_POSITION_EVIDENCE.NOT_REQUIRED) {
    return {
      requiredContext,
      verified: true,
      mismatch: false,
    }
  }

  if (
    evidence === PLAYER_POSITION_EVIDENCE.CONFIRMED ||
    verificationAnswer === PLAYER_VERIFICATION_ANSWER.YES
  ) {
    return {
      requiredContext,
      verified: true,
      mismatch: false,
    }
  }

  return {
    requiredContext,
    verified: false,
    mismatch:
      evidence === PLAYER_POSITION_EVIDENCE.MISMATCH ||
      verificationAnswer === PLAYER_VERIFICATION_ANSWER.NO,
  }
}

export const buildPlayerInterest = ({
  signals = [],
  combinations = [],
  profileHierarchy = null,
  profileCaseStrength = null,
  opportunity = null,
  verification = null,
  playerReview = null,
} = {}) => {
  const primarySignal = resolvePrimarySignal({ signals, profileHierarchy })
  const primaryProfileId = clean(primarySignal?.profileId)

  if (!primarySignal) {
    return {
      assessmentScope: 'player_career',
      interestLevel: '',
      primaryProfileId,
      reasons: [],
      limitingFactors: [],
      upgradeConditions: [],
    }
  }

  const persistenceSeasons = Number(
    opportunity?.signalPersistence?.profileRepeat?.seasons
  ) || 0
  const hasPersistence = persistenceSeasons >= 2
  const hasDefinedCombination = Boolean(
    profileCaseStrength?.hasDefinedCombination
  )
  const primaryStrengthPct = toNullableNumber(
    profileCaseStrength?.primaryProfileStrength?.depthPct !== undefined
      ? profileCaseStrength.primaryProfileStrength.depthPct
      : primarySignal?.profileStrength?.depthPct
  )
  const actionStatus = clean(opportunity?.effectiveActionStatus)
  const hasHighImmediacy = actionStatus === 'priority' || actionStatus === 'immediate'
  const hasStrongDepth = primaryStrengthPct !== null && primaryStrengthPct >= 50
  const immediacyBoostIds = new Set(
    (Array.isArray(opportunity?.boosts) ? opportunity.boosts : [])
      .map(boost => clean(boost?.id || boost))
      .filter(Boolean)
  )
  const duplicateImmediacyBoostIds = new Set([
    hasPersistence ? PLAYER_SCOUT_IMMEDIACY_BOOST.PROFILE_PERSISTENCE : '',
    hasDefinedCombination ? PLAYER_SCOUT_IMMEDIACY_BOOST.PROFILE_COMBINATION : '',
    hasDefinedCombination
      ? PLAYER_SCOUT_IMMEDIACY_BOOST.PROFILE_COMBINATION_PERSISTENCE
      : '',
  ].filter(Boolean))
  const hasIndependentHighImmediacy = hasHighImmediacy && (
    !immediacyBoostIds.size ||
    [...immediacyBoostIds].some(boostId => !duplicateImmediacyBoostIds.has(boostId))
  )
  const position = resolvePositionState({
    primarySignal,
    verification,
  })
  const hasRelevantPositionVerification = Boolean(
    position.requiredContext && position.verified
  )
  const reasons = [
    hasRelevantPositionVerification
      ? PLAYER_INTEREST_REASON.POSITION_VERIFIED
      : '',
    hasPersistence ? PLAYER_INTEREST_REASON.PROFILE_PERSISTENCE : '',
    hasDefinedCombination ? PLAYER_INTEREST_REASON.DEFINED_COMBINATION : '',
    hasIndependentHighImmediacy ? PLAYER_INTEREST_REASON.HIGH_IMMEDIACY : '',
    hasStrongDepth ? PLAYER_INTEREST_REASON.STRONG_PROFILE_DEPTH : '',
  ].filter(Boolean)
  const interestLevel = reasons.length >= 2
    ? PLAYER_INTEREST_LEVEL.SUPER_INTERESTING
    : reasons.length === 1
      ? PLAYER_INTEREST_LEVEL.INTERESTING
      : PLAYER_INTEREST_LEVEL.REASONABLE

  return {
    assessmentScope: 'player_career',
    interestLevel,
    primaryProfileId,
    reasons,
    limitingFactors: [],
    upgradeConditions: [],
  }
}
