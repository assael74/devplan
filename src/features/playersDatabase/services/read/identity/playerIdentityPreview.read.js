// features/playersDatabase/services/write/players/playerIdentity.resolve.js

import { chunkValues } from '../../shared/chunkValues.js'
import {
  collection,
  query,
  where,
} from 'firebase/firestore'
import { trackedGetDocs } from '../../../../../services/firestore/usage/index.js'
import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  buildPlayerIdentityKey,
  createInternalPlayerId,
  isValidExternalPlayerId,
  normalizePlayerIdentity,
  normalizePlayerIdPart,
} from '../../../model/player/playerIdentity.model.js'
import {
  buildPlayerIdentityCandidateKeys,
} from '../../../domain/identity/playerIdentityCandidates.domain.js'

const clean = value => String(value || '').trim()


const readIdentityFieldMatches = async ({
  field,
  values = [],
  includeManifest = false,
} = {}) => {
  const safeValues = [...new Set(values.map(clean).filter(Boolean))]
  if (!safeValues.length) return includeManifest ? { docs: [], queries: [] } : []

  const snapshots = await Promise.all(
    chunkValues(safeValues).map(valueChunk => trackedGetDocs(
      query(
        collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
        where('entityType', '==', 'playerSeason'),
        where(field, 'in', valueChunk)
      ),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
        action: 'playerIdentity-preview',
        operationSubtype: 'identity-query',
      }
    ))
  )

  const docs = snapshots.flatMap(snapshot => snapshot.docs)
  if (!includeManifest) return docs

  return {
    docs,
    queries: chunkValues(safeValues).map((valueChunk, index) => ({
      field,
      values: [...valueChunk].sort(),
      resultIds: (snapshots[index]?.docs || []).map(row => row.id).sort(),
    })),
  }
}

export const validatePlayerIdentityQueryManifest = async (manifest = []) => {
  const rows = Array.isArray(manifest) ? manifest : []
  for (const row of rows) {
    const current = await readIdentityFieldMatches({
      field: clean(row?.field),
      values: Array.isArray(row?.values) ? row.values : [],
      includeManifest: true,
    })
    const actual = current.queries?.[0]?.resultIds || []
    const expected = Array.isArray(row?.resultIds) ? [...row.resultIds].sort() : []
    if (JSON.stringify(actual) !== JSON.stringify(expected)) return false
  }
  return true
}


const readPlayerIdentities = async ({
  players = [],
  birthYear = '',
  includeManifest = false,
} = {}) => {
  const externalIds = []
  const identityKeys = []

  players.forEach(player => {
    const keys = buildPlayerIdentityCandidateKeys({
      player,
      birthYear,
    })
    const externalPlayerId = isValidExternalPlayerId({
      externalPlayerId: keys.externalPlayerId,
      birthYear,
    })
      ? clean(keys.externalPlayerId)
      : ''

    if (externalPlayerId) externalIds.push(externalPlayerId)
    if (keys.identityKey) identityKeys.push(keys.identityKey)
  })

  const [externalDocs, identityDocs] = await Promise.all([
    readIdentityFieldMatches({
      field: 'externalPlayerId',
      values: externalIds,
      includeManifest,
    }),
    readIdentityFieldMatches({
      field: 'identityKey',
      values: identityKeys,
      includeManifest,
    }),
  ])
  const externalRows = includeManifest ? externalDocs.docs : externalDocs
  const identityRows = includeManifest ? identityDocs.docs : identityDocs
  const docsById = new Map()

  ;[...externalRows, ...identityRows].forEach(snapshot => {
    docsById.set(snapshot.id, snapshot)
  })

  const documents = [...docsById.values()]
  if (!includeManifest) return documents

  return {
    documents,
    queryManifest: [
      ...(externalDocs.queries || []),
      ...(identityDocs.queries || []),
    ],
  }
}


