import { AUDIT_FINDING_TYPE, AUDIT_REPAIR_TYPE, buildAuditFinding } from '../audit.contract.js'
import { AUDIT_SCOPE_TYPE, AUDIT_DOMAIN } from '../audit.scope.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const scopesOf = auditScope => {
  if (!auditScope || typeof auditScope !== 'object') return []
  if (auditScope.type === AUDIT_SCOPE_TYPE.TEAM_SEASON) return [auditScope]
  if (auditScope.type === AUDIT_SCOPE_TYPE.TEAM_SEASONS) return Array.isArray(auditScope.scopes) ? auditScope.scopes : []
  return []
}

const isInAuditScope = ({ auditScope, normalizedScope }) => {
  if (normalizedScope.type === AUDIT_SCOPE_TYPE.FULL_SYSTEM) return true
  const wanted = scopesOf(normalizedScope)
  return scopesOf(auditScope).some(scope => wanted.some(candidate => (
    clean(scope?.teamDocumentId) === clean(candidate?.teamDocumentId) &&
    clean(scope?.seasonKey) === clean(candidate?.seasonKey)
  )))
}

export function appendWriteRecoveryAuditFindings({
  writeActions = [],
  normalizedScope,
  findings,
} = {}) {
  ;(Array.isArray(writeActions) ? writeActions : []).forEach(({ id, data }) => {
    if (!data?.recoveryRequired || !isInAuditScope({ auditScope: data?.auditScope, normalizedScope })) return

    const scopes = scopesOf(data.auditScope)
    // A partial write with no Team/Season identity is retained in the journal
    // for diagnosis, but cannot receive an automatic projection repair.
    scopes.forEach(scope => {
      const teamDocumentId = clean(scope?.teamDocumentId)
      const seasonKey = clean(scope?.seasonKey)
      if (!teamDocumentId || !seasonKey) return
      const isClubProjectionFailure = clean(data?.failedStage) === 'clubProjection'
      findings.push(buildAuditFinding({
        type: AUDIT_FINDING_TYPE.PARTIAL_WRITE,
        entityType: 'writeAction',
        documentId: id,
        relatedDocumentId: clean(data?.actionType),
        teamDocumentId,
        seasonKey,
        auditDomain: AUDIT_DOMAIN.WRITE_RECOVERY,
        relationKey: `${id}::${teamDocumentId}::${seasonKey}`,
        title: isClubProjectionFailure
          ? 'טעינת סגל נשמרה, אך סנכרון המועדון נכשל'
          : 'פעולת כתיבה נשמרה חלקית ודורשת התאוששות',
        explanation: isClubProjectionFailure
          ? 'הסגל והאינדקסים הקנוניים נשמרו. יש לסנכרן מחדש את הקרנת המועדון מנתוני הליגה; אין צורך למחוק את הסגל.'
          : 'הנתונים הקנוניים נשמרו לפני שכשל שלב המשך. יש להריץ את פעולת ההתאוששות המתאימה לפני טעינה נוספת.',
        source: 'Write flow recovery journal',
        repairType: isClubProjectionFailure ? AUDIT_REPAIR_TYPE.REBUILD_CLUB_PROJECTION : '',
        actual: {
          actionType: clean(data?.actionType),
          failedStage: clean(data?.failedStage),
          errorMessage: clean(data?.errorMessage),
        },
        severity: 'high',
      }))
    })
  })
}
