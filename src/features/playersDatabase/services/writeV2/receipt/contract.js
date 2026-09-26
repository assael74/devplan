// src/features/playersDatabase/services/writeV2/receipt/contract.js

export const WRITE_ACTION_V2_FLOW_TYPE = Object.freeze({
  LEAGUE: 'league',
  ROSTER: 'roster',
  STATS: 'stats',
})

export const WRITE_ACTION_V2_CANONICAL_STATUS = Object.freeze({
  PENDING: 'pending',
  REPORTED: 'reported',
  FAILED_OR_UNKNOWN: 'failed_or_unknown',
})

export const WRITE_ACTION_V2_STATUS = Object.freeze({
  OPEN: 'open',
  CLOSED: 'closed',
})

export const WRITE_ACTION_V2_AUDIT_COVERAGE = Object.freeze({
  PARTIAL: 'partial',
  COMPLETE: 'complete',
})

const FLOW_TYPES = new Set(Object.values(WRITE_ACTION_V2_FLOW_TYPE))
const CANONICAL_STATUSES = new Set(Object.values(WRITE_ACTION_V2_CANONICAL_STATUS))
const RECEIPT_STATUSES = new Set(Object.values(WRITE_ACTION_V2_STATUS))
const AUDIT_COVERAGE = new Set(Object.values(WRITE_ACTION_V2_AUDIT_COVERAGE))

function cleanText(value) {
  return String(value || '').trim()
}

export function buildWriteActionAuditTargetV2({
  flowType = '',
  auditTarget = {},
} = {}) {
  if (
    !auditTarget
    || typeof auditTarget !== 'object'
    || Array.isArray(auditTarget)
  ) {
    throw new Error('WriteAction V2 auditTarget must be an object')
  }

  if (flowType === WRITE_ACTION_V2_FLOW_TYPE.LEAGUE) {
    const leagueId = cleanText(auditTarget.leagueId)
    const seasonKey = cleanText(auditTarget.seasonKey)

    if (!leagueId) throw new Error('Missing leagueId for League receipt')
    if (!seasonKey) throw new Error('Missing seasonKey for League receipt')

    return {
      leagueId,
      seasonKey,
    }
  }

  if (
    flowType === WRITE_ACTION_V2_FLOW_TYPE.ROSTER
    || flowType === WRITE_ACTION_V2_FLOW_TYPE.STATS
  ) {
    const birthTeamDocumentId = cleanText(auditTarget.birthTeamDocumentId)
    const seasonKey = cleanText(auditTarget.seasonKey)

    if (!birthTeamDocumentId) {
      throw new Error(`Missing birthTeamDocumentId for ${flowType} receipt`)
    }
    if (!seasonKey) throw new Error(`Missing seasonKey for ${flowType} receipt`)

    return {
      birthTeamDocumentId,
      seasonKey,
    }
  }

  throw new Error(`Unsupported WriteAction V2 flowType: ${flowType}`)
}

export function assertWriteActionFlowTypeV2(flowType = '') {
  if (!FLOW_TYPES.has(flowType)) {
    throw new Error(`Unsupported WriteAction V2 flowType: ${flowType}`)
  }

  return flowType
}

export function assertWriteActionCanonicalStatusV2(status = '') {
  if (!CANONICAL_STATUSES.has(status)) {
    throw new Error(`Unsupported WriteAction V2 canonicalStatus: ${status}`)
  }

  return status
}

export function assertWriteActionStatusV2(status = '') {
  if (!RECEIPT_STATUSES.has(status)) {
    throw new Error(`Unsupported WriteAction V2 status: ${status}`)
  }

  return status
}

export function buildWriteActionAuditSummaryV2({
  ranAt = null,
  coverage = '',
  findingsCount = 0,
  checkedDomains = [],
} = {}) {
  if (!AUDIT_COVERAGE.has(coverage)) {
    throw new Error(`Unsupported WriteAction V2 Audit coverage: ${coverage}`)
  }

  const resolvedFindingsCount = Number(findingsCount)

  if (!Number.isInteger(resolvedFindingsCount) || resolvedFindingsCount < 0) {
    throw new Error('WriteAction V2 findingsCount must be a non-negative integer')
  }

  return {
    ranAt,
    coverage,
    findingsCount: resolvedFindingsCount,
    checkedDomains: [...new Set(
      (Array.isArray(checkedDomains) ? checkedDomains : [])
        .map(cleanText)
        .filter(Boolean)
    )],
  }
}
