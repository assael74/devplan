// features/playersDatabase/services/write/searchIndex/player/playerIdentity.resolve.js

import {
  collection,
  documentId,
  query,
  where,
} from 'firebase/firestore'
import { trackedGetDocs } from '../../../../../../services/firestore/usage/index.js'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import {
  buildPlayerIdentityKey,
  createInternalPlayerId,
  isValidExternalPlayerId,
  normalizePlayerNameValue,
  resolveInternalPlayerId,
  resolvePlayerIdentityBirthYear,
} from '../../../../model/playerIdentity.model.js'
import {
  buildPlayerIdentityCandidateKeys,
  buildPlayerIdentityCandidateMetadata,
  resolvePlayerIdentityCandidates,
} from '../../../../domain/identity/playerIdentityCandidates.domain.js'
import { clean } from '../../leagues/leagueDoc.js'

const readIdentityMatches = queryRef => trackedGetDocs(queryRef, {
  feature: 'playersDatabase',
  collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
  action: 'playerIdentity-resolve',
  operationSubtype: 'identity-query',
})

const IDENTITY_LOOKUP_LIMIT = 10

const chunkValues = (values = [], size = IDENTITY_LOOKUP_LIMIT) => {
  const chunks = []

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size))
  }

  return chunks
}

const readIdentityFieldMatchesMany = async ({
  field,
  values = [],
} = {}) => {
  const safeValues = [...new Set(
    (Array.isArray(values) ? values : [])
      .map(clean)
      .filter(Boolean)
  )]
  if (!safeValues.length) return []

  const snapshots = await Promise.all(
    chunkValues(safeValues).map(valueChunk => readIdentityMatches(query(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
      where(field, 'in', valueChunk)
    )))
  )
  const docsById = new Map()

  snapshots.forEach(snapshot => {
    snapshot.docs.forEach(item => {
      if (clean(item.data()?.entityType) !== 'playerSeason') return
      docsById.set(item.id, item)
    })
  })

  return [...docsById.values()]
}

const readAliasMatchesMany = async ({ values = [] } = {}) => {
  const safeValues = [...new Set((Array.isArray(values) ? values : [])
    .map(clean)
    .filter(Boolean))]
  if (!safeValues.length) return []

  const snapshots = await Promise.all(safeValues.map(value => readIdentityMatches(query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('aliases', 'array-contains', value)
  ))))
  const docsById = new Map()

  snapshots.forEach(snapshot => {
    snapshot.docs.forEach(item => {
      if (clean(item.data()?.entityType) !== 'playerSeason') return
      docsById.set(item.id, item)
    })
  })

  return [...docsById.values()]
}

const readPlayerDocumentCandidatesMany = async ({ values = [] } = {}) => {
  const safeValues = [...new Set((Array.isArray(values) ? values : [])
    .map(clean)
    .filter(Boolean))]
  if (!safeValues.length) return []

  const snapshots = await Promise.all(
    chunkValues(safeValues).map(valueChunk => trackedGetDocs(query(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.players),
      where(documentId(), 'in', valueChunk)
    ), {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.players,
      action: 'playerIdentity-document-fallback',
      operationSubtype: 'identity-query',
    }))
  )

  return snapshots.flatMap(snapshot => snapshot.docs.map(item => ({
    ...(item.data() || {}),
    id: item.id,
    playerDocumentId: item.id,
  })))
}

const readPlayerDocumentCanonicalMatchesMany = async ({ values = [] } = {}) => {
  const safeValues = [...new Set((Array.isArray(values) ? values : [])
    .map(clean)
    .filter(Boolean))]
  if (!safeValues.length) return []

  const snapshots = await Promise.all(
    chunkValues(safeValues).map(valueChunk => readIdentityMatches(query(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
      where('playerDocumentId', 'in', valueChunk)
    )))
  )

  return snapshots.flatMap(snapshot => snapshot.docs
    .filter(item => clean(item.data()?.entityType) === 'playerSeason')
    .map(item => item.data() || {}))
}

