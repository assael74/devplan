// src/features/playersDatabase/services/writeV2/league/clear/readClearLeagueTeams.js

import { collection, doc, query, where } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedGetDocsFromServer, trackedGetDocFromServer } from '../../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS as C } from '../../../../constants/pdb.constants.js'
import { sameSeason, assertDocumentId } from '../../../../domain/leagueV2/clear/leagueTeamsClearedState.builder.js'

export const CLEAR_LEAGUE_COLLECTIONS = {
  league: C.leagues, team: C.teamSeasons, root: C.teams,
  teamIndex: C.searchIndexes, identity: C.clubsMaster, club: C.clubs,
  clubsMaster: C.clubsMaster, leaguesMaster: C.leaguesMaster,
}
const usage = collectionName => ({
  feature: 'playersDatabase', collection: collectionName,
  action: 'clear-league-teams', operationSubtype: 'getFromServer',
})

const readCollection = async name => {
  const snapshot = await trackedGetDocsFromServer(collection(db, name), usage(name))
  return snapshot.docs.map(row => ({ docId: row.id, data: row.data() }))
}

export const readClearLeagueDocument = async (kind, id) => {
  const name = CLEAR_LEAGUE_COLLECTIONS[kind]
  try {
    const snapshot = await trackedGetDocFromServer(doc(db, name, assertDocumentId(id)), usage(name))
    return snapshot.exists() ? snapshot.data() : null
  } catch (error) {
    error.failedTarget = { targetType: kind, documentId: id }
    throw error
  }
}

export const readClearLeagueSources = async () => {
  // Full server scans are intentional here: nested Club rows have no indexed
  // scope field, and Retry must discover leftovers after the League rows vanished.
  const [leagues, teamSeasons, roots, indexes, clubs, masterDocuments, leaguesMaster] = await Promise.all([
    readCollection(C.leagues), readCollection(C.teamSeasons), readCollection(C.teams),
    readCollection(C.searchIndexes), readCollection(C.clubs), readCollection(C.clubsMaster),
    readClearLeagueDocument('leaguesMaster', 'all'),
  ])
  return {
    leagues, teamSeasons, roots, indexes, clubs, leaguesMaster,
    identities: masterDocuments.filter(row => row.data.documentType === 'clubSeasonIdentityIndex' || row.docId.startsWith('identity__')),
    clubsMaster: masterDocuments.find(row => row.docId === 'all')?.data || null,
  }
}

export const findClearLeagueReceipt = async target => {
  const snapshot = await trackedGetDocsFromServer(query(
    collection(db, C.writeActionsV2), where('status', '==', 'open')
  ), usage(C.writeActionsV2))

  const matchingReceipt = snapshot.docs.find(row => {
    const receipt = row.data()

    return (
      receipt.flowType === 'league' &&
      receipt.operationType === 'clear' &&
      receipt.label === 'CLEAR_LEAGUE_TEAMS' &&
      receipt.auditTarget?.leagueId === target.leagueId &&
      sameSeason(receipt.auditTarget?.seasonKey, target.seasonKey)
    )
  })

  return matchingReceipt?.id || ''
}
