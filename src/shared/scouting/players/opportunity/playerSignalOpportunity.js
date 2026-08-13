// src/shared/scouting/players/opportunity/playerSignalOpportunity.js

import {
  PLAYER_SCOUT_SPOTLIGHT,
  PLAYER_SCOUT_SPOTLIGHT_EFFECT,
} from '../spotlights/playerSpotlights.model.js'

import {
  PLAYER_SCOUT_ACTION_STATUS,
  PLAYER_SCOUT_EXPOSURE_LEVEL,
  PLAYER_SCOUT_OPPORTUNITY_REASON,
} from './playerOpportunity.model.js'

const SUPPORTING_SPOTLIGHTS = new Set([
  PLAYER_SCOUT_SPOTLIGHT.EARLY_BREAKTHROUGH,
  PLAYER_SCOUT_SPOTLIGHT.UNDEREXPOSED,
  PLAYER_SCOUT_SPOTLIGHT.HIDDEN_PERFORMER,
  PLAYER_SCOUT_SPOTLIGHT.POSITIONAL_OUTLIER,
  PLAYER_SCOUT_SPOTLIGHT.PLAYS_ABOVE_CLUB_LEVEL,
  PLAYER_SCOUT_SPOTLIGHT.FUTURE_LEVEL_RISK,
  PLAYER_SCOUT_SPOTLIGHT.MULTI_SEASON_GROWTH,
])

const reasonFromSpotlight = (spotlightId) => {
  if (spotlightId === PLAYER_SCOUT_SPOTLIGHT.EARLY_BREAKTHROUGH) {
    return PLAYER_SCOUT_OPPORTUNITY_REASON.EARLY_BREAKTHROUGH
  }

  if (spotlightId === PLAYER_SCOUT_SPOTLIGHT.UNDEREXPOSED) {
    return PLAYER_SCOUT_OPPORTUNITY_REASON.UNDEREXPOSED
  }

  if (spotlightId === PLAYER_SCOUT_SPOTLIGHT.HIDDEN_PERFORMER) {
    return PLAYER_SCOUT_OPPORTUNITY_REASON.HIDDEN_PERFORMER
  }

  if (spotlightId === PLAYER_SCOUT_SPOTLIGHT.POSITIONAL_OUTLIER) {
    return PLAYER_SCOUT_OPPORTUNITY_REASON.POSITIONAL_OUTLIER
  }

  if (spotlightId === PLAYER_SCOUT_SPOTLIGHT.PLAYS_ABOVE_CLUB_LEVEL) {
    return PLAYER_SCOUT_OPPORTUNITY_REASON.PLAYS_ABOVE_CLUB_LEVEL
  }

  if (spotlightId === PLAYER_SCOUT_SPOTLIGHT.PLAYS_BELOW_CLUB_LEVEL) {
    return PLAYER_SCOUT_OPPORTUNITY_REASON.PLAYS_BELOW_CLUB_LEVEL
  }

  if (spotlightId === PLAYER_SCOUT_SPOTLIGHT.ADVERSE_TEAM_CONTEXT) {
    return PLAYER_SCOUT_OPPORTUNITY_REASON.ADVERSE_TEAM_CONTEXT
  }

  if (spotlightId === PLAYER_SCOUT_SPOTLIGHT.STRONG_TEAM_CONTEXT) {
    return PLAYER_SCOUT_OPPORTUNITY_REASON.STRONG_TEAM_CONTEXT
  }

  if (spotlightId === PLAYER_SCOUT_SPOTLIGHT.FUTURE_LEVEL_RISK) {
    return PLAYER_SCOUT_OPPORTUNITY_REASON.FUTURE_LEVEL_RISK
  }

  if (spotlightId === PLAYER_SCOUT_SPOTLIGHT.FUTURE_LEVEL_UPSIDE) {
    return PLAYER_SCOUT_OPPORTUNITY_REASON.FUTURE_LEVEL_UPSIDE
  }

  if (spotlightId === PLAYER_SCOUT_SPOTLIGHT.MULTI_SEASON_GROWTH) {
    return PLAYER_SCOUT_OPPORTUNITY_REASON.MULTI_SEASON_GROWTH
  }

  if (spotlightId === PLAYER_SCOUT_SPOTLIGHT.TRANSFERRED_UP) {
    return PLAYER_SCOUT_OPPORTUNITY_REASON.TRANSFERRED_UP
  }

  if (spotlightId === PLAYER_SCOUT_SPOTLIGHT.TRANSFERRED_DOWN) {
    return PLAYER_SCOUT_OPPORTUNITY_REASON.TRANSFERRED_DOWN
  }

  return ''
}