const uniqueByPlayerId = rows => {
  const lookup = new Map()

  rows.forEach(row => {
    const playerId = clean(row.playerId)
    if (playerId && !lookup.has(playerId)) lookup.set(playerId, row)
  })

  return [...lookup.values()]
}

const buildExistingIdentityLookup = docs => {
  const byExternalId = new Map()
  const byIdentityKey = new Map()

  docs.forEach(snapshot => {
    const row = snapshot.data() || {}
    if (clean(row.entityType) !== 'playerSeason') return

    const externalPlayerId = clean(row.externalPlayerId)
    const identityKey = clean(row.identityKey)

    if (externalPlayerId) {
      const rows = byExternalId.get(externalPlayerId) || []
      byExternalId.set(externalPlayerId, [...rows, row])
    }

    if (identityKey) {
      const rows = byIdentityKey.get(identityKey) || []
      byIdentityKey.set(identityKey, [...rows, row])
    }
  })

  return {
    byExternalId,
    byIdentityKey,
  }
}


const isInvalidInternalPlayerId = ({
  playerId = '',
  birthYear = '',
} = {}) => {
  const normalizedId = normalizePlayerIdPart(playerId)
  const year = normalizePlayerIdPart(birthYear)

  return Boolean(year && normalizedId === `player_${year}_${year}`)
}

const buildIdentityCandidate = (row = {}) => ({
  playerId: clean(row.playerId),
  playerDocumentId: clean(row.playerDocumentId),
  externalPlayerId: clean(row.externalPlayerId),
  displayName: clean(row.displayName || row.fullName),
  identityBirthYear: Number(row.identityBirthYear || row.birthYear) || 0,
  birthYear: Number(row.birthYear) || 0,
  playerUrl: clean(row.playerUrl),
  seasonId: clean(row.seasonId),
  seasonKey: clean(row.seasonKey),
  clubId: clean(row.clubId),
  birthTeamSlot: Number(row.birthTeamSlot || row.teamSlot) || 1,
  ageGroupId: clean(row.ageGroupId),
  ageGroupLabel: clean(row.ageGroupLabel),
  birthTeamDocumentId: clean(row.birthTeamDocumentId),
  teamId: clean(row.teamId || row.birthTeamId),
  teamUrl: clean(row.teamUrl),
})

const resolveExistingCandidate = ({
  candidates = [],
  displayName = '',
  identityKey = '',
} = {}) => {
  const uniqueCandidates = uniqueByPlayerId(candidates)

  if (uniqueCandidates.length > 1) {
    const error = new Error(`נמצאו כמה מזהים אפשריים עבור ${displayName}`)
    error.code = 'PLAYER_IDENTITY_AMBIGUOUS'
    error.details = {
      displayName,
      identityKey,
      candidates: uniqueCandidates.map(buildIdentityCandidate),
    }
    throw error
  }

  return uniqueCandidates[0] || null
}

