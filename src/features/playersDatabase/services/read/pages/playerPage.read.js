// src/features/playersDatabase/services/read/pages/playerPage.read.js

import {
  collection,
  doc,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  trackedGetDoc,
  trackedGetDocs,
} from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  adaptPlayerDocumentSeason,
  normalizePlayerEventsState,
} from '../../../domain/index.js'
import {
  cleanValue,
  pickDefinedValue,
} from '../../../model/shared/value.model.js'
import {
  buildPlayerDocumentId,
  buildPlayerMatchValues,
  isCanonicalPlayerDocumentId,
  isValidExternalPlayerId,
} from '../../../model/player/playerIdentity.model.js'
import {
  buildPlayerDocumentCacheKey,
  deleteDocumentCacheValue,
  getDocumentCacheResolvedKey,
  readWithDocumentCache,
  refreshWithDocumentCache,
  setDocumentCacheAlias,
  setDocumentCacheValue,
} from '../../cache/index.js'
import { getTeamSeason } from '../entities/teamSeason.js'

const playerDocRef = documentId => (
  doc(db, PLAYERS_DATABASE_COLLECTIONS.players, cleanValue(documentId))
)

const resolveLegacyExternalPlayerId = playerId => {
  const safePlayerId = cleanValue(playerId)
  const legacyExternalMatch = safePlayerId.match(/^player__(?:19|20)\d{2}__(\d+)$/)
  return cleanValue(legacyExternalMatch?.[1])
}

const resolveExternalLookupId = playerId => {
  const safePlayerId = cleanValue(playerId)
  const legacyExternalPlayerId = resolveLegacyExternalPlayerId(safePlayerId)
  if (legacyExternalPlayerId) return legacyExternalPlayerId

  const canonicalExternalMatch = safePlayerId.match(/^external__(\d+)$/)
  if (canonicalExternalMatch) return cleanValue(canonicalExternalMatch[1])
  if (/^\d{5,}$/.test(safePlayerId)) return safePlayerId

  return ''
}

const resolvePlayerDocumentCandidates = playerId => {
  const safePlayerId = cleanValue(playerId)
  const legacyExternalPlayerId = resolveLegacyExternalPlayerId(safePlayerId)

  if (legacyExternalPlayerId) {
    return [
      `external__${legacyExternalPlayerId}`,
      safePlayerId,
    ]
  }

  return safePlayerId ? [safePlayerId] : []
}

const normalizeMatchValues = value => (
  buildPlayerMatchValues(value)
    .map(item => cleanValue(item).toLowerCase())
    .filter(Boolean)
)

const isSamePlayerSource = (candidate = {}, player = {}) => {
  const candidateKeys = new Set(normalizeMatchValues(candidate))
  const playerKeys = normalizeMatchValues(player)

  return playerKeys.some(key => candidateKeys.has(key))
}

const normalizeFallbackSeason = ({ seasonDocument = {}, playerRow = {} } = {}) => ({
  ...seasonDocument,
  ...playerRow,
  playerStats: playerRow.playerStats || {},
  scoutProfiles: Array.isArray(playerRow.scoutProfiles)
    ? playerRow.scoutProfiles
    : [],
  clubId: seasonDocument.clubId,
  leagueId: seasonDocument.leagueId,
  birthTeamId:
    seasonDocument.birthTeamId ||
    seasonDocument.teamId,
  birthTeamDocumentId:
    seasonDocument.birthTeamDocumentId,
  birthTeamSlot:
    seasonDocument.birthTeamSlot || 1,
  ageGroupId: seasonDocument.ageGroupId,
  ageGroupLabel: seasonDocument.ageGroupLabel,
  teamDisplayName:
    seasonDocument.displayName ||
    seasonDocument.ageGroupLabel,
})

