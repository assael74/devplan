// src/features/playersDatabase/services/audit/audit.contract.js

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

export const AUDIT_ISSUE_CONTRACT_VERSION = 1

export const AUDIT_ISSUE_CATEGORY = Object.freeze({
  STRUCTURE: 'structure',
  IDENTITY: 'identity',
  COMPUTED_STATE: 'computedState',
  RELATION: 'relation',
  OTHER: 'other',
})

export const AUDIT_REPAIR_STATUS = Object.freeze({
  AUTOMATIC: 'automatic',
  REVIEW: 'review',
  REPORT: 'report',
})

const resolveCategory = ({ issue, scope } = {}) => {
  const type = clean(issue?.type)
  const scopeType = clean(scope?.type)

  if (scopeType === 'relations' || clean(issue?.relationId)) {
    return AUDIT_ISSUE_CATEGORY.RELATION
  }

  if (type.startsWith('schema_') || type.includes('_schema_')) {
    return AUDIT_ISSUE_CATEGORY.STRUCTURE
  }

  if (
    type.includes('identity') ||
    type === 'document_id_mismatch' ||
    type === 'entity_type_mismatch'
  ) {
    return AUDIT_ISSUE_CATEGORY.IDENTITY
  }

  if (
    type.includes('scout_state') ||
    type.includes('reliability') ||
    type.includes('tracking') ||
    type.includes('measurement') ||
    type.includes('season_status') ||
    type.includes('projection_mismatch') ||
    type.includes('context_outdated') ||
    type.includes('state_outdated') ||
    type.includes('mismatch') ||
    type.includes('outdated')
  ) {
    return AUDIT_ISSUE_CATEGORY.COMPUTED_STATE
  }

  return AUDIT_ISSUE_CATEGORY.OTHER
}

const resolveRepairStatus = issue => {
  if (issue?.repair?.status) return clean(issue.repair.status)
  if (issue?.repairable === true) return AUDIT_REPAIR_STATUS.AUTOMATIC
  if (issue?.repairable === false) return AUDIT_REPAIR_STATUS.REPORT
  return AUDIT_REPAIR_STATUS.REVIEW
}

export const normalizeAuditIssueV1 = ({
  issue,
  scope,
  collectionName = '',
  relationId = '',
  index = 0,
} = {}) => {
  const source = issue && typeof issue === 'object' ? issue : {}
  const documentIds = Array.isArray(source.documentIds)
    ? source.documentIds.map(clean).filter(Boolean)
    : []
  const documentId = clean(source.documentId) || documentIds[0] || ''
  const type = clean(source.type) || 'audit_issue'

  return {
    issueId: clean(source.issueId) || [
      clean(scope?.type) || 'audit',
      clean(relationId) || clean(scope?.collectionScope),
      type,
      documentId,
      clean(source.seasonKey),
      index,
    ].filter(value => value !== '').join('::'),
    contractVersion: AUDIT_ISSUE_CONTRACT_VERSION,
    scope: scope || null,
    category: resolveCategory({ issue: source, scope }),
    type,
    collection: clean(source.collectionName) || clean(collectionName),
    collections: Array.isArray(source.collectionNames)
      ? source.collectionNames.map(clean).filter(Boolean)
      : [],
    documentId,
    documentIds,
    playerDocumentId: clean(source.playerDocumentId),
    teamDocumentId: clean(
      source.teamDocumentId ||
      source.birthTeamDocumentId
    ),
    searchIndexDocumentId: clean(
      source.searchIndexDocumentId ||
      source.searchDocumentId
    ),
    seasonKey: clean(source.seasonKey),
    title: clean(source.title) || clean(source.message) || 'נמצא פער בנתונים',
    explanation: clean(source.detail) || clean(source.message),
    expected: source.expected ?? null,
    actual: source.actual ?? null,
    fields: source.fields ?? source.mismatchedFields ?? [],
    severity: clean(source.severity) || 'medium',
    repair: {
      status: resolveRepairStatus(source),
      action: clean(source?.repair?.action),
    },
    sourceIssue: source,
  }
}

export const buildAuditResultV1 = ({
  scope,
  generatedAt,
  readsUsed = 0,
  checked = 0,
  exact = 0,
  affected = 0,
  issues = [],
  source = '',
  details = null,
} = {}) => ({
  contractVersion: AUDIT_ISSUE_CONTRACT_VERSION,
  generatedAt: generatedAt || new Date().toISOString(),
  scope,
  source,
  readsUsed: Number(readsUsed || 0),
  checked: Number(checked || 0),
  exact: Number(exact || 0),
  affected: Number(affected || 0),
  issuesCount: issues.length,
  issues,
  details,
})
