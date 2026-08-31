export const AUDIT_FINDING_TYPE = Object.freeze({
  MISSING_DOCUMENT: 'missing_document',
  SOURCE_MISMATCH: 'source_mismatch',
  BROKEN_RELATION: 'broken_relation',
  UNEXPECTED_DOCUMENT: 'unexpected_document',
})

const clean = value => String(value ?? '').trim()

export const buildAuditFinding = ({
  type,
  entityType = '',
  documentId = '',
  relatedDocumentId = '',
  teamDocumentId = '',
  playerDocumentId = '',
  seasonKey = '',
  title = '',
  explanation = '',
  source = '',
  expected = null,
  actual = null,
  lifecycleStatus = '',
  severity = 'medium',
} = {}) => ({
  type,
  entityType: clean(entityType),
  documentId: clean(documentId),
  relatedDocumentId: clean(relatedDocumentId),
  teamDocumentId: clean(teamDocumentId),
  playerDocumentId: clean(playerDocumentId),
  seasonKey: clean(seasonKey),
  title: clean(title),
  explanation: clean(explanation),
  source: clean(source),
  expected,
  actual,
  lifecycleStatus: clean(lifecycleStatus),
  severity: clean(severity) || 'medium',
})

export const buildAuditResult = ({ scope, generatedAt, readsUsed = 0, checked = 0, findings = [], lifecycle = [], coverage = {} } = {}) => {
  const summary = Object.values(AUDIT_FINDING_TYPE).reduce((result, type) => ({
    ...result,
    [type]: findings.filter(finding => finding.type === type).length,
  }), { checked: Number(checked) || 0, reads: Number(readsUsed) || 0 })

  return { generatedAt: generatedAt || new Date().toISOString(), scope, readsUsed: Number(readsUsed) || 0, checked: Number(checked) || 0, summary, lifecycle, coverage, findings, issues: findings, issuesCount: findings.length }
}
