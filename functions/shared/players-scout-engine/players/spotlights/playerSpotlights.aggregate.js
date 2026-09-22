// src/shared/scouting/players/spotlights/playerSpotlights.aggregate.js

import {
  PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE,
} from './playerSpotlights.model.js'

const CONFIDENCE_RANK = {
  [PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE.LOW]: 1,
  [PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE.MEDIUM]: 2,
  [PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE.HIGH]: 3,
}

const getConfidenceRank = (confidence) => {
  return CONFIDENCE_RANK[confidence] || 0
}

const mergeEvidence = (current = [], incoming = []) => {
  return [...new Set([...current, ...incoming])]
}

const mergeProfileIds = (current = [], profileId = '') => {
  if (!profileId) return current

  return [...new Set([...current, profileId])]
}

export const aggregatePlayerScoutSpotlights = (signals = []) => {
  const byId = new Map()

  signals.forEach((signal) => {
    const spotlights = Array.isArray(signal.spotlights) ? signal.spotlights : []

    spotlights.forEach((spotlight) => {
      const current = byId.get(spotlight.id)

      if (!current) {
        byId.set(spotlight.id, {
          ...spotlight,
          profileIds: mergeProfileIds([], signal.profileId),
        })
        return
      }

      const stronger = getConfidenceRank(spotlight.confidence) > getConfidenceRank(current.confidence)

      byId.set(spotlight.id, {
        ...(stronger ? spotlight : current),
        evidence: mergeEvidence(current.evidence, spotlight.evidence),
        profileIds: mergeProfileIds(current.profileIds, signal.profileId),
      })
    })
  })

  return [...byId.values()]
}
