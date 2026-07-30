// features/playersDatabase/services/read/playerPage.read.js

import { collection, doc, getDoc, getDocs } from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { adaptPlayerDocumentSeason } from '../../domain/index.js'
import { cleanValue } from '../../model/value.model.js'
import { buildPlayerMatchValues } from '../../model/playerIdentity.model.js'
import {
  buildPlayerDocumentCacheKey,
  readWithDocumentCache,
} from '../cache/index.js'

const playerDocRef = documentId => (
  doc(db, PLAYERS_DATABASE_COLLECTIONS.players, cleanValue(documentId))
)

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

  const snapshot = await getDocs(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.teams)
  )

  const current = []
  const history = []
  let identity = null

  snapshot.docs.forEach(teamItem => {
    const teamDocument = {
      id: teamItem.id,
      ...teamItem.data(),
    }

    const seasonTargets = [
      ...(Array.isArray(teamDocument.current)
        ? teamDocument.current.map(seasonDocument => ({
          seasonDocument,
          target: 'current',
        }))
        : []),
      ...(Array.isArray(teamDocument.history)
        ? teamDocument.history.map(seasonDocument => ({
          seasonDocument,
          target: 'history',
        }))
        : []),
    ]

    seasonTargets.forEach(({ seasonDocument, target }) => {
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
        clubId: seasonDocument.clubId || teamDocument.clubId,
        leagueId: seasonDocument.leagueId || teamDocument.leagueId,
        birthTeamId:
          teamDocument.birthTeamId ||
          teamDocument.teamId ||
          seasonDocument.birthTeamId ||
          seasonDocument.teamId,
        birthTeamDocumentId:
          teamDocument.id ||
          teamDocument.birthTeamDocumentId ||
          seasonDocument.birthTeamDocumentId,
        birthTeamSlot:
          teamDocument.birthTeamSlot ||
          seasonDocument.birthTeamSlot ||
          1,
        ageGroupId: seasonDocument.ageGroupId || teamDocument.ageGroupId,
        ageGroupLabel:
          seasonDocument.ageGroupLabel || teamDocument.ageGroupLabel,
        teamDisplayName:
          teamDocument.displayName ||
          seasonDocument.displayName ||
          seasonDocument.ageGroupLabel,
      }

      if (target === 'current') {
        current.push(normalizedSeason)
        return
      }

      history.push(normalizedSeason)
    })
  })

  if (!current.length && !history.length) return null

  return {
    id: safePlayerId,
    playerDocumentId: safePlayerId,
    playerId: cleanValue(identity?.playerId || safePlayerId),
    externalPlayerId: cleanValue(identity?.externalPlayerId),
    fullName: cleanValue(
      identity?.fullName ||
      identity?.displayName ||
      identity?.matchedPlayerName ||
      '-'
    ),
    normalizedName: cleanValue(identity?.normalizedName),
    birthYear: identity?.birthYear ?? null,
    birthDate: identity?.birthDate ?? null,
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
      birthYear: playerDocument.birthYear ?? activeSeason?.season?.birthYear ?? null,
      birthDate: playerDocument.birthDate ?? null,
      status: cleanValue(playerDocument.status),
      avatarUrl: cleanValue(playerDocument.avatarUrl),
    },
    current,
    history,
    seasons,
    activeSeason,
    metadata: {
      notes: cleanValue(playerDocument.notes),
      updatedAt: playerDocument.updatedAt || null,
    },
  }
}

export async function readPlayerPageData({ playerId = '' } = {}) {
  const safePlayerId = cleanValue(playerId)
  if (!safePlayerId) return null

  return readWithDocumentCache({
    key: buildPlayerDocumentCacheKey(safePlayerId),
    read: async () => {
      const snapshot = await getDoc(playerDocRef(safePlayerId))
      const playerDocument = snapshot.exists()
        ? {
          id: snapshot.id,
          ...snapshot.data(),
        }
        : await buildFallbackPlayerDocument(safePlayerId)

      if (!playerDocument) return null

      return adaptPlayerDocument(playerDocument)
    },
  })
}
