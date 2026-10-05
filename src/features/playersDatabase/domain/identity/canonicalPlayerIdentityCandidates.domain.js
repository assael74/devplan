// src/features/playersDatabase/domain/identity/canonicalPlayerIdentityCandidates.domain.js

import {
  isValidExternalPlayerId,
  resolvePlayerIdentityBirthYear,
} from '../../model/player/playerIdentity.model.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const uniqueCandidates = candidates => {
  const byPlayerId = new Map()

  ;(Array.isArray(candidates) ? candidates : []).forEach(candidate => {
    const playerId = clean(candidate && candidate.playerId)
    if (playerId && !byPlayerId.has(playerId)) byPlayerId.set(playerId, candidate)
  })

  return [...byPlayerId.values()]
}

export const buildCanonicalPlayerIdentityCandidateMetadata = candidates => uniqueCandidates(candidates)
  .map(candidate => ({
    candidateKey: clean(candidate && candidate.playerId),
    playerId: clean(candidate && candidate.playerId),
    externalPlayerId: clean(candidate && candidate.externalPlayerId),
    fullName: clean(candidate && (candidate.fullName || candidate.displayName)),
    displayName: clean(candidate && (candidate.displayName || candidate.fullName)),
  }))
  .filter(candidate => candidate.playerId)

export const buildCanonicalPlayerIdentityKeys = ({
  player = {},
  season = {},
  birthYear = '',
} = {}) => {
  const identityBirthYear = Number(
    birthYear || resolvePlayerIdentityBirthYear({ player, season })
  ) || 0
  const externalPlayerId = isValidExternalPlayerId({
    externalPlayerId: player.externalPlayerId,
    birthYear: identityBirthYear,
  })
    ? clean(player.externalPlayerId)
    : ''

  return {
    externalPlayerId,
    identityBirthYear,
  }
}

export const resolveCanonicalPlayerIdentityCandidates = ({
  keys = {},
  lookup = {},
} = {}) => {
  const externalPlayerId = clean(keys.externalPlayerId)
  const candidates = uniqueCandidates(
    externalPlayerId
      ? lookup.byExternalPlayerId && lookup.byExternalPlayerId.get(externalPlayerId)
      : []
  )

  return {
    source: externalPlayerId ? 'externalPlayerId' : 'none',
    candidates,
    status: candidates.length === 0
      ? 'unresolved'
      : candidates.length > 1
        ? 'ambiguous'
        : 'matched',
  }
}
