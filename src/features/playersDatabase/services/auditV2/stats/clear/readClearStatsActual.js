// src/features/playersDatabase/services/auditV2/stats/clear/readClearStatsActual.js

import { doc } from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedGetDocFromServer } from '../../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { buildTeamSeasonDocumentId } from '../../../../model/team/teamIdentity.model.js'

const read = async (collectionName, docId) => {
  if (!docId) return null
  const snapshot = await trackedGetDocFromServer(
    doc(db, collectionName, docId),
    {
      action: 'clear-stats-v2-audit-read',
      operationSubtype: 'audit-getDoc',
    }
  )
  return snapshot.exists() ? snapshot.data() : null
}

export async function readClearStatsActualV2({ approvedState } = {}) {
  const identity = approvedState.identity
  const plan = approvedState.projectionPlan || {}
  const teamSeasonDocumentId = buildTeamSeasonDocumentId(identity.birthTeamDocumentId, identity.seasonKey)
  const playerDocumentsById = {}
  const playerSearchIndexesById = {}
  const clubsById = {}

  for (const operation of plan.playerDocumentOperations || []) {
    playerDocumentsById[operation.target.docId] = await read(PLAYERS_DATABASE_COLLECTIONS.players, operation.target.docId)
  }
  for (const operation of plan.playerSearchIndexOperations || []) {
    playerSearchIndexesById[operation.target.docId] = await read(PLAYERS_DATABASE_COLLECTIONS.searchIndexes, operation.target.docId)
  }
  for (const operation of plan.clubOperations || []) {
    clubsById[operation.target.docId] = await read(PLAYERS_DATABASE_COLLECTIONS.clubs, operation.target.docId)
  }

  return {
    teamSeasonDocumentId,
    teamSeason: await read(PLAYERS_DATABASE_COLLECTIONS.teamSeasons, teamSeasonDocumentId),
    projections: {
      playerDocumentsById,
      playerSearchIndexesById,
      teamSearchIndex: plan.teamSearchIndexOperation
        ? await read(PLAYERS_DATABASE_COLLECTIONS.searchIndexes, plan.teamSearchIndexOperation.target.docId)
        : null,
      league: plan.leagueOperation
        ? await read(PLAYERS_DATABASE_COLLECTIONS.leagues, plan.leagueOperation.target.docId)
        : null,
      clubsById,
      clubsMaster: plan.clubsMasterOperation
        ? await read(PLAYERS_DATABASE_COLLECTIONS.clubsMaster, plan.clubsMasterOperation.target.docId)
        : null,
    },
  }
}