const resolveExposureLevel = (signal) => {
  const clubStrengthLevel = Number(
    signal.metrics?.clubStrengthLevel || signal.metrics?.clubLevel || 0
  )

  if (clubStrengthLevel > 0 && clubStrengthLevel <= 1.5) {
    return PLAYER_SCOUT_EXPOSURE_LEVEL.HIGH
  }

  if (clubStrengthLevel >= 2 && clubStrengthLevel <= 2.5) {
    return PLAYER_SCOUT_EXPOSURE_LEVEL.MEDIUM
  }

  if (clubStrengthLevel >= 3) return PLAYER_SCOUT_EXPOSURE_LEVEL.LOW

  return PLAYER_SCOUT_EXPOSURE_LEVEL.UNKNOWN
}

const isStrongSignal = (signal) => {
  return signal.interestLevel === 'super_interesting'
}

const buildReasons = ({ signal, spotlights, exposureLevel }) => {
  const reasons = []

  if (isStrongSignal(signal)) {
    reasons.push(PLAYER_SCOUT_OPPORTUNITY_REASON.STRONG_SIGNAL)
  }

  if (signal.reliability?.level === 'high') {
    reasons.push(PLAYER_SCOUT_OPPORTUNITY_REASON.RELIABLE_SIGNAL)
  }

  if (signal.reliability?.level === 'low') {
    reasons.push(PLAYER_SCOUT_OPPORTUNITY_REASON.LOW_RELIABILITY)
  }

  spotlights.forEach((spotlight) => {
    const reason = reasonFromSpotlight(spotlight.id)

    if (reason) reasons.push(reason)
  })

  if (exposureLevel === PLAYER_SCOUT_EXPOSURE_LEVEL.HIGH) {
    reasons.push(PLAYER_SCOUT_OPPORTUNITY_REASON.TOP_CLUB_EXPOSURE)
  }

  return [...new Set(reasons)]
}

const reduceActionStatus = (status, spotlights) => {
  const shouldReduce = spotlights.some((spotlight) => {
    return spotlight.effect === PLAYER_SCOUT_SPOTLIGHT_EFFECT.REDUCES_IMMEDIACY
  })

  if (!shouldReduce) return status
  if (status === PLAYER_SCOUT_ACTION_STATUS.IMMEDIATE) return PLAYER_SCOUT_ACTION_STATUS.PRIORITY
  if (status === PLAYER_SCOUT_ACTION_STATUS.PRIORITY) return PLAYER_SCOUT_ACTION_STATUS.WATCH

  return status
}

const resolveActionStatus = ({ signal, spotlights, exposureLevel }) => {
  const reliabilityLevel = signal.reliability?.level || 'low'
  const supportingSpotlights = spotlights.filter((spotlight) => {
    return spotlight.effect === PLAYER_SCOUT_SPOTLIGHT_EFFECT.SUPPORTS_ACTION &&
      SUPPORTING_SPOTLIGHTS.has(spotlight.id)
  })

  if (exposureLevel === PLAYER_SCOUT_EXPOSURE_LEVEL.HIGH && reliabilityLevel !== 'low') {
    return PLAYER_SCOUT_ACTION_STATUS.EXPOSED
  }

  if (reliabilityLevel === 'low') {
    return PLAYER_SCOUT_ACTION_STATUS.WATCH
  }

  if (supportingSpotlights.length >= 2) {
    return reduceActionStatus(PLAYER_SCOUT_ACTION_STATUS.IMMEDIATE, spotlights)
  }

  if (supportingSpotlights.length >= 1 || isStrongSignal(signal)) {
    return reduceActionStatus(PLAYER_SCOUT_ACTION_STATUS.PRIORITY, spotlights)
  }

  return PLAYER_SCOUT_ACTION_STATUS.WATCH
}

export const buildPlayerSignalOpportunity = ({ signal } = {}) => {
  const safeSignal = signal || {}
  const spotlights = Array.isArray(safeSignal.spotlights) ? safeSignal.spotlights : []
  const exposureLevel = resolveExposureLevel(safeSignal)
  const actionStatus = resolveActionStatus({
    signal: safeSignal,
    spotlights,
    exposureLevel,
  })

  return {
    actionStatus,
    exposureLevel,
    reasons: buildReasons({
      signal: safeSignal,
      spotlights,
      exposureLevel,
    }),
    evidence: {
      profileId: safeSignal.profileId || '',
      reliabilityLevel: safeSignal.reliability?.level || '',
      clubLevel: safeSignal.metrics?.clubLevel || 0,
      clubStrengthLevel: safeSignal.metrics?.clubStrengthLevel || safeSignal.metrics?.clubLevel || 0,
      spotlightIds: spotlights.map((spotlight) => spotlight.id),
    },
  }
}