const buildFallbackDocumentFromTeamSeasons = ({
  playerId = '',
  teamSeasons = [],
} = {}) => {
  const safePlayerId = cleanValue(playerId)
  const current = []
  const history = []
  let identity = null

  teamSeasons.filter(Boolean).forEach(seasonDocument => {
    const target = cleanValue(seasonDocument.seasonStatus) === 'completed'
      ? 'history'
      : 'current'
    const teamPlayers = Array.isArray(seasonDocument.teamPlayers)
      ? seasonDocument.teamPlayers
      : []
    const playerRow = teamPlayers.find(candidate => (
      isSamePlayerSource(candidate, {
        playerDocumentId: safePlayerId,
        playerId: safePlayerId,
        externalPlayerId: resolveLegacyExternalPlayerId(safePlayerId),
      })
    ))

    if (!playerRow) return

    identity = identity || playerRow
    const normalizedSeason = normalizeFallbackSeason({
      seasonDocument,
      playerRow,
    })

    if (target === 'current') {
      current.push(normalizedSeason)
      return
    }

    history.push(normalizedSeason)
  })

  if (!current.length && !history.length) return null

  const externalPlayerId = cleanValue(identity?.externalPlayerId)
  const playerDocumentId = isValidExternalPlayerId({
    externalPlayerId,
    birthYear: identity?.birthYear,
  })
    ? buildPlayerDocumentId({ externalPlayerId })
    : isCanonicalPlayerDocumentId(identity?.playerDocumentId)
      ? cleanValue(identity.playerDocumentId)
      : ''

  return {
    id: playerDocumentId || safePlayerId,
    playerDocumentId,
    playerId: cleanValue(identity?.playerId || safePlayerId),
    externalPlayerId,
    fullName: cleanValue(
      identity?.fullName ||
      identity?.displayName ||
      identity?.matchedPlayerName ||
      '-'
    ),
    normalizedName: cleanValue(identity?.normalizedName),
    birthYear: pickDefinedValue(identity?.birthYear, null),
    birthDate: pickDefinedValue(identity?.birthDate, null),
    status: cleanValue(identity?.status),
    notes: cleanValue(identity?.notes),
    avatarUrl: cleanValue(identity?.avatarUrl),
    current,
    history,
  }
}

const readPlayerSeasonIndexQuery = async ({
  requestedPlayerId,
  field,
  value,
}) => {
  const snapshot = await trackedGetDocs(
    query(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
      where('entityType', '==', 'playerSeason'),
      where(field, '==', value)
    ),
    {
      feature: 'playersDatabase',
      action: 'player-fallback-search-index-lookup',
      collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      meta: {
        requestedPlayerId,
        field,
        value,
      },
    }
  )

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data(),
  }))
}

const readPlayerSeasonIndexMatches = async playerId => {
  const safePlayerId = cleanValue(playerId)
  if (!safePlayerId) return []

  const externalLookupId = resolveExternalLookupId(safePlayerId)
  const deterministicDocumentId = externalLookupId
    ? `external__${externalLookupId}`
    : safePlayerId
  const primaryRows = await readPlayerSeasonIndexQuery({
    requestedPlayerId: safePlayerId,
    field: 'playerDocumentId',
    value: deterministicDocumentId,
  })
  if (primaryRows.length) return primaryRows

  const alternateRequests = [
    ...(safePlayerId !== deterministicDocumentId
      ? [['playerId', safePlayerId]]
      : []),
    ...(externalLookupId
      ? [['externalPlayerId', externalLookupId]]
      : []),
  ]
  const rowsById = new Map()

  for (const [field, value] of alternateRequests) {
    const rows = await readPlayerSeasonIndexQuery({
      requestedPlayerId: safePlayerId,
      field,
      value,
    })
    rows.forEach(row => rowsById.set(row.id, row))
    if (rowsById.size) break
  }

  return [...rowsById.values()]
}

const buildFallbackPlayerDocumentFromIndexes = async playerId => {
  const indexRows = await readPlayerSeasonIndexMatches(playerId)
  if (!indexRows.length) return null

  const scopes = [...new Map(indexRows.map(row => {
    const birthTeamDocumentId = cleanValue(row.birthTeamDocumentId)
    const seasonKey = cleanValue(row.seasonKey)
    return [
      `${birthTeamDocumentId}:${seasonKey}`,
      { birthTeamDocumentId, seasonKey },
    ]
  }).filter(([, scope]) => scope.birthTeamDocumentId && scope.seasonKey)).values()]
  const teamSeasons = await Promise.all(scopes.map(scope => getTeamSeason(scope)))

  return buildFallbackDocumentFromTeamSeasons({
    playerId,
    teamSeasons,
  })
}

const buildLegacyFallbackPlayerDocument = async playerId => {
  const safePlayerId = cleanValue(playerId)
  if (!safePlayerId) return null

  const snapshot = await trackedGetDocs(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons),
    {
      feature: 'playersDatabase',
      action: 'player-legacy-fallback-team-seasons-scan',
      collection: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      meta: { playerId: safePlayerId },
    }
  )
  const teamSeasons = snapshot.docs.map(teamItem => ({
    id: teamItem.id,
    ...teamItem.data(),
  }))

  return buildFallbackDocumentFromTeamSeasons({
    playerId: safePlayerId,
    teamSeasons,
  })
}

const buildFallbackPlayerDocument = async playerId => (
  (await buildFallbackPlayerDocumentFromIndexes(playerId)) ||
  buildLegacyFallbackPlayerDocument(playerId)
)

