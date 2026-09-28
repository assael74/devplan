// src/features/playersDatabase/services/writeV2/league/deleteSeason/deleteLeagueSeasonReceipt.js

import { collection, query, where } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedGetDocsFromServer } from '../../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS as C } from '../../../../constants/pdb.constants.js'
import { sameSeason } from '../../../../domain/leagueV2/clear/leagueTeamsClearedState.builder.js'
import { failDeleteSeason } from '../../../../domain/leagueV2/deleteSeason/deleteLeagueSeason.builder.js'
import { createWriteActionReceiptV2 } from '../../receipt/service.js'
import { patchWriteActionReceiptV2 } from '../../receipt/repository.js'

export const matchesDeleteSeasonReceipt = (row, target) => {
  const receipt = row.data
  return receipt.status === 'open' && receipt.flowType === 'league' &&
    receipt.operationType === 'delete' && receipt.label === 'DELETE_LEAGUE_SEASON' &&
    receipt.auditTarget?.leagueId === target.leagueId &&
    sameSeason(receipt.auditTarget?.seasonKey, target.seasonKey)
}

export const selectDeleteSeasonReceipt = (rows, target) => {
  const matches = rows.filter(row => matchesDeleteSeasonReceipt(row, target))
  if (matches.length > 1) failDeleteSeason('DELETE_SEASON_RECEIPTS', 'Multiple matching receipts')
  return matches[0]?.docId || ''
}

export const openDeleteSeasonReceipt = async identity => {
  const snapshot = await trackedGetDocsFromServer(query(collection(db, C.writeActionsV2), where('status', '==', 'open')), {
    feature: 'playersDatabase', collection: C.writeActionsV2, action: 'delete-season-receipt',
  })
  const receiptId = selectDeleteSeasonReceipt(snapshot.docs.map(row => ({ docId: row.id, data: row.data() })), identity)
  const initialFields = {
    executionStatus: 'running', lastCompletedStep: null, failedStep: null, failedTarget: null,
  }
  if (receiptId) {
    await patchWriteActionReceiptV2({ receiptId, patch: { ...initialFields, lastAuditAt: null, lastAuditSummary: null } })
    return receiptId
  }
  return createWriteActionReceiptV2({
    flowType: 'league', operationType: 'delete', label: 'DELETE_LEAGUE_SEASON',
    auditTarget: identity, initialFields,
  })
}

// Read-only UI context; duplicate matching receipts are still handled at session start.
export const readOpenDeleteSeasonReceipts = async () => {
  const snapshot = await trackedGetDocsFromServer(query(collection(db, C.writeActionsV2), where('status', '==', 'open')), {
    feature: 'playersDatabase', collection: C.writeActionsV2, action: 'delete-season-availability',
  })
  return snapshot.docs.map(row => ({ docId: row.id, data: row.data() }))
}