const buildIdentityPreview = ({
  player = {},
  birthYear = '',
  lookup,
} = {}) => {
  const identity = normalizePlayerIdentity(player)
  const identityKey = buildPlayerIdentityKey({
    birthYear,
    normalizedName: identity.normalizedName,
  })
  const validExternalId = isValidExternalPlayerId({
    externalPlayerId: identity.externalPlayerId,
    birthYear,
  })
  const externalPlayerId = validExternalId ? identity.externalPlayerId : ''
  const externalCandidates = externalPlayerId
    ? lookup.byExternalId.get(externalPlayerId) || []
    : []
  const identityCandidates = lookup.byIdentityKey.get(identityKey) || []
  const membershipsFor = candidate => buildIdentityMemberships({
    candidates: [...externalCandidates, ...identityCandidates],
    playerId: candidate?.playerId,
  })

  try {
    if (externalPlayerId) {
      const externalCandidate = resolveExistingCandidate({
        candidates: externalCandidates,
        displayName: identity.fullName,
        identityKey,
      })

      if (externalCandidate) {
        return {
          identityStatus: 'זוהה שחקן קיים',
          identityMessage: `לפי מזהה התאחדות ${externalPlayerId}`,
          identityValid: true,
          identityMemberships: membershipsFor(externalCandidate),
        }
      }

      const identityCandidate = resolveExistingCandidate({
        candidates: identityCandidates,
        displayName: identity.fullName,
        identityKey,
      })
      const existingExternalId = clean(identityCandidate?.externalPlayerId)

      if (identityCandidate && !existingExternalId) {
        return {
          identityStatus: 'זוהה שחקן קיים',
          identityMessage: `לפי שם ושנתון; יתווסף מזהה התאחדות ${externalPlayerId}`,
          identityValid: true,
          identityMemberships: membershipsFor(identityCandidate),
        }
      }

      if (identityCandidate && existingExternalId !== externalPlayerId) {
        return {
          identityStatus: 'נדרשת בדיקה',
          identityMessage: `התנגשות מזהים: במאגר ${existingExternalId} · בטעינה ${externalPlayerId}`,
          identityValid: false,
          identityConflictType: 'externalPlayerId',
          identityExistingExternalPlayerId: existingExternalId,
          identityIncomingExternalPlayerId: externalPlayerId,
          identityCandidates: [
            buildIdentityCandidate(identityCandidate),
          ],
        }
      }

      return {
        identityStatus: 'שחקן חדש',
        identityMessage: `מזהה התאחדות חדש ${externalPlayerId}`,
        identityValid: true,
        identityMemberships: [],
      }
    }

    const candidate = resolveExistingCandidate({
      candidates: identityCandidates,
      displayName: identity.fullName,
      identityKey,
    })

    return {
      identityStatus: candidate
        ? 'זוהה שחקן קיים'
        : 'שחקן חדש',
      identityMessage: candidate
        ? 'לפי שם ושנתון'
        : 'ללא מזהה התאחדות',
      identityValid: true,
      identityMemberships: membershipsFor(candidate),
    }
  } catch (error) {
    const identityCandidates = Array.isArray(error.details?.candidates)
      ? error.details.candidates
      : []

    return {
      identityStatus: 'נדרשת בדיקה',
      identityMessage: error.message || 'נמצאו כמה התאמות אפשריות',
      identityValid: false,
      identityCandidates,
    }
  }
}

const buildIdentityMemberships = ({ candidates = [], playerId = '' } = {}) => (
  (Array.isArray(candidates) ? candidates : [])
    .filter(candidate => clean(candidate.playerId) === clean(playerId))
    .map(buildIdentityCandidate)
)

