// src/features/playersDatabase/services/read/indexes/playerSearchIndexes.read.js

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
  buildPlayerSearchIndexDocumentId,
} from '../../../domain/identity/index.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const resolvePlayerId = ({ player = {}, playerDocument = {} } = {}) => clean(
  playerDocument.playerId ||
  playerDocument.id ||
  player.playerId ||
  player.id
)

const resolveTeamSeasonDocumentId = player => clean(
  player?.activeSeason?.references?.teamSeasonDocumentId ||
  player?.references?.teamSeasonDocumentId ||
  player?.teamSeasonDocumentId
)

export const canReadPlayerSearchIndexExport = player => Boolean(
  resolvePlayerId({ player }) && resolveTeamSeasonDocumentId(player)
)

export const readSearchIndexExportById = async ({ documentId = '' } = {}) => {
  const normalizedDocumentId = clean(documentId)
  if (!normalizedDocumentId) return null

  const snapshot = await trackedGetDoc(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.playerSearchIndexes, normalizedDocumentId),
    {
      feature: 'playersDatabase',
      action: 'player-search-index-by-id-read',
      collection: PLAYERS_DATABASE_COLLECTIONS.playerSearchIndexes,
      meta: { documentId: normalizedDocumentId },
    }
  )

  if (!snapshot.exists()) return null
  const data = snapshot.data() || {}
  return clean(data.playerId)
    ? { id: snapshot.id, ...data }
    : null
}

export const readPlayerSearchIndexExport = async ({ player = {} } = {}) => {
  const playerId = resolvePlayerId({ player })
  const teamSeasonDocumentId = resolveTeamSeasonDocumentId(player)
  if (!playerId || !teamSeasonDocumentId) return null

  return readSearchIndexExportById({
    documentId: buildPlayerSearchIndexDocumentId({
      playerId,
      teamSeasonDocumentId,
    }),
  })
}

export const readPlayerSearchIndexesExport = async ({
  player = {},
  playerDocument = {},
} = {}) => {
  const playerId = resolvePlayerId({ player, playerDocument })
  if (!playerId) return []

  const snapshot = await trackedGetDocs(
    query(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.playerSearchIndexes),
      where('playerId', '==', playerId),
    ),
    {
      feature: 'playersDatabase',
      action: 'player-search-indexes-json-read',
      collection: PLAYERS_DATABASE_COLLECTIONS.playerSearchIndexes,
      meta: { playerId },
    }
  )

  return snapshot.docs
    .map(item => ({ id: item.id, ...item.data() }))
    .filter(item => clean(item.playerId) === playerId)
    .sort((left, right) => (
      clean(left.seasonId).localeCompare(clean(right.seasonId)) ||
      clean(left.id).localeCompare(clean(right.id))
    ))
}
