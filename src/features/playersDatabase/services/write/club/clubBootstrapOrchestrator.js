// src/features/playersDatabase/services/write/club/clubBootstrapOrchestrator.js

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../catalog/clubs.catalog.js'
import { buildClubBootstrapApprovedState } from '../../../domain/club/bootstrapClubCatalog.builder.js'
import { auditClubBootstrap } from '../../audit/club/index.js'
import {
  completeWriteActionAudit,
  completeWriteActionStage,
  failWriteActionStage,
  openWriteActionReceipt,
} from '../receipt/index.js'
import { readClubBootstrapSources } from './readClubBootstrapSources.js'
import { writeClubBootstrap } from './writeClubBootstrap.js'

const withReceiptId = ({ error, receiptId }) => {
  const result = error instanceof Error ? error : new Error('Club bootstrap failed')
  if (receiptId && !result.receiptId) result.receiptId = receiptId
  return result
}

export const prepareClubBootstrap = async () => {
  const sources = await readClubBootstrapSources()
  return buildClubBootstrapApprovedState({
    catalog: PLAYERS_DATABASE_CLUBS_CATALOG,
    existingProfiles: sources.profiles,
    existingDirectory: sources.directory,
  })
}

export const bootstrapClubs = async ({ receiptId = '' } = {}) => {
  const approvedState = await prepareClubBootstrap()
  let resolvedReceiptId = ''

  try {
    resolvedReceiptId = await openWriteActionReceipt({
      actionType: 'clubsBootstrap',
      target: { domain: 'clubs' },
      display: {
        actionLabel: 'אתחול מועדונים',
        targetLabel: 'כל המועדונים',
      },
      receiptId,
    })
  } catch (error) {
    throw withReceiptId({ error, receiptId: resolvedReceiptId || receiptId })
  }

  let writeResult
  try {
    writeResult = await writeClubBootstrap({ approvedState })
    await completeWriteActionStage({
      receiptId: resolvedReceiptId,
      stageId: 'clubProfilesAndDirectory',
    })
  } catch (error) {
    const stageError = withReceiptId({ error, receiptId: resolvedReceiptId })
    stageError.failedTarget = {
      targetType: 'clubProfilesAndDirectory',
      documentId: 'all',
    }
    await failWriteActionStage({
      receiptId: resolvedReceiptId,
      stageId: 'clubProfilesAndDirectory',
      error: stageError,
    }).catch(() => null)
    throw stageError
  }

  try {
    const audit = await auditClubBootstrap({ approvedState })
    const receiptState = await completeWriteActionAudit({
      receiptId: resolvedReceiptId,
      audit,
    })
    return {
      actionType: 'clubsBootstrap',
      receiptId: resolvedReceiptId,
      status: receiptState.status,
      executionStatus: receiptState.executionStatus,
      recoveryRequired: receiptState.recoveryRequired,
      writeResult,
      audit,
    }
  } catch (error) {
    const auditError = withReceiptId({ error, receiptId: resolvedReceiptId })
    auditError.failedTarget = { targetType: 'clubBootstrapAudit', documentId: 'all' }
    await failWriteActionStage({
      receiptId: resolvedReceiptId,
      stageId: 'audit',
      error: auditError,
    }).catch(() => null)
    throw auditError
  }
}
