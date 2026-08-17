// src/shared/scouting/players/spotlights/playerTrajectorySpotlights.js

import {
  PLAYER_TRAJECTORY_CONFIDENCE,
  PLAYER_TRAJECTORY_DIRECTION,
  PLAYER_TRANSFER_DIRECTION,
} from '../trajectory/index.js'

import {
  PLAYER_SCOUT_SPOTLIGHT,
  PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE,
  PLAYER_SCOUT_SPOTLIGHT_EFFECT,
} from './playerSpotlights.model.js'

import {
  buildSpotlight,
} from './playerSpotlights.utils.js'

const resolveConfidence = (confidence) => {
  if (confidence === PLAYER_TRAJECTORY_CONFIDENCE.HIGH) {
    return PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE.HIGH
  }

  if (confidence === PLAYER_TRAJECTORY_CONFIDENCE.MEDIUM) {
    return PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE.MEDIUM
  }

  return PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE.LOW
}

const buildGrowthSpotlight = (trajectory) => {
  const isGrowth = [
    PLAYER_TRAJECTORY_DIRECTION.UP,
    PLAYER_TRAJECTORY_DIRECTION.BREAKTHROUGH,
  ].includes(trajectory?.direction)

  if (!isGrowth) return null

  return buildSpotlight({
    id: PLAYER_SCOUT_SPOTLIGHT.MULTI_SEASON_GROWTH,
    confidence: resolveConfidence(trajectory.confidence),
    effect: PLAYER_SCOUT_SPOTLIGHT_EFFECT.CONTEXT_ONLY,
    evidence: trajectory.evidence || [],
    details: {
      direction: trajectory.direction,
      stintsCount: trajectory.stintsCount || 0,
      seasonsCount: trajectory.seasonsCount || 0,
    },
  })
}

const buildTransferUpSpotlight = (trajectory) => {
  const transfer = trajectory?.latestTransfer

  if (transfer?.direction !== PLAYER_TRANSFER_DIRECTION.UP) return null

  return buildSpotlight({
    id: PLAYER_SCOUT_SPOTLIGHT.TRANSFERRED_UP,
    confidence: resolveConfidence(trajectory.confidence),
    effect: PLAYER_SCOUT_SPOTLIGHT_EFFECT.CONTEXT_ONLY,
    evidence: ['player_recently_moved_to_stronger_environment'],
    details: transfer,
  })
}

const buildTransferDownSpotlight = (trajectory) => {
  const transfer = trajectory?.latestTransfer

  if (transfer?.direction !== PLAYER_TRANSFER_DIRECTION.DOWN) return null

  return buildSpotlight({
    id: PLAYER_SCOUT_SPOTLIGHT.TRANSFERRED_DOWN,
    confidence: resolveConfidence(trajectory.confidence),
    effect: PLAYER_SCOUT_SPOTLIGHT_EFFECT.CONTEXT_ONLY,
    evidence: ['player_moved_to_weaker_environment'],
    details: transfer,
  })
}

export const buildPlayerTrajectorySpotlights = ({ playerTrajectory } = {}) => {
  if (!playerTrajectory) return []

  return [
    buildGrowthSpotlight(playerTrajectory),
    buildTransferUpSpotlight(playerTrajectory),
    buildTransferDownSpotlight(playerTrajectory),
  ].filter(Boolean)
}
