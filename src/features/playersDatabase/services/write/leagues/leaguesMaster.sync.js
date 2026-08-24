// features/playersDatabase/services/write/leagues/leaguesMaster.sync.js

import {
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { PLAYERS_DATABASE_LEAGUES_MASTER_DOCUMENT_CATALOG } from '../../../catalog/firestoreDocuments/leaguesMaster.catalog.js'
import {
  buildLeaguesMasterLeagueEntry,
  buildLeaguesMasterLeagueMap,
  buildLeaguesMasterSummary,
  normalizeLeaguesMasterIds,
  sortLeaguesMasterEntries,
} from './leaguesMaster.model.js'

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
const MASTER_DOC_ID = 'all'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const leaguesMasterRef = () =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.leaguesMaster, MASTER_DOC_ID)

const leagueRef = leagueId =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.leagues, clean(leagueId))

export async function syncLeaguesMasterDocument({
  leagues = [],
  removedLeagueIds = [],
} = {}) {
  const safeLeagues = Array.isArray(leagues) ? leagues : []
  const removedIds = normalizeLeaguesMasterIds(removedLeagueIds)

  if (!safeLeagues.length && !removedIds.size) return null

  return trackedRunTransaction(db, async transaction => {
    const masterSnapshot = await transaction.get(leaguesMasterRef())
    const existingMaster = masterSnapshot.exists()
      ? masterSnapshot.data() || {}
      : PLAYERS_DATABASE_LEAGUES_MASTER_DOCUMENT_CATALOG
    const leagueMap = buildLeaguesMasterLeagueMap(existingMaster.leagues)
    const resolvedLeagues = []

    for (const inputLeague of safeLeagues) {
      const leagueId = clean(inputLeague?.id || inputLeague?.leagueId)
      if (!leagueId) continue

      const snapshot = await transaction.get(leagueRef(leagueId))
      if (!snapshot.exists()) continue

      resolvedLeagues.push({
        id: leagueId,
        ...snapshot.data(),
      })
    }

    resolvedLeagues.forEach(league => {
      const leagueId = clean(league?.leagueId || league?.id)
      leagueMap.set(
        leagueId,
        buildLeaguesMasterLeagueEntry(
          league,
          leagueMap.get(leagueId) || {}
        )
      )
    })

    removedIds.forEach(leagueId => leagueMap.delete(leagueId))

    const nextLeagues = sortLeaguesMasterEntries(
      Array.from(leagueMap.values())
    )

    transaction.set(
      leaguesMasterRef(),
      {
        id: MASTER_DOC_ID,
        docType: 'leagues_master',
        summary: buildLeaguesMasterSummary(nextLeagues),
        leagues: nextLeagues,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      updated: true,
      leaguesCount: nextLeagues.length,
    }
  })
}
