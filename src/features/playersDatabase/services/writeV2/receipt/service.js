// src/features/playersDatabase/services/writeV2/receipt/service.js

import {
  assertWriteActionCanonicalStatusV2,
  assertWriteActionFlowTypeV2,
  assertWriteActionStatusV2,
  buildWriteActionAuditSummaryV2,
  buildWriteActionAuditTargetV2,
  WRITE_ACTION_V2_CANONICAL_STATUS,
  WRITE_ACTION_V2_STATUS,
} from './contract.js'
import {
  createWriteActionReceiptReferenceV2,
  listRecentWriteActionReceiptsV2,
  patchWriteActionReceiptV2,
  readWriteActionReceiptV2,
  writeWriteActionReceiptV2,
} from './repository.js'

export async function createWriteActionReceiptV2({
  flowType = '',
  label = '',
  auditTarget = {},
} = {}) {
  const resolvedFlowType = assertWriteActionFlowTypeV2(flowType)
  const resolvedLabel = String(label || '').trim()

  if (!resolvedLabel) throw new Error('Missing WriteAction V2 label')

  const resolvedAuditTarget = buildWriteActionAuditTargetV2({
    flowType: resolvedFlowType,
    auditTarget,
  })
  const reference = createWriteActionReceiptReferenceV2()

  await writeWriteActionReceiptV2({
    reference,
    receipt: {
      id: reference.id,
      flowType: resolvedFlowType,
      label: resolvedLabel,
      auditTarget: resolvedAuditTarget,
      canonicalStatus: WRITE_ACTION_V2_CANONICAL_STATUS.PENDING,
      lastAuditAt: null,
      lastAuditSummary: null,
      status: WRITE_ACTION_V2_STATUS.OPEN,
    },
  })

  return reference.id
}

export async function reportWriteActionCanonicalStatusV2({
  receiptId = '',
  canonicalStatus = '',
} = {}) {
  const resolvedStatus = assertWriteActionCanonicalStatusV2(canonicalStatus)

  return patchWriteActionReceiptV2({
    receiptId,
    patch: {
      canonicalStatus: resolvedStatus,
    },
  })
}

export async function saveWriteActionAuditSummaryV2({
  receiptId = '',
  ranAt = null,
  coverage = '',
  findingsCount = 0,
  checkedDomains = [],
} = {}) {
  const summary = buildWriteActionAuditSummaryV2({
    ranAt,
    coverage,
    findingsCount,
    checkedDomains,
  })

  return patchWriteActionReceiptV2({
    receiptId,
    patch: {
      lastAuditAt: summary.ranAt,
      lastAuditSummary: summary,
    },
  })
}

export async function closeWriteActionReceiptV2({
  receiptId = '',
} = {}) {
  const receipt = await readWriteActionReceiptV2({
    receiptId,
  })

  if (!receipt) throw new Error('WriteAction V2 receipt not found')

  if (receipt.status !== WRITE_ACTION_V2_STATUS.OPEN) {
    throw new Error('Only an open WriteAction V2 receipt can be closed')
  }

  if (!receipt.lastAuditSummary) {
    throw new Error('WriteAction V2 receipt cannot close before Audit')
  }

  if (receipt.lastAuditSummary.coverage !== 'complete') {
    throw new Error(
      'WriteAction V2 receipt cannot close before a complete Audit'
    )
  }

  if (Number(receipt.lastAuditSummary.findingsCount) > 0) {
    throw new Error(
      'WriteAction V2 receipt cannot close while Audit findings remain'
    )
  }

  return patchWriteActionReceiptV2({
    receiptId,
    patch: {
      status: assertWriteActionStatusV2(WRITE_ACTION_V2_STATUS.CLOSED),
    },
  })
}


export async function reopenWriteActionReceiptV2({
  receiptId = '',
} = {}) {
  const receipt = await readWriteActionReceiptV2({ receiptId })

  if (!receipt) throw new Error('WriteAction V2 receipt not found')

  if (receipt.status !== WRITE_ACTION_V2_STATUS.CLOSED) {
    throw new Error('Only a closed WriteAction V2 receipt can be reopened')
  }

  return patchWriteActionReceiptV2({
    receiptId,
    patch: {
      status: assertWriteActionStatusV2(WRITE_ACTION_V2_STATUS.OPEN),
    },
  })
}



export async function persistWriteActionAuditResultV2({
  receiptId = '',
  audit = {},
  ranAt = null,
} = {}) {
  const receipt = await readWriteActionReceiptV2({ receiptId })
  if (!receipt) throw new Error('WriteAction V2 receipt not found')

  const findingsCount = Array.isArray(audit?.findings)
    ? audit.findings.length
    : 0
  const auditComplete = audit?.coverage?.complete === true
  const auditClean = auditComplete && findingsCount === 0

  await saveWriteActionAuditSummaryV2({
    receiptId,
    ranAt: ranAt || new Date().toISOString(),
    coverage: auditComplete ? 'complete' : 'partial',
    findingsCount,
    checkedDomains: audit?.coverage?.coveredTargets || [],
  })

  if (receipt.status === WRITE_ACTION_V2_STATUS.OPEN && auditClean) {
    await closeWriteActionReceiptV2({ receiptId })
    return WRITE_ACTION_V2_STATUS.CLOSED
  }

  if (receipt.status === WRITE_ACTION_V2_STATUS.CLOSED && !auditClean) {
    await reopenWriteActionReceiptV2({ receiptId })
    return WRITE_ACTION_V2_STATUS.OPEN
  }

  return receipt.status
}

export async function getWriteActionReceiptV2({
  receiptId = '',
} = {}) {
  return readWriteActionReceiptV2({
    receiptId,
  })
}

export async function listWriteActionReceiptsV2({ maxResults = 5 } = {}) {
  return listRecentWriteActionReceiptsV2({ maxResults })
}
