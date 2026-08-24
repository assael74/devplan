// src/shared/scouting/players/profileConfidence/playerProfileConfidence.js

import {
  SCOUT_PROFILE_IDENTITY,
  SCOUT_REVIEW,
} from '../ids.js'

import {
  PLAYER_VERIFICATION_EFFECT,
} from '../verification/playerVerification.model.js'

export const PLAYER_PROFILE_CONFIDENCE = {
  UNKNOWN: 'unknown',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
}

export const PLAYER_PROFILE_CONFIDENCE_REASON = {
  PRELIMINARY_REQUIRES_VERIFICATION: 'preliminary_requires_verification',
  VERIFIED_RECLASSIFICATION: 'verified_reclassification',
  POSITION_VERIFICATION_SUPPORTED: 'position_verification_supported',
  POSITION_VERIFICATION_REDUCED: 'position_verification_reduced',
  CORE_NUMERIC_EVIDENCE: 'core_numeric_evidence',
  NOT_PROFESSIONAL_PROFILE: 'not_professional_profile',
}

const POSITION_REVIEW_IDS = new Set([
  SCOUT_REVIEW.POSITION,
  SCOUT_REVIEW.VIDEO_POSITION,
  SCOUT_REVIEW.PROFILE_RELEVANCE,
])

const hasPositionVerificationNeed = signal => (
  (Array.isArray(signal?.requiredReview) ? signal.requiredReview : [])
    .some(reviewId => POSITION_REVIEW_IDS.has(reviewId))
)

const resolveProfileConfidenceDimension = verification => (
  verification?.dimensions?.profile_confidence || null
)

export const buildPlayerProfileConfidence = ({
  signal = {},
  verification = null,
} = {}) => {
  const identity = String(
    signal?.profileIdentity || signal?.identity || ''
  ).trim().toLowerCase()

  if (identity === SCOUT_PROFILE_IDENTITY.PRELIMINARY) {
    return {
      level: PLAYER_PROFILE_CONFIDENCE.LOW,
      reason: PLAYER_PROFILE_CONFIDENCE_REASON.PRELIMINARY_REQUIRES_VERIFICATION,
    }
  }

  if (identity !== SCOUT_PROFILE_IDENTITY.CORE) {
    return {
      level: PLAYER_PROFILE_CONFIDENCE.UNKNOWN,
      reason: PLAYER_PROFILE_CONFIDENCE_REASON.NOT_PROFESSIONAL_PROFILE,
    }
  }

  if (signal?.classificationState === 'reclassified') {
    return {
      level: PLAYER_PROFILE_CONFIDENCE.HIGH,
      reason: PLAYER_PROFILE_CONFIDENCE_REASON.VERIFIED_RECLASSIFICATION,
    }
  }

  const dimension = resolveProfileConfidenceDimension(verification)

  if (hasPositionVerificationNeed(signal) && dimension) {
    if (
      dimension?.direction === PLAYER_VERIFICATION_EFFECT.SUPPORTS &&
      Number(dimension?.net) > 0
    ) {
      return {
        level: PLAYER_PROFILE_CONFIDENCE.HIGH,
        reason: PLAYER_PROFILE_CONFIDENCE_REASON.POSITION_VERIFICATION_SUPPORTED,
      }
    }

    if (
      dimension?.direction === PLAYER_VERIFICATION_EFFECT.REDUCES &&
      Number(dimension?.net) < 0
    ) {
      return {
        level: PLAYER_PROFILE_CONFIDENCE.LOW,
        reason: PLAYER_PROFILE_CONFIDENCE_REASON.POSITION_VERIFICATION_REDUCED,
      }
    }
  }

  return {
    level: PLAYER_PROFILE_CONFIDENCE.MEDIUM,
    reason: PLAYER_PROFILE_CONFIDENCE_REASON.CORE_NUMERIC_EVIDENCE,
  }
}
