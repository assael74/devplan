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

const findCurrentEntry = seasons => {
  const entries = (Array.isArray(seasons) ? seasons : [])
    .flatMap(season => Array.isArray(season?.entries) ? season.entries : [])

  return entries.find(entry => (
    entry?.lifecycle?.type === 'current' || entry?.sourceTarget === 'current'
  )) || entries[entries.length - 1] || null
}

const buildUnknowns = seasons => {
  const currentEntry = findCurrentEntry(seasons)
  const contract = currentEntry?.scout?.contract || null
  const verification = contract?.verification || null
  const contractQuestions = Array.isArray(contract?.openQuestions)
    ? contract.openQuestions
    : []

  return {
    verification,
    openQuestions: contractQuestions.length
      ? contractQuestions
      : buildOpenQuestions(verification),
  }
}


export const buildNarrativeInput = ({ player = {}, seasons = [], teams = [], events = [] } = {}) => {
  const input = createEmptyNarrativeInput()
  const identity = buildPlayerIdentity(player)

  const timeline = buildNarrativeTimeline({
    seasons,
    teams,
    playerBirthYear: identity.birthYear,
  })

  return {
    ...input,
    player: identity,
    seasons: timeline,
    events: Array.isArray(events) ? events : [],
    unknowns: buildUnknowns(timeline),
  }
}
