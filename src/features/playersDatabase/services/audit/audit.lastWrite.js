import { AUDIT_SCOPE_TYPE, buildAuditTeamSeasonScope, buildAuditTeamSeasonsScope, normalizeAuditScope } from './audit.scope.js'
const clean = value => String(value ?? '').trim()
export const buildLastWriteAuditScope = result => {
  const scopes = new Map()
  const visit = value => { if (!value || typeof value !== 'object') return; if (Array.isArray(value)) return value.forEach(visit); const teamDocumentId = clean(value.teamDocumentId || value.birthTeamDocumentId); const seasonKey = clean(value.seasonKey || value.seasonId); if (teamDocumentId && seasonKey) scopes.set(`${teamDocumentId}::${seasonKey}`, buildAuditTeamSeasonScope({ teamDocumentId, seasonKey })); Object.values(value).forEach(visit) }
  visit(result); const rows = [...scopes.values()]; return rows.length === 1 ? rows[0] : rows.length ? buildAuditTeamSeasonsScope(rows) : null
}
const STORAGE_KEY = 'playersDatabase:lastWriteAuditScope:v2'
const storage = () => typeof window !== 'undefined' ? window.sessionStorage : null
export const getLastWriteAuditScope = () => {
  try { const raw = storage()?.getItem(STORAGE_KEY); return raw ? normalizeAuditScope(JSON.parse(raw)) : null } catch { return null }
}
export const rememberLastWriteAuditScope = scope => {
  try { storage()?.setItem(STORAGE_KEY, JSON.stringify(normalizeAuditScope(scope))); return true } catch { return false }
}
export const rememberLastWriteAuditScopeFromResult = result => {
  const scope = buildLastWriteAuditScope(result)
  if (scope) rememberLastWriteAuditScope(scope)
  return scope
}
export const clearLastWriteAuditScope = () => {
  try { storage()?.removeItem(STORAGE_KEY); return true } catch { return false }
}
