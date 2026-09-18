// Canonical Club projection domain values.
// These values describe projections only; Firestore persistence belongs to services/write.

import { cleanValue } from '../../model/shared/value.model.js'

export const CLUB_TRANSFER_COVERAGE_STATUS = Object.freeze({
  COMPLETE: 'COMPLETE',
  PARTIAL: 'PARTIAL',
  NOT_LOADED: 'NOT_LOADED',
})

export const CLUB_COMPETITION_STATUS = Object.freeze({
  UNKNOWN: 'UNKNOWN',
  CURRENT_LEVEL: 'CURRENT_LEVEL',
  STABLE: 'STABLE',
  PROMOTION_POSSIBLE: 'PROMOTION_POSSIBLE',
  RELEGATION_RISK: 'RELEGATION_RISK',
  SAFE_CONFIRMED: 'SAFE_CONFIRMED',
  PROMOTED_CONFIRMED: 'PROMOTED_CONFIRMED',
  RELEGATED_CONFIRMED: 'RELEGATED_CONFIRMED',
})

export const CLUB_COMPETITION_PROJECTION_SOURCE = Object.freeze({
  AUTOMATIC: 'AUTOMATIC',
  MANUAL: 'MANUAL',
})

export const normalizeClubTransferCoverageStatus = (
  value,
  fallback = CLUB_TRANSFER_COVERAGE_STATUS.NOT_LOADED
) => {
  const normalized = cleanValue(value).toUpperCase()

  return Object.values(CLUB_TRANSFER_COVERAGE_STATUS).includes(normalized)
    ? normalized
    : fallback
}

export const normalizeClubCompetitionStatus = (
  value,
  fallback = CLUB_COMPETITION_STATUS.UNKNOWN
) => {
  const normalized = cleanValue(value).toUpperCase()

  return Object.values(CLUB_COMPETITION_STATUS).includes(normalized)
    ? normalized
    : fallback
}

export const normalizeClubCompetitionProjectionSource = (
  value,
  fallback = CLUB_COMPETITION_PROJECTION_SOURCE.AUTOMATIC
) => {
  const normalized = cleanValue(value).toUpperCase()

  return Object.values(CLUB_COMPETITION_PROJECTION_SOURCE).includes(normalized)
    ? normalized
    : fallback
}
