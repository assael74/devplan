// src/features/playersDatabase/domain/narrative/narrativeInput.js

import { createEmptyNarrativeInput } from './narrative.contract.js'
import { buildNarrativeTimeline } from './narrativeTimeline.js'

const buildPlayerIdentity = player => ({
  playerId: player?.identity?.playerId || player?.playerId || '',
  playerDocumentId: player?.identity?.playerDocumentId || player?.playerDocumentId || '',
  displayName: player?.identity?.displayName || player?.displayName || player?.fullName || '',
  birthYear: Number(player?.birthYear || player?.identityBirthYear) || null,
})

const buildOpenQuestions = verification => {
  if (!verification || typeof verification !== 'object') return []

  if (Array.isArray(verification.openQuestions)) {
    return verification.openQuestions
  }

  if (Array.isArray(verification.missingChecks)) {
    return verification.missingChecks
  }

  return verification.nextBestCheck ? [verification.nextBestCheck] : []
}

const buildUnknowns = seasons => {
  const values = Array.isArray(seasons) ? seasons : []
  const verification = values
    .map(season => season?.scout?.verification)
    .filter(Boolean)
  const current = verification[verification.length - 1] || null

  return {
    verification: current,
    openQuestions: buildOpenQuestions(current),
  }
}

export const buildNarrativeInput = ({ player = {}, seasons = [], teams = [], events = [] } = {}) => {
  const input = createEmptyNarrativeInput()
  const identity = buildPlayerIdentity(player)

  return {
    ...input,
    player: identity,
    seasons: buildNarrativeTimeline({
      seasons,
      teams,
      playerBirthYear: identity.birthYear,
    }),
    events: Array.isArray(events) ? events : [],
    unknowns: buildUnknowns(seasons),
  }
}