const resolvePlayerIdentity = ({
  player = {},
  birthYear = '',
  lookup,
} = {}) => {
  const identity = normalizePlayerIdentity(player)
  const identityKey = buildPlayerIdentityKey({
    birthYear,
    normalizedName: identity.normalizedName,
  })
  const validExternalId = isValidExternalPlayerId({
    externalPlayerId: identity.externalPlayerId,
    birthYear,
  })
  const externalPlayerId = validExternalId ? identity.externalPlayerId : ''
  const ignoreIdentityConflict = clean(player.identityResolution) === 'ignoreConflict'

  if (identity.playerId && !isInvalidInternalPlayerId({
    playerId: identity.playerId,
    birthYear,
  })) {
    const membershipCandidates = [
      ...(externalPlayerId ? lookup.byExternalId.get(externalPlayerId) || [] : []),
      ...(lookup.byIdentityKey.get(identityKey) || []),
    ]

    return {
      ...player,
      playerId: identity.playerId,
      playerDocumentId: externalPlayerId
        ? `external__${normalizePlayerIdPart(externalPlayerId)}`
        : identity.playerDocumentId,
      externalPlayerId,
      identityKey,
      identityMemberships: buildIdentityMemberships({
        candidates: membershipCandidates,
        playerId: identity.playerId,
      }),
    }
  }

  if (externalPlayerId) {
    const externalCandidate = resolveExistingCandidate({
      candidates: lookup.byExternalId.get(externalPlayerId) || [],
      displayName: identity.fullName,
      identityKey,
    })
    const identityCandidate = externalCandidate || (
      ignoreIdentityConflict
        ? null
        : resolveExistingCandidate({
          candidates: lookup.byIdentityKey.get(identityKey) || [],
          displayName: identity.fullName,
          identityKey,
        })
    )
    const existingExternalId = clean(identityCandidate?.externalPlayerId)

    if (identityCandidate && existingExternalId && existingExternalId !== externalPlayerId) {
      const error = new Error(
        `קיים שחקן בשם ${identity.fullName} עם מזהה התאחדות ${existingExternalId}`
      )
      error.code = 'PLAYER_IDENTITY_EXTERNAL_CONFLICT'
      throw error
    }

    const playerId = clean(identityCandidate?.playerId) || [
      'player',
      clean(birthYear),
      externalPlayerId,
    ]
      .map(normalizePlayerIdPart)
      .filter(Boolean)
      .join('__')

    const membershipCandidates = [
      ...(lookup.byExternalId.get(externalPlayerId) || []),
      ...(lookup.byIdentityKey.get(identityKey) || []),
    ]

    return {
      ...player,
      playerId,
      playerDocumentId: `external__${normalizePlayerIdPart(externalPlayerId)}`,
      externalPlayerId,
      identityKey,
      identityMemberships: buildIdentityMemberships({
        candidates: membershipCandidates,
        playerId,
      }),
    }
  }

  const candidate = ignoreIdentityConflict
    ? null
    : resolveExistingCandidate({
      candidates: lookup.byIdentityKey.get(identityKey) || [],
      displayName: identity.fullName,
      identityKey,
    })

  const playerId = clean(candidate?.playerId) || createInternalPlayerId(birthYear)

  return {
    ...player,
    playerId,
    playerDocumentId: clean(candidate?.playerDocumentId),
    externalPlayerId: clean(candidate?.externalPlayerId),
    identityKey,
    identityMemberships: buildIdentityMemberships({
      candidates: lookup.byIdentityKey.get(identityKey) || [],
      playerId,
    }),
  }
}

export async function resolveTeamPlayerIdentityPreview({
  players = [],
  season = {},
} = {}) {
  const birthYear = clean(season.birthYear)
  const safePlayers = Array.isArray(players) ? players : []

  if (!birthYear || !safePlayers.length) return safePlayers

  const documents = await readPlayerIdentities({
    players: safePlayers,
    birthYear,
  })
  const lookup = buildExistingIdentityLookup(documents)

  return safePlayers.map(player => ({
    ...player,
    ...buildIdentityPreview({
      player,
      birthYear,
      lookup,
    }),
  }))
}

export async function resolveTeamPlayerIdentitiesWithSources({
  players = [],
  season = {},
} = {}) {
  const birthYear = clean(season.birthYear)
  const safePlayers = Array.isArray(players) ? players : []

  if (!birthYear || !safePlayers.length) {
    return { players: safePlayers, sourceDocuments: [] }
  }

  const identityRead = await readPlayerIdentities({
    players: safePlayers,
    birthYear,
    includeManifest: true,
  })
  const documents = identityRead.documents
  const lookup = buildExistingIdentityLookup(documents)

  return {
    players: safePlayers.map(player => resolvePlayerIdentity({
      player,
      birthYear,
      lookup,
    })),
    sourceDocuments: documents.map(snapshot => ({
      id: snapshot.id,
      data: snapshot.data() || {},
    })),
    queryManifest: identityRead.queryManifest || [],
  }
}


export async function resolveTeamPlayerIdentities(args = {}) {
  const result = await resolveTeamPlayerIdentitiesWithSources(args)
  return result.players
}
