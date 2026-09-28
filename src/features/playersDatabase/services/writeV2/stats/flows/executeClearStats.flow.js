// src/features/playersDatabase/services/writeV2/stats/flows/executeClearStats.flow.js

import { CLEAR_STATS_APPROVED_STATE_VERSION } from '../../../../domain/statsV2/clearStatsApprovedState.builder.js'
import { auditClearStatsV2 } from '../../../auditV2/stats/clear/auditClearStatsV2.js'
import { readClearStatsActualV2 } from '../../../auditV2/stats/clear/readClearStatsActual.js'
import {
  closeClearStatsReceiptV2,
  createClearStatsReceiptV2,
  patchClearStatsReceiptV2,
  reportClearStatsCanonicalV2,
  saveClearStatsAuditSummaryV2,
} from '../clear/clearStatsReceipt.service.js'
import { writeClearStatsProjectionsV2 } from '../clear/clearStatsProjectionWriters.js'
import { writeClearStatsCanonicalV2 } from './writeClearStatsCanonical.flow.js'

const fail = (code, message) => {
  const error = new Error(message)
  error.code = code
  throw error
}

const validateApprovedState = approvedState => {
  if (
    !approvedState ||
    approvedState.stateType !== 'clearStatsApprovedState' ||
    Number(approvedState.stateVersion) !== CLEAR_STATS_APPROVED_STATE_VERSION ||
    approvedState.flowType !== 'stats' ||
    approvedState.operationType !== 'clear' ||
    approvedState.label !== 'CLEAR_STATS' ||
    !approvedState.projectionPlan
  ) {
    fail('CLEAR_STATS_APPROVED_STATE_INVALID', 'Valid Clear Stats Approved State is required')
  }
}

const errorPayload = error => ({
  code: String(error?.code || 'CLEAR_STATS_FAILED'),
  message: String(error?.message || 'CLEAR_STATS failed'),
})

export async function executeClearStatsV2({ approvedState, now } = {}) {
  validateApprovedState(approvedState)

  const startedAt = now || new Date().toISOString()
  let receiptId = ''
  let failedStep = 'receipt'
  let canonicalWrite = null
  let projectionWrite = null

  try {
    receiptId = await createClearStatsReceiptV2({ approvedState, startedAt })
    failedStep = 'canonical'
    canonicalWrite = await writeClearStatsCanonicalV2({ approvedState })
    await reportClearStatsCanonicalV2({ receiptId, succeeded: true })

    await patchClearStatsReceiptV2({
      receiptId,
      patch: {
        canonicalWrite: {
          status: 'succeeded',
          writeSkipped: canonicalWrite.writeSkipped,
          playersAffected: canonicalWrite.playersAffected,
        },
      },
    })

    failedStep = 'projections'
    projectionWrite = await writeClearStatsProjectionsV2({
      approvedState,
    })

    await patchClearStatsReceiptV2({
      receiptId,
      patch: { projectionWrite },
    })

    failedStep = 'audit'
    const actualState = await readClearStatsActualV2({ approvedState })
    const audit = auditClearStatsV2({ approvedState, actualState })
    await saveClearStatsAuditSummaryV2({
      receiptId,
      audit,
      ranAt: now || new Date().toISOString(),
    })

    if (audit.status !== 'passed') {
      const error = new Error(`CLEAR_STATS Audit failed with ${audit.failuresCount} finding(s)`)
      error.code = 'CLEAR_STATS_AUDIT_FAILED'
      error.audit = audit
      throw error
    }

    await patchClearStatsReceiptV2({
      receiptId,
      patch: {
        executionStatus: 'succeeded',
        completedAt: now || new Date().toISOString(),
        audit: {
          status: 'passed',
          failuresCount: 0,
        },
        failedStep: null,
        error: null,
      },
    })
    await closeClearStatsReceiptV2({ receiptId })

    return {
      receiptId,
      status: 'succeeded',
      identity: approvedState.identity,
      canonicalWrite,
      projectionWrite,
      audit,
    }
  } catch (error) {
    error.failedStep = failedStep
    error.receiptId = receiptId
    error.canonicalWrite = canonicalWrite
    error.projectionWrite = error?.projectionWrite || projectionWrite

    if (receiptId) {
      try {
        if (failedStep === 'canonical' && !canonicalWrite) {
          await reportClearStatsCanonicalV2({ receiptId, succeeded: false })
        }
        await patchClearStatsReceiptV2({
          receiptId,
          patch: {
            executionStatus: 'failed',
            completedAt: now || new Date().toISOString(),
            ...(error?.projectionWrite
              ? { projectionWrite: error.projectionWrite }
              : {}),
            audit: failedStep === 'audit'
              ? {
                  status: 'failed',
                  failuresCount: Number(error?.audit?.failuresCount) || 1,
                }
              : {
                  status: 'pending',
                  failuresCount: 0,
                },
            failedStep,
            error: errorPayload(error),
          },
        })
      } catch (receiptError) {
        error.receiptUpdateError = errorPayload(receiptError)
      }
    }

    throw error
  }
}