const buildIdentityLookup = ({
  searchIndexDocs = [],
  playerDocuments = [],
  playerDocumentCanonicalDocs = [],
} = {}) => {
  const byExternalPlayerId = new Map()
  const byIdentityKey = new Map()
  const byNormalizedDisplayName = new Map()
  const byPlayerDocumentId = new Map()
  const canonicalByPlayerDocumentId = new Map()

  ;(Array.isArray(searchIndexDocs) ? searchIndexDocs : []).forEach(item => {
    const data = item.data() || {}
    const playerId = clean(data.playerId)
    if (!playerId) return

    const append = (map, key) => {
      const cleanKey = clean(key)
      if (!cleanKey) return
      const values = map.get(cleanKey) || []
      if (!values.some(value => value.playerId === playerId)) {
        map.set(cleanKey, [...values, data])
      }
    }

    append(byExternalPlayerId, data.externalPlayerId)
    append(byIdentityKey, data.identityKey)
    append(byNormalizedDisplayName, data.normalizedDisplayName)
    ;(Array.isArray(data.aliases) ? data.aliases : []).forEach(alias => {
      append(byNormalizedDisplayName, normalizePlayerNameValue(alias))
    })
  })

  ;(Array.isArray(playerDocumentCanonicalDocs) ? playerDocumentCanonicalDocs : []).forEach(data => {
    const playerDocumentId = clean(data.playerDocumentId)
    const playerId = clean(data.playerId)
    if (!playerDocumentId || !playerId) return

    const candidates = canonicalByPlayerDocumentId.get(playerDocumentId) || []
    canonicalByPlayerDocumentId.set(playerDocumentId, [...candidates, data])
  })

  ;(Array.isArray(playerDocuments) ? playerDocuments : []).forEach(data => {
    const playerDocumentId = clean(data.playerDocumentId || data.id)
    if (!playerDocumentId) return

    const canonicalCandidates = (canonicalByPlayerDocumentId.get(playerDocumentId) || [])
    const canonicalPlayerIds = [...new Set(canonicalCandidates
      .map(candidate => clean(candidate.playerId))
      .filter(Boolean))]
    const canonicalPlayerId = canonicalPlayerIds.length === 1
      ? canonicalPlayerIds[0]
      : ''

    byPlayerDocumentId.set(playerDocumentId, [{
      ...data,
      playerDocumentId,
      playerId: canonicalPlayerId,
      canonicalPlayerIdMapping: canonicalPlayerId
        ? 'resolved'
        : canonicalPlayerIds.length > 1
          ? 'ambiguous'
          : 'missing',
    }])
  })

  return {
    byExternalPlayerId,
    byIdentityKey,
    byNormalizedDisplayName,
    byNormalizedName: byNormalizedDisplayName,
    byPlayerDocumentId,
  }
}

const getLookupPlayerIds = rows => [...new Set(
  (Array.isArray(rows) ? rows : [])
    .map(row => clean(row?.playerId))
    .filter(Boolean)
)]

const resolveLegacyNameMatchesFromLookup = ({
  player = {},
  season = {},
  lookup,
} = {}) => {
  const normalizedName = normalizePlayerNameValue(
    player.normalizedName || player.matchedPlayerName || player.fullName
  )
  if (!normalizedName) return []

  const identityBirthYear = resolvePlayerIdentityBirthYear({
    player,
    season,
  })
  const seasonBirthYear = Number(season.birthYear)
  const isYounger = Boolean(
    player.isYoungerAgeGroup || clean(player.rosterStatus) === 'youngerAgeGroup'
  )
  const rows = lookup.byNormalizedDisplayName.get(normalizedName) || []

  return [...new Set(
    rows
      .filter(data => {
        const storedIdentityYear = Number(data.identityBirthYear)
        if (storedIdentityYear) return storedIdentityYear === identityBirthYear

        const storedBirthYear = Number(data.birthYear)
        if (storedBirthYear === identityBirthYear) return true

        return isYounger && storedBirthYear === seasonBirthYear
      })
      .map(data => clean(data.playerId))
      .filter(Boolean)
  )]
}

const resolveExistingPlayerIdsFromLookup = ({
  player = {},
  season = {},
  lookup,
} = {}) => {
  const keys = buildPlayerIdentityCandidateKeys({ player, season })
  const resolution = resolvePlayerIdentityCandidates({ keys, lookup })

  return {
    ...resolution,
    playerIds: getLookupPlayerIds(resolution.candidates),
  }
}

const getPlayerIds = snapshot => [...new Set(
  snapshot.docs
    .filter(item => clean(item.data()?.entityType) === 'playerSeason')
    .map(item => clean(item.data()?.playerId))
    .filter(Boolean)
)]

const findByField = async ({ field, value }) => {
  if (!clean(value)) return []

  const snapshot = await readIdentityMatches(query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where(field, '==', value)
  ))

  return getPlayerIds(snapshot)
}

