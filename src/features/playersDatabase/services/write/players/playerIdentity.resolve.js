// features/playersDatabase/services/write/players/playerIdentity.resolve.js

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
} from '../../../model/playerIdentity.model.js'
import {
  buildPlayerIdentityCandidateKeys,
} from '../../../domain/identity/playerIdentityCandidates.domain.js'

const clean = value => String(value || '').trim()

const chunkValues = (values = [], size = 10) => {
  const chunks = []

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size))
  }

  return chunks
}

const readIdentityFieldMatches = async ({
  field,
  values = [],
} = {}) => {
  const safeValues = [...new Set(values.map(clean).filter(Boolean))]
  if (!safeValues.length) return []

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

  return snapshots.flatMap(snapshot => snapshot.docs)
}

const readPlayerIdentities = async ({
  players = [],
  birthYear = '',
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
    }),
    readIdentityFieldMatches({
      field: 'identityKey',
      values: identityKeys,
    }),
  ])
  const docsById = new Map()

  ;[...externalDocs, ...identityDocs].forEach(snapshot => {
    docsById.set(snapshot.id, snapshot)
  })

  return [...docsById.values()]
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

  try {
    if (externalPlayerId) {
      const externalCandidate = resolveExistingCandidate({
        candidates: lookup.byExternalId.get(externalPlayerId) || [],
        displayName: identity.fullName,
        identityKey,
      })

      if (externalCandidate) {
        return {
          identityStatus: 'זוהה שחקן קיים',
          identityMessage: `לפי מזהה התאחדות ${externalPlayerId}`,
          identityValid: true,
        }
      }

      const identityCandidate = resolveExistingCandidate({
        candidates: lookup.byIdentityKey.get(identityKey) || [],
        displayName: identity.fullName,
        identityKey,
      })
      const existingExternalId = clean(identityCandidate?.externalPlayerId)

      if (identityCandidate && !existingExternalId) {
        return {
          identityStatus: 'זוהה שחקן קיים',
          identityMessage: `לפי שם ושנתון; יתווסף מזהה התאחדות ${externalPlayerId}`,
          identityValid: true,
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
      }
    }

    const candidate = resolveExistingCandidate({
      candidates: lookup.byIdentityKey.get(identityKey) || [],
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
    return {
      ...player,
      playerId: identity.playerId,
      playerDocumentId: externalPlayerId
        ? `external__${normalizePlayerIdPart(externalPlayerId)}`
        : identity.playerDocumentId,
      externalPlayerId,
      identityKey,
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

    return {
      ...player,
      playerId,
      playerDocumentId: `external__${normalizePlayerIdPart(externalPlayerId)}`,
      externalPlayerId,
      identityKey,
    }
  }

  const candidate = ignoreIdentityConflict
    ? null
    : resolveExistingCandidate({
      candidates: lookup.byIdentityKey.get(identityKey) || [],
      displayName: identity.fullName,
      identityKey,
    })

  return {
    ...player,
    playerId: clean(candidate?.playerId) || createInternalPlayerId(birthYear),
    playerDocumentId: clean(candidate?.playerDocumentId),
    externalPlayerId: clean(candidate?.externalPlayerId),
    identityKey,
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

export async function resolveTeamPlayerIdentities({
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

  return safePlayers.map(player => resolvePlayerIdentity({
    player,
    birthYear,
    lookup,
  }))
}
