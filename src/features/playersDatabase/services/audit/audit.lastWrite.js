// src/features/playersDatabase/services/audit/audit.lastWrite.js

import {
  AUDIT_SCOPE_TYPE,
  buildAuditTeamSeasonScope,
  buildAuditTeamSeasonsScope,
  normalizeAuditScope,
} from './audit.scope.js'

const STORAGE_KEY = 'playersDatabase:lastWriteAuditScope:v1'
const MAX_SCOPE_ROWS = 100

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const isBrowserStorageAvailable = () => (
  typeof window !== 'undefined' &&
  window.sessionStorage &&
  typeof window.sessionStorage.getItem === 'function'
)

const collectTeamSeasonScopes = (value, result, depth = 0) => {
  if (!value || depth > 6 || result.size >= MAX_SCOPE_ROWS) return

  if (Array.isArray(value)) {
    value.forEach(item => collectTeamSeasonScopes(item, result, depth + 1))
    return
  }

  if (typeof value !== 'object') return

  const teamDocumentId = clean(
    value.teamDocumentId ||
    value.birthTeamDocumentId
  )
  const seasonKey = clean(
    value.seasonKey ||
    value.seasonId
  )

  if (teamDocumentId && seasonKey) {
    result.set(
      `${teamDocumentId}::${seasonKey}`,
      buildAuditTeamSeasonScope({
        teamDocumentId,
        seasonKey,
      })
    )
  }

  Object.entries(value).forEach(([key, child]) => {
    if (
      key === 'players' ||
      key === 'teamPlayers' ||
      key === 'scoutedPlayers' ||
      key === 'documents'
    ) {
      return
    }

    collectTeamSeasonScopes(child, result, depth + 1)
  })
}

export const buildLastWriteAuditScope = result => {
  const scopes = new Map()
  collectTeamSeasonScopes(result, scopes)
  const rows = [...scopes.values()]

  if (!rows.length) return null
  if (rows.length === 1) return rows[0]

  return buildAuditTeamSeasonsScope(rows)
}

export const rememberLastWriteAuditScope = scope => {
  if (!scope || !isBrowserStorageAvailable()) return false

  try {
    const normalized = normalizeAuditScope(scope)
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(normalized)
    )
    return true
  } catch (error) {
    console.warn('[playersDatabase] Failed to remember last audit scope:', error)
    return false
  }
}


export const clearLastWriteAuditScope = () => {
  if (!isBrowserStorageAvailable()) return false

  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.warn('[playersDatabase] Failed to clear last audit scope:', error)
    return false
  }
}

export const rememberLastWriteAuditScopeFromResult = result => {
  const scope = buildLastWriteAuditScope(result)
  if (!scope) {
    clearLastWriteAuditScope()
    return null
  }

  rememberLastWriteAuditScope(scope)
  return scope
}

export const getLastWriteAuditScope = () => {
  if (!isBrowserStorageAvailable()) return null

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    const normalized = normalizeAuditScope(parsed)

    if (
      normalized.type !== AUDIT_SCOPE_TYPE.TEAM_SEASON &&
      normalized.type !== AUDIT_SCOPE_TYPE.TEAM_SEASONS
    ) {
      return null
    }

    return normalized
  } catch (error) {
    console.warn('[playersDatabase] Failed to read last audit scope:', error)
    return null
  }
}