const findLegacyNameMatches = async ({
  player = {},
  season = {},
} = {}) => {
  const normalizedName = normalizePlayerNameValue(
    player.normalizedName || player.matchedPlayerName || player.fullName
  )
  if (!normalizedName) return []

  const snapshot = await readIdentityMatches(query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('normalizedDisplayName', '==', normalizedName)
  ))
  const identityBirthYear = resolvePlayerIdentityBirthYear({
    player,
    season,
  })
  const seasonBirthYear = Number(season.birthYear)
  const isYounger = Boolean(
    player.isYoungerAgeGroup || clean(player.rosterStatus) === 'youngerAgeGroup'
  )

  return [...new Set(snapshot.docs
    .filter(item => {
      const data = item.data() || {}
      const storedIdentityYear = Number(data.identityBirthYear)
      if (storedIdentityYear) return storedIdentityYear === identityBirthYear

      const storedBirthYear = Number(data.birthYear)
      if (storedBirthYear === identityBirthYear) return true

      return isYounger && storedBirthYear === seasonBirthYear
    })
    .map(item => clean(item.data()?.playerId))
    .filter(Boolean))]
}

const findIdentityKeyMatches = async ({
  player = {},
  season = {},
} = {}) => {
  const identityKey = buildPlayerIdentityKey({
    player,
    season,
  })
  if (!identityKey) return []

  return findByField({
    field: 'identityKey',
    value: identityKey,
  })
}

const resolveExistingPlayerIds = async ({
  player = {},
  season = {},
} = {}) => {
  const externalPlayerId = isValidExternalPlayerId({
    externalPlayerId: player.externalPlayerId,
    birthYear: resolvePlayerIdentityBirthYear({ player, season }),
  })
    ? clean(player.externalPlayerId)
    : ''
  if (externalPlayerId) {
    const matches = await findByField({
      field: 'externalPlayerId',
      value: externalPlayerId,
    })
    if (matches.length) return matches
  }

  const identityMatches = await findIdentityKeyMatches({
    player,
    season,
  })
  if (identityMatches.length) return identityMatches

  return findLegacyNameMatches({
    player,
    season,
  })
}

const enrichResolvedPlayer = ({
  player = {},
  season = {},
  playerId = '',
  matchStatus = '',
  candidateIds = [],
  candidates = [],
} = {}) => ({
  ...player,
  playerId,
  identityBirthYear: resolvePlayerIdentityBirthYear({
    player,
    season,
  }),
  identityKey: buildPlayerIdentityKey({
    player,
    season,
  }),
  identityMatchStatus: matchStatus,
  identityCandidateIds: candidateIds,
  identityCandidates: buildPlayerIdentityCandidateMetadata(candidates),
})

const buildResolutionKey = ({
  player = {},
  season = {},
} = {}) => {
  const existingPlayerId = resolveInternalPlayerId(player)
  if (existingPlayerId) return `playerId:${existingPlayerId}`

  const externalPlayerId = isValidExternalPlayerId({
    externalPlayerId: player.externalPlayerId,
    birthYear: resolvePlayerIdentityBirthYear({ player, season }),
  })
    ? clean(player.externalPlayerId)
    : ''
  if (externalPlayerId) return `externalPlayerId:${externalPlayerId}`

  const identityKey = buildPlayerIdentityKey({
    player,
    season,
  })
  return identityKey ? `identityKey:${identityKey}` : ''
}

export async function resolvePlayerIdentity({
  player = {},
  season = {},
} = {}) {
  const existingPlayerId = resolveInternalPlayerId(player)
  if (existingPlayerId) {
    return enrichResolvedPlayer({
      player,
      season,
      playerId: existingPlayerId,
      matchStatus: 'provided',
    })
  }

  const matches = await resolveExistingPlayerIds({
    player,
    season,
  })
  if (matches.length === 1) {
    return enrichResolvedPlayer({
      player,
      season,
      playerId: matches[0],
      matchStatus: 'matched',
    })
  }

  return enrichResolvedPlayer({
    player,
    season,
    playerId: createInternalPlayerId(),
    matchStatus: matches.length > 1 ? 'ambiguous' : 'created',
    candidateIds: matches,
  })
}

