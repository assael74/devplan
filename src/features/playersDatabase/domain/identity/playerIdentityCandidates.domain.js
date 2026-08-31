import {
  buildPlayerDocumentId,
  buildPlayerIdentityKey,
  buildPlayerNameVariants,
  isValidExternalPlayerId,
  normalizePlayerIdentity,
  resolvePlayerIdentityBirthYear,
} from '../../model/playerIdentity.model.js'

const clean = value => String(value || '').trim()

const unique = values => [...new Set(
  (Array.isArray(values) ? values : []).map(clean).filter(Boolean)
)]

const candidateKey = candidate => clean(
  candidate?.playerId || candidate?.playerDocumentId || candidate?.id
)

const uniqueCandidates = candidates => {
  const byKey = new Map()

  ;(Array.isArray(candidates) ? candidates : []).forEach(candidate => {
    const key = candidateKey(candidate)
    if (key && !byKey.has(key)) byKey.set(key, candidate)
  })

  return [...byKey.values()]
}

export const buildPlayerIdentityCandidateMetadata = candidates => uniqueCandidates(candidates)
  .map(candidate => ({
    candidateKey: candidateKey(candidate),
    playerDocumentId: clean(candidate?.playerDocumentId || candidate?.id),
    playerId: clean(candidate?.playerId),
    fullName: clean(candidate?.fullName || candidate?.displayName),
    displayName: clean(candidate?.displayName || candidate?.fullName),
  }))
  .filter(candidate => candidate.playerDocumentId || candidate.playerId)

export const buildPlayerIdentityCandidateKeys = ({
  player = {},
  season = {},
  birthYear = '',
} = {}) => {
  const identity = normalizePlayerIdentity(player)
  const identityBirthYear = Number(
    birthYear || resolvePlayerIdentityBirthYear({ player, season })
  ) || 0
  const nameValues = [
    identity.normalizedName,
    player.originalFullName,
    player.matchedPlayerName,
    player.fullName,
    ...(Array.isArray(player.aliases) ? player.aliases : []),
  ]
  const aliasValues = unique(nameValues)
  const normalizedNames = unique(nameValues.flatMap(value => (
    [...buildPlayerNameVariants(value)]
  )))
  const externalPlayerId = isValidExternalPlayerId({
    externalPlayerId: identity.externalPlayerId,
    birthYear: identityBirthYear,
  })
    ? clean(identity.externalPlayerId)
    : ''
  const identityKey = buildPlayerIdentityKey({
    player,
    season,
    birthYear: identityBirthYear,
    normalizedName: identity.normalizedName,
  })
  const playerDocumentIds = unique([
    externalPlayerId || !identity.playerDocumentId.startsWith('external__')
      ? identity.playerDocumentId
      : '',
    player.approvedPlayerDocumentId,
    externalPlayerId ? buildPlayerDocumentId({ externalPlayerId }) : '',
    ...normalizedNames.map(normalizedName => buildPlayerDocumentId({ normalizedName })),
  ])

  return {
    externalPlayerId,
    identityKey,
    normalizedNames,
    aliasValues,
    playerDocumentIds,
    identityBirthYear,
  }
}

const readCandidates = (lookup, key, values) => uniqueCandidates(
  (Array.isArray(values) ? values : []).flatMap(value => (
    lookup?.[key]?.get(clean(value)) || []
  ))
)

// Pure candidate ordering. Data readers and flow policies stay outside domain.
export const resolvePlayerIdentityCandidates = ({ keys = {}, lookup = {} } = {}) => {
  const groups = [
    { source: 'externalPlayerId', candidates: readCandidates(lookup, 'byExternalPlayerId', [keys.externalPlayerId]) },
    { source: 'identityKey', candidates: readCandidates(lookup, 'byIdentityKey', [keys.identityKey]) },
    { source: 'normalizedName', candidates: readCandidates(lookup, 'byNormalizedName', keys.normalizedNames) },
    { source: 'playerDocument', candidates: readCandidates(lookup, 'byPlayerDocumentId', keys.playerDocumentIds) },
  ]
  const match = groups.find(group => group.candidates.length > 0) || {
    source: 'none',
    candidates: [],
  }

  return {
    ...match,
    status: match.candidates.length === 0
      ? 'unresolved'
      : match.candidates.length > 1
        ? 'ambiguous'
        : match.source === 'playerDocument'
          ? 'candidate'
          : 'matched',
  }
}
