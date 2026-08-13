// src/shared/scouting/players/opportunity/playerOpportunity.aggregate.js

import {
  PLAYER_SCOUT_ACTION_STATUS,
  PLAYER_SCOUT_EXPOSURE_LEVEL,
} from './playerOpportunity.model.js'

const STATUS_RANK = {
  [PLAYER_SCOUT_ACTION_STATUS.WATCH]: 1,
  [PLAYER_SCOUT_ACTION_STATUS.EXPOSED]: 2,
  [PLAYER_SCOUT_ACTION_STATUS.PRIORITY]: 3,
  [PLAYER_SCOUT_ACTION_STATUS.IMMEDIATE]: 4,
}

const EXPOSURE_RANK = {
  [PLAYER_SCOUT_EXPOSURE_LEVEL.UNKNOWN]: 0,
  [PLAYER_SCOUT_EXPOSURE_LEVEL.LOW]: 1,
  [PLAYER_SCOUT_EXPOSURE_LEVEL.MEDIUM]: 2,
  [PLAYER_SCOUT_EXPOSURE_LEVEL.HIGH]: 3,
}

const mergeUnique = (values = []) => {
  return [...new Set(values.filter(Boolean))]
}

const getBestSignal = (signals = []) => {
  return signals.reduce((best, signal) => {
    if (!signal?.opportunity) return best
    if (!best) return signal

    const currentRank = STATUS_RANK[signal.opportunity.actionStatus] || 0
    const bestRank = STATUS_RANK[best.opportunity.actionStatus] || 0

    if (currentRank > bestRank) return signal
    if (currentRank < bestRank) return best

    return (signal.reliability?.score || 0) > (best.reliability?.score || 0)
      ? signal
      : best
  }, null)
}

const getExposureLevel = (signals = []) => {
  return signals.reduce((current, signal) => {
    const incoming = signal?.opportunity?.exposureLevel || PLAYER_SCOUT_EXPOSURE_LEVEL.UNKNOWN
    const currentRank = EXPOSURE_RANK[current] || 0
    const incomingRank = EXPOSURE_RANK[incoming] || 0

    return incomingRank > currentRank ? incoming : current
  }, PLAYER_SCOUT_EXPOSURE_LEVEL.UNKNOWN)
}

export const aggregatePlayerScoutOpportunity = (signals = []) => {
  const safeSignals = Array.isArray(signals) ? signals : []
  const bestSignal = getBestSignal(safeSignals)

  if (!bestSignal) {
    return {
      actionStatus: PLAYER_SCOUT_ACTION_STATUS.WATCH,
      exposureLevel: PLAYER_SCOUT_EXPOSURE_LEVEL.UNKNOWN,
      reasons: [],
      profileIds: [],
      bestProfileId: '',
    }
  }

  return {
    actionStatus: bestSignal.opportunity.actionStatus,
    exposureLevel: getExposureLevel(safeSignals),
    reasons: mergeUnique(
      safeSignals.flatMap((signal) => signal.opportunity?.reasons || [])
    ),
    profileIds: mergeUnique(safeSignals.map((signal) => signal.profileId)),
    bestProfileId: bestSignal.profileId || '',
  }
}