const adaptPlayerDocument = playerDocument => {
  const current = Array.isArray(playerDocument.current)
    ? playerDocument.current.map(seasonDocument => (
      adaptPlayerDocumentSeason({
        playerDocument,
        seasonDocument,
        target: 'current',
      })
    ))
    : []

  const history = Array.isArray(playerDocument.history)
    ? playerDocument.history.map(seasonDocument => (
      adaptPlayerDocumentSeason({
        playerDocument,
        seasonDocument,
        target: 'history',
      })
    ))
    : []

  const seasons = [...current, ...history]
  const activeSeason = current[0] || history[0] || null

  return {
    identity: {
      playerId: cleanValue(
        activeSeason?.identity?.playerId ||
        playerDocument.playerId ||
        playerDocument.id
      ),
      playerDocumentId: cleanValue(
        activeSeason?.identity?.playerDocumentId ||
        playerDocument.playerDocumentId ||
        playerDocument.id
      ),
      externalPlayerId: cleanValue(
        activeSeason?.identity?.externalPlayerId ||
        playerDocument.externalPlayerId
      ),
      displayName: cleanValue(
        activeSeason?.identity?.displayName ||
        playerDocument.fullName ||
        playerDocument.displayName ||
        '-'
      ),
      normalizedName: cleanValue(
        activeSeason?.identity?.normalizedName ||
        playerDocument.normalizedName
      ),
      birthYear: pickDefinedValue(playerDocument.birthYear, activeSeason?.season?.birthYear, null),
      birthDate: pickDefinedValue(playerDocument.birthDate, null),
      status: cleanValue(playerDocument.status),
      avatarUrl: cleanValue(playerDocument.avatarUrl),
    },
    current,
    history,
    seasons,
    activeSeason,
    events: normalizePlayerEventsState(playerDocument),
    metadata: {
      notes: cleanValue(playerDocument.notes),
      updatedAt: playerDocument.updatedAt || null,
    },
  }
}

const loadPlayerSource = async ({ playerId = '', action = 'player-read' } = {}) => {
  const safePlayerId = cleanValue(playerId)
  if (!safePlayerId) return null

  const candidates = resolvePlayerDocumentCandidates(safePlayerId)

  for (const documentId of candidates) {
    const snapshot = await trackedGetDoc(playerDocRef(documentId), {
      feature: 'playersDatabase',
      action,
      collection: PLAYERS_DATABASE_COLLECTIONS.players,
      meta: {
        requestedPlayerId: safePlayerId,
        documentId,
      },
    })

    if (!snapshot.exists()) continue

    return {
      id: snapshot.id,
      ...snapshot.data(),
    }
  }

  return buildFallbackPlayerDocument(safePlayerId)
}

const registerPlayerCacheAliases = ({ requestedPlayerId = '', playerPageData = null } = {}) => {
  const requestedKey = buildPlayerDocumentCacheKey(requestedPlayerId)
  const canonicalPlayerDocumentId = cleanValue(
    playerPageData?.identity?.playerDocumentId || requestedPlayerId
  )
  const canonicalKey = buildPlayerDocumentCacheKey(canonicalPlayerDocumentId)
  if (!requestedKey || !canonicalKey) return requestedKey

  const aliasIds = [
    requestedPlayerId,
    playerPageData?.identity?.playerId,
    playerPageData?.identity?.externalPlayerId,
  ]
    .map(cleanValue)
    .filter(Boolean)

  const resolvedRequestedKey = getDocumentCacheResolvedKey(requestedKey)
  if (resolvedRequestedKey !== canonicalKey) {
    setDocumentCacheValue({
      key: canonicalKey,
      value: playerPageData,
    })
    deleteDocumentCacheValue(requestedKey)
  }

  aliasIds.forEach(aliasId => {
    const aliasKey = buildPlayerDocumentCacheKey(aliasId)
    if (!aliasKey || aliasKey === canonicalKey) return
    setDocumentCacheAlias({
      aliasKey,
      targetKey: canonicalKey,
    })
  })

  return canonicalKey
}

export async function readPlayerSource({ playerId = '' } = {}) {
  return loadPlayerSource({
    playerId,
    action: 'player-json-read',
  })
}

export async function readPlayerPageData({
  playerId = '',
  refresh = false,
} = {}) {
  const safePlayerId = cleanValue(playerId)
  if (!safePlayerId) return null

  const requestedKey = buildPlayerDocumentCacheKey(safePlayerId)
  const legacyExternalPlayerId = resolveLegacyExternalPlayerId(safePlayerId)
  if (legacyExternalPlayerId) {
    setDocumentCacheAlias({
      aliasKey: requestedKey,
      targetKey: buildPlayerDocumentCacheKey(`external__${legacyExternalPlayerId}`),
    })
  }

  const read = async () => {
    const playerDocument = await loadPlayerSource({
      playerId: safePlayerId,
      action: 'player-read',
    })

    if (!playerDocument) return null

    return adaptPlayerDocument(playerDocument)
  }
  const reader = refresh ? refreshWithDocumentCache : readWithDocumentCache
  const playerPageData = await reader({
    key: requestedKey,
    read,
  })

  if (!playerPageData) return null
  registerPlayerCacheAliases({
    requestedPlayerId: safePlayerId,
    playerPageData,
  })
  return playerPageData
}
