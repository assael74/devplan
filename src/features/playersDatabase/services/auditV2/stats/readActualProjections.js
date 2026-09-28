// src/features/playersDatabase/services/auditV2/stats/readActualProjections.js

import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  trackedGetDocFromServer,
} from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const readDoc = async (collectionName, id, action) => {
  const documentId = clean(id)
  if (!documentId) return null

  const snapshot = await trackedGetDocFromServer(
    doc(db, collectionName, documentId),
    {
      feature: 'playersDatabase',
      collection: collectionName,
      action,
      operationSubtype: 'audit-getDoc',
    }
  )

  return snapshot.exists()
    ? {
        id: snapshot.id,
        ...(snapshot.data() || {}),
      }
    : null
}

export async function readActualStatsProjectionsV2({
  expected = {},
  canonical = {},
} = {}) {
  const expectedPlayerIndexes = Array.isArray(expected.playerSearchIndexes)
    ? expected.playerSearchIndexes
    : []

  const [playerSearchIndexes, teamSearchIndex, league] = await Promise.all([
    Promise.all(expectedPlayerIndexes.map(row => readDoc(
      PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      row?.docId,
      'audit-v2-stats-read-player-index'
    ))),
    readDoc(
      PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      expected.teamSearchIndex?.docId,
      'audit-v2-stats-read-team-index'
    ),
    readDoc(
      PLAYERS_DATABASE_COLLECTIONS.leagues,
      canonical.leagueId,
      'audit-v2-stats-read-league'
    ),
  ])

  return {
    playerSearchIndexes: playerSearchIndexes.filter(Boolean),
    teamSearchIndex,
    league,
  }
}