export async function resolvePlayerIdentities({
  players = [],
  season = {},
} = {}) {
  const safePlayers = Array.isArray(players) ? players : []
  const unresolvedPlayers = safePlayers.filter(player => (
    !resolveInternalPlayerId(player)
  ))
  const candidateKeys = unresolvedPlayers.map(player => (
    buildPlayerIdentityCandidateKeys({ player, season })
  ))
  const externalPlayerIds = candidateKeys
    .map(keys => keys.externalPlayerId)
    .filter(Boolean)
  const identityKeys = candidateKeys
    .map(keys => keys.identityKey)
    .filter(Boolean)
  const normalizedNames = candidateKeys.flatMap(keys => keys.normalizedNames)
  const aliasValues = candidateKeys.flatMap(keys => keys.aliasValues)
  const playerDocumentIds = candidateKeys.flatMap(keys => keys.playerDocumentIds)

  const [
    externalDocs,
    identityDocs,
    legacyNameDocs,
    aliasDocs,
    playerDocuments,
    playerDocumentCanonicalDocs,
  ] = await Promise.all([
    readIdentityFieldMatchesMany({
      field: 'externalPlayerId',
      values: externalPlayerIds,
    }),
    readIdentityFieldMatchesMany({
      field: 'identityKey',
      values: identityKeys,
    }),
    readIdentityFieldMatchesMany({
      field: 'normalizedDisplayName',
      values: normalizedNames,
    }),
    readAliasMatchesMany({
      values: aliasValues,
    }),
    readPlayerDocumentCandidatesMany({
      values: playerDocumentIds,
    }),
    readPlayerDocumentCanonicalMatchesMany({
      values: playerDocumentIds,
    }),
  ])
  const docsById = new Map()

  ;[
    ...externalDocs,
    ...identityDocs,
    ...legacyNameDocs,
    ...aliasDocs,
  ].forEach(item => docsById.set(item.id, item))

  const lookup = buildIdentityLookup({
    searchIndexDocs: [...docsById.values()],
    playerDocuments,
    playerDocumentCanonicalDocs,
  })
  const resolvedByKey = new Map()
  const results = []

  safePlayers.forEach(player => {
    const resolutionKey = buildResolutionKey({
      player,
      season,
    })
    const previous = resolutionKey
      ? resolvedByKey.get(resolutionKey)
      : null

    if (previous) {
      results.push(enrichResolvedPlayer({
        player,
        season,
        playerId: previous.playerId,
        matchStatus: previous.identityMatchStatus,
        candidateIds: previous.identityCandidateIds,
        candidates: previous.identityCandidates,
      }))
      return
    }

    const existingPlayerId = resolveInternalPlayerId(player)
    let resolvedPlayer = null

    if (existingPlayerId) {
      resolvedPlayer = enrichResolvedPlayer({
        player,
        season,
        playerId: existingPlayerId,
        matchStatus: 'provided',
      })
    } else {
      const resolution = resolveExistingPlayerIdsFromLookup({
        player,
        season,
        lookup,
      })
      const matches = resolution.playerIds
      const canCreate = clean(player.identityResolution) === 'createNew'
      const approvedPlayerDocumentId = clean(player.approvedPlayerDocumentId)
      const approvedIdentityCandidateId = clean(player.approvedIdentityCandidateId)
      const approvedCanonicalPlayerId = clean(player.approvedCanonicalPlayerId)
      const approvedCandidate = ['candidate', 'ambiguous'].includes(resolution.status)
        ? resolution.candidates.find(candidate => {
          const candidateDocumentId = clean(candidate.playerDocumentId || candidate.id)
          const candidatePlayerId = clean(candidate.playerId)

          return Boolean(candidatePlayerId) && (
            (approvedPlayerDocumentId &&
              candidateDocumentId === approvedPlayerDocumentId &&
              candidatePlayerId === approvedCanonicalPlayerId) ||
            (approvedIdentityCandidateId &&
              candidatePlayerId === approvedIdentityCandidateId)
          )
        })
        : null
      const approvedPlayerId = clean(
        approvedCandidate?.playerId
      )

      resolvedPlayer = enrichResolvedPlayer({
        player,
        season,
        playerId: approvedCandidate
          ? approvedPlayerId
          : resolution.status === 'matched' && matches.length === 1
          ? matches[0]
          : resolution.status === 'unresolved' && canCreate
            ? createInternalPlayerId()
            : '',
        matchStatus: approvedCandidate
          ? 'provided'
          : resolution.status === 'matched' && matches.length === 1
          ? 'matched'
          : resolution.status === 'ambiguous'
            ? 'ambiguous'
            : resolution.status === 'candidate'
              ? 'candidate'
              : canCreate
                ? 'created'
                : 'unresolved',
        candidateIds: resolution.candidates.map(candidate => clean(
          candidate.playerId || candidate.playerDocumentId || candidate.id
        )).filter(Boolean),
        candidates: resolution.candidates,
      })
    }

    if (resolutionKey) {
      resolvedByKey.set(resolutionKey, resolvedPlayer)
    }
    results.push(resolvedPlayer)
  })

  return results
}
