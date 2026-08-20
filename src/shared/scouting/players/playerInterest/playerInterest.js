// src/shared/scouting/players/playerInterest/playerInterest.js

import {
  PLAYER_POSITION_EVIDENCE,
} from '../context/index.js'

import {
  PLAYER_VERIFICATION_ANSWER,
  PLAYER_VERIFICATION_QUESTION,
} from '../verification/index.js'

import {
  PLAYER_INTEREST_LEVEL,
  PLAYER_INTEREST_LIMIT,
  PLAYER_INTEREST_REASON,
  PLAYER_INTEREST_UPGRADE_CONDITION,
} from './playerInterest.model.js'

const INTEREST_RANK = {
  [PLAYER_INTEREST_LEVEL.SUPER_INTERESTING]: 3,
  [PLAYER_INTEREST_LEVEL.INTERESTING]: 2,
  [PLAYER_INTEREST_LEVEL.REASONABLE]: 1,
}

const clean = value => String(value || '').trim()

const toNullableNumber = value => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const strongestInterestLevel = values => (
  (Array.isArray(values) ? values : [])
    .map(clean)
    .filter(Boolean)
    .sort((left, right) => (
      (INTEREST_RANK[right] || 0) - (INTEREST_RANK[left] || 0)
    ))[0] || ''
)

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
  const profileInterestLevel = clean(primarySignal?.interestLevel)
  const combinationInterestLevel = strongestInterestLevel(
    (Array.isArray(combinations) ? combinations : [])
      .map(combination => combination?.interestLevel || combination?.interest)
  )
  const sourceInterestLevel = strongestInterestLevel([
    profileInterestLevel,
    combinationInterestLevel,
  ])
  const primaryProfileId = clean(primarySignal?.profileId)

  if (!primarySignal || !sourceInterestLevel) {
    return {
      assessmentScope: 'player_career',
      interestLevel: '',
      profileInterestLevel,
      combinationInterestLevel,
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
  const position = resolvePositionState({
    primarySignal,
    verification,
  })
  const reasons = []
  const limitingFactors = []
  const upgradeConditions = []

  if (position.verified) reasons.push(PLAYER_INTEREST_REASON.POSITION_VERIFIED)
  if (hasPersistence) reasons.push(PLAYER_INTEREST_REASON.PROFILE_PERSISTENCE)
  if (hasDefinedCombination) reasons.push(PLAYER_INTEREST_REASON.DEFINED_COMBINATION)
  if (hasHighImmediacy) reasons.push(PLAYER_INTEREST_REASON.HIGH_IMMEDIACY)
  if (hasStrongDepth) reasons.push(PLAYER_INTEREST_REASON.STRONG_PROFILE_DEPTH)

  let interestLevel = sourceInterestLevel

  if (sourceInterestLevel === PLAYER_INTEREST_LEVEL.SUPER_INTERESTING) {
    if (position.requiredContext && !position.verified) {
      interestLevel = PLAYER_INTEREST_LEVEL.INTERESTING
      reasons.push(PLAYER_INTEREST_REASON.PROFILE_INTEREST_CAPPED)
      limitingFactors.push(
        position.mismatch
          ? PLAYER_INTEREST_LIMIT.POSITION_MISMATCH
          : PLAYER_INTEREST_LIMIT.POSITION_NOT_VERIFIED
      )
      upgradeConditions.push(PLAYER_INTEREST_UPGRADE_CONDITION.POSITION_VERIFICATION)
    } else {
      const hasWholePlayerSupport = (
        position.verified ||
        hasPersistence ||
        hasDefinedCombination ||
        hasHighImmediacy ||
        hasStrongDepth
      )

      if (!hasWholePlayerSupport) {
        interestLevel = PLAYER_INTEREST_LEVEL.INTERESTING
        reasons.push(PLAYER_INTEREST_REASON.PROFILE_INTEREST_CAPPED)
        limitingFactors.push(PLAYER_INTEREST_LIMIT.WHOLE_PLAYER_SUPPORT_MISSING)
        upgradeConditions.push(PLAYER_INTEREST_UPGRADE_CONDITION.WHOLE_PLAYER_CONFIRMATION)
      }
    }
  }

  return {
    assessmentScope: 'player_career',
    interestLevel,
    profileInterestLevel,
    combinationInterestLevel,
    primaryProfileId,
    reasons,
    limitingFactors,
    upgradeConditions,
  }
}
