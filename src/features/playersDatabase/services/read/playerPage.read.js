// features/playersDatabase/services/read/playerPage.read.js

import {
  collection,
  doc,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import {
  trackedGetDoc,
  trackedGetDocs,
} from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import {
  adaptPlayerDocumentSeason,
  normalizePlayerEventsState,
} from '../../domain/index.js'
import { normalizePlayerNarrative } from '../../domain/narrative/index.js'
import {
  cleanValue,
  pickDefinedValue,
} from '../../model/value.model.js'
import {
  buildPlayerDocumentId,
  buildPlayerMatchValues,
  isCanonicalPlayerDocumentId,
  isValidExternalPlayerId,
} from '../../model/playerIdentity.model.js'
import {
  buildPlayerDocumentCacheKey,
  readWithDocumentCache,
} from '../cache/index.js'

const playerDocRef = documentId => (
  doc(db, PLAYERS_DATABASE_COLLECTIONS.players, cleanValue(documentId))
)

const resolvePlayerDocumentCandidates = playerId => {
  const safePlayerId = cleanValue(playerId)
  const legacyExternalMatch = safePlayerId.match(/^player__(?:19|20)\d{2}__(\d+)$/)

  if (legacyExternalMatch) {
    return [
      `external__${legacyExternalMatch[1]}`,
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

const buildFallbackPlayerDocument = async playerId => {
  const safePlayerId = cleanValue(playerId)
  if (!safePlayerId) return null

  const snapshot = await trackedGetDocs(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons),
    {
      feature: 'playersDatabase',
      action: 'player-fallback-team-seasons-scan',
      collection: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      meta: { playerId: safePlayerId },
    }
  )

  const current = []
  const history = []
  let identity = null

  snapshot.docs.forEach(teamItem => {
    const seasonDocument = { id: teamItem.id, ...teamItem.data() }
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
      })
    ))

    if (!playerRow) return

    identity = identity || playerRow

    const normalizedSeason = {
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
    }

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
    id: safePlayerId,
    playerDocumentId,
    playerId: cleanValue(identity?.playerId || safePlayerId),
    externalPlayerId: cleanValue(identity?.externalPlayerId),
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
    narrative: normalizePlayerNarrative(playerDocument.scoutNarrative),
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

export async function readPlayerSource({ playerId = '' } = {}) {
  return loadPlayerSource({
    playerId,
    action: 'player-json-read',
  })
}

export async function readPlayerPageData({ playerId = '' } = {}) {
  const safePlayerId = cleanValue(playerId)
  if (!safePlayerId) return null

  return readWithDocumentCache({
    key: buildPlayerDocumentCacheKey(safePlayerId),
    read: async () => {
      const playerDocument = await loadPlayerSource({
        playerId: safePlayerId,
        action: 'player-read',
      })

      if (!playerDocument) return null

      return adaptPlayerDocument(playerDocument)
    },
  })
}
