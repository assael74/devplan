// src/features/playersDatabase/services/read/playerScoutHistory.read.js

import { doc } from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { trackedGetDoc } from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import {
  buildPlayerScoutStatsLoadMeasurementHistoryEvents,
  normalizePlayerScoutStatsLoadMeasurementHistory,
} from '../../model/playerScoutMeasurement.model.js'
import { isSameSeason } from '../../model/season.model.js'
import { cleanValue } from '../../model/value.model.js'

const playerDocRef = documentId => (
  doc(db, PLAYERS_DATABASE_COLLECTIONS.players, cleanValue(documentId))
)

const isSameTeamDocument = (seasonRow, teamDocumentId) => {
  const safeTeamDocumentId = cleanValue(teamDocumentId)
  if (!safeTeamDocumentId) return true

  return [
    seasonRow?.birthTeamDocumentId,
    seasonRow?.teamDocumentId,
  ].map(cleanValue).includes(safeTeamDocumentId)
}

const isSameBirthYear = (seasonRow, season) => {
  const requestedBirthYear = Number(season?.birthYear || 0) || null
  const rowBirthYear = Number(seasonRow?.birthYear || 0) || null

  if (!requestedBirthYear || !rowBirthYear) return true
  return requestedBirthYear === rowBirthYear
}

const findPlayerSeasonRow = ({ playerDocument, season, teamDocumentId }) => {
  const rows = [
    ...(Array.isArray(playerDocument?.current) ? playerDocument.current : []),
    ...(Array.isArray(playerDocument?.history) ? playerDocument.history : []),
  ]

  return rows.find(row => (
    isSameSeason(row, season) &&
    isSameBirthYear(row, season) &&
    isSameTeamDocument(row, teamDocumentId)
  )) || null
}

export async function readPlayerScoutMeasurementHistory({ playerDocumentId = '', season = {}, teamDocumentId = '' } = {}) {
  const safePlayerDocumentId = cleanValue(playerDocumentId)
  if (!safePlayerDocumentId) {
    return {
      history: [],
      events: [],
    }
  }

  const snapshot = await trackedGetDoc(playerDocRef(safePlayerDocumentId), {
    feature: 'playersDatabase',
    action: 'player-scout-history-read',
    collection: PLAYERS_DATABASE_COLLECTIONS.players,
    meta: {
      playerDocumentId: safePlayerDocumentId,
      seasonId: cleanValue(season?.seasonId),
      seasonKey: cleanValue(season?.seasonKey),
      teamDocumentId: cleanValue(teamDocumentId),
    },
  })

  if (!snapshot.exists()) {
    return {
      history: [],
      events: [],
    }
  }

  const playerDocument = {
    id: snapshot.id,
    ...snapshot.data(),
  }
  const seasonRow = findPlayerSeasonRow({
    playerDocument,
    season,
    teamDocumentId,
  })
  const history = normalizePlayerScoutStatsLoadMeasurementHistory(
    seasonRow?.scoutStatsLoadMeasurementHistory
  )

  return {
    history,
    events: buildPlayerScoutStatsLoadMeasurementHistoryEvents(history),
  }
}
