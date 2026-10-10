// src/features/playersDatabase/ui/pages/DataOpsPage/logic/systemAuditSnapshot.logic.js

const SYSTEM_AUDIT_SNAPSHOT_KEY = 'devplan.playersDatabase.dataOps.lastSystemAudit'

const object = value => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
)

export const buildSystemAuditSnapshot = ({ result, completedAt = new Date() } = {}) => {
  const audit = object(result)
  const findings = Array.isArray(audit.findings) ? audit.findings : []

  return {
    completedAt: completedAt instanceof Date
      ? completedAt.toISOString()
      : String(completedAt || ''),
    result: String(audit.result || audit.status || ''),
    selectedChecks: Array.isArray(audit.selectedChecks) ? audit.selectedChecks : [],
    findingsCount: Number(
      object(audit.summary).findingsCount !== undefined
        ? object(audit.summary).findingsCount
        : findings.length
    ) || 0,
    findings,
    coverage: object(audit.coverage),
    summary: object(audit.summary),
  }
}

export const restoreSystemAuditResult = snapshot => {
  const saved = object(snapshot)
  if (!Array.isArray(saved.findings)) return null

  return {
    result: String(saved.result || ''),
    selectedChecks: Array.isArray(saved.selectedChecks) ? saved.selectedChecks : [],
    findings: saved.findings,
    coverage: object(saved.coverage),
    summary: object(saved.summary),
  }
}

export const readSystemAuditSnapshot = storage => {
  if (!storage || typeof storage.getItem !== 'function') return null
  try {
    const value = JSON.parse(storage.getItem(SYSTEM_AUDIT_SNAPSHOT_KEY) || 'null')
    return value && typeof value === 'object' ? value : null
  } catch {
    return null
  }
}

export const writeSystemAuditSnapshot = ({ storage, result, completedAt } = {}) => {
  if (!storage || typeof storage.setItem !== 'function') return null
  const snapshot = buildSystemAuditSnapshot({ result, completedAt })
  storage.setItem(SYSTEM_AUDIT_SNAPSHOT_KEY, JSON.stringify(snapshot))
  return snapshot
}
