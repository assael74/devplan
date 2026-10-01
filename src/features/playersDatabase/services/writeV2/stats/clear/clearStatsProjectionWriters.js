// src/features/playersDatabase/services/writeV2/stats/clear/clearStatsProjectionWriters.js

import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedGetDocFromServer } from '../../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import {
  invalidateClubDocumentCache,
  invalidateClubsMasterDocumentCache,
  invalidateLeagueDocumentCache,
  invalidatePlayerDocumentCache,
} from '../../../cache/index.js'
import { CLEAR_STATS_APPROVED_STATE_VERSION } from '../../../../domain/statsV2/clearStatsApprovedState.builder.js'

const normalize = value => {
  if (Array.isArray(value)) return value.map(normalize)
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = normalize(value[key])
      return result
    }, {})
  }
  return value
}

const sameValue = (left, right) => (
  JSON.stringify(normalize(left)) === JSON.stringify(normalize(right))
)

const fail = (code, message) => {
  const error = new Error(message)
  error.code = code
  throw error
}

const COLLECTION_BY_TARGET = Object.freeze({
  playerDocument: PLAYERS_DATABASE_COLLECTIONS.players,
  playerSearchIndex: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
  teamSearchIndex: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
  league: PLAYERS_DATABASE_COLLECTIONS.leagues,
  club: PLAYERS_DATABASE_COLLECTIONS.clubs,
  clubsMaster: PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
})

const sourceMatches = ({ document, sourceFields, setFields }) => (
  Object.keys(setFields || {}).every(field => {
    const sourceHasField = Object.prototype.hasOwnProperty.call(sourceFields || {}, field)
    const documentHasField = Object.prototype.hasOwnProperty.call(document || {}, field)

    if (sourceHasField !== documentHasField) return false
    return !sourceHasField || sameValue(document[field], sourceFields[field])
  })
)

const writeOperation = async ({ targetType, operation }) => {
  if (!operation) return null

  const docId = String(operation.target?.docId || '').trim()

  if (!docId) {
    fail('CLEAR_STATS_PROJECTION_TARGET_INVALID', `Missing ${targetType} target docId`)
  }

  if (operation.action === 'skip') {
    return { targetType, docId, action: 'skip', status: 'skipped' }
  }

  if (operation.action !== 'update') {
    fail('CLEAR_STATS_PROJECTION_ACTION_INVALID', `Unsupported ${targetType} action`)
  }

  const reference = doc(db, COLLECTION_BY_TARGET[targetType], docId)
  const snapshot = await trackedGetDocFromServer(reference, {
    action: `clear-stats-v2-read-${targetType}`,
    operationSubtype: 'write-precondition-getDoc',
  })

  if (!snapshot.exists()) {
    fail('CLEAR_STATS_PROJECTION_TARGET_NOT_FOUND', `${targetType} target does not exist`)
  }

  const current = snapshot.data() || {}

  if (!sourceMatches({
    document: current,
    sourceFields: operation.sourceFields,
    setFields: operation.setFields,
  })) {
    fail('CLEAR_STATS_PROJECTION_SOURCE_MISMATCH', `${targetType} source changed after approval`)
  }

  const writtenAt = serverTimestamp()
  const writeFields = {
    ...(operation.setFields || {}),
    updatedAt: writtenAt,
    ...(targetType === 'clubsMaster' ? {
      lastWriteAction: 'CLEAR_STATS',
      lastWriteAt: writtenAt,
    } : {}),
  }

  await updateDoc(reference, writeFields)

  if (targetType === 'club') invalidateClubDocumentCache(docId)
  if (targetType === 'clubsMaster') invalidateClubsMasterDocumentCache()
  if (targetType === 'league') invalidateLeagueDocumentCache(docId)
  if (targetType === 'playerDocument') invalidatePlayerDocumentCache(docId)

  return { targetType, docId, action: 'update', status: 'written' }
}

export async function writeClearStatsProjectionsV2({ approvedState } = {}) {
  if (
    !approvedState ||
    approvedState.stateType !== 'clearStatsApprovedState' ||
    Number(approvedState.stateVersion) !== CLEAR_STATS_APPROVED_STATE_VERSION ||
    approvedState.flowType !== 'stats' ||
    approvedState.operationType !== 'clear' ||
    approvedState.label !== 'CLEAR_STATS'
  ) {
    fail('CLEAR_STATS_APPROVED_STATE_INVALID', 'Approved Clear Stats State is required')
  }

  const projectionPlan = approvedState.projectionPlan
  if (!projectionPlan || Number(projectionPlan.planVersion) !== 1) {
    fail('CLEAR_STATS_PROJECTION_PLAN_INVALID', 'Clear Stats projection plan is invalid')
  }

  const ordered = [
    ...(projectionPlan.playerDocumentOperations || []).map(operation => ({ targetType: 'playerDocument', operation })),
    ...(projectionPlan.playerSearchIndexOperations || []).map(operation => ({ targetType: 'playerSearchIndex', operation })),
    { targetType: 'teamSearchIndex', operation: projectionPlan.teamSearchIndexOperation },
    { targetType: 'league', operation: projectionPlan.leagueOperation },
    ...(projectionPlan.clubOperations || []).map(operation => ({ targetType: 'club', operation })),
    { targetType: 'clubsMaster', operation: projectionPlan.clubsMasterOperation },
  ].filter(item => item.operation)

  const targets = []
  let writesAttempted = 0

  for (const item of ordered) {
    if (item.operation.action === 'update') writesAttempted += 1

    try {
      targets.push(await writeOperation(item))
    } catch (error) {
      error.projectionWrite = {
        writesAttempted,
        writesCompleted: targets.filter(target => target.status === 'written').length,
        writesSkipped: targets.filter(target => target.status === 'skipped').length,
        targets,
        failedTarget: {
          targetType: item.targetType,
          docId: String(item.operation?.target?.docId || '').trim(),
          status: 'failed',
          code: String(error?.code || 'CLEAR_STATS_PROJECTION_WRITE_FAILED'),
        },
      }
      throw error
    }
  }

  const writesCompleted = targets.filter(target => target.status === 'written').length
  const writesSkipped = targets.filter(target => target.status === 'skipped').length

  return {
    writesAttempted,
    writesCompleted,
    writesSkipped,
    targets,
    failedTarget: null,
  }
}
