// src/features/playersDatabase/services/audit/system/checks.js

import { SYSTEM_AUDIT_TARGET, SYSTEM_AUDIT_TARGETS } from './contract.js'

export const SYSTEM_AUDIT_CHECK = Object.freeze({
  UNUSED_DOCUMENTS: 'unusedDocuments',
  MISSING_DOCUMENTS: 'missingDocuments',
  DOCUMENT_REFERENCES: 'documentReferences',
  PROJECTION_SYNC: 'projectionSync',
  DOCUMENT_IDS: 'documentIds',
})

export const SYSTEM_AUDIT_CHECKS = Object.freeze(
  Object.values(SYSTEM_AUDIT_CHECK)
)

const TARGETS_BY_CHECK = Object.freeze({
  [SYSTEM_AUDIT_CHECK.UNUSED_DOCUMENTS]: [
    SYSTEM_AUDIT_TARGET.TEAM_SEASONS,
    SYSTEM_AUDIT_TARGET.PLAYER_SEASONS,
    SYSTEM_AUDIT_TARGET.PLAYER_SEARCH_INDEXES,
    SYSTEM_AUDIT_TARGET.LEAGUES,
    SYSTEM_AUDIT_TARGET.CLUB_PROFILES,
    SYSTEM_AUDIT_TARGET.LEAGUES_CENTER,
    SYSTEM_AUDIT_TARGET.CLUBS_CENTER,
    SYSTEM_AUDIT_TARGET.CLUBS_DIRECTORY,
  ],
  [SYSTEM_AUDIT_CHECK.MISSING_DOCUMENTS]: [
    SYSTEM_AUDIT_TARGET.TEAM_SEASONS,
    SYSTEM_AUDIT_TARGET.PLAYER_ROOTS,
    SYSTEM_AUDIT_TARGET.PLAYER_SEASONS,
    SYSTEM_AUDIT_TARGET.PLAYER_SEARCH_INDEXES,
    SYSTEM_AUDIT_TARGET.LEAGUES,
    SYSTEM_AUDIT_TARGET.CLUB_PROFILES,
    SYSTEM_AUDIT_TARGET.LEAGUES_CENTER,
    SYSTEM_AUDIT_TARGET.CLUBS_CENTER,
    SYSTEM_AUDIT_TARGET.CLUBS_DIRECTORY,
  ],
  [SYSTEM_AUDIT_CHECK.DOCUMENT_REFERENCES]: [
    SYSTEM_AUDIT_TARGET.TEAM_ROOTS,
    SYSTEM_AUDIT_TARGET.TEAM_SEASONS,
    SYSTEM_AUDIT_TARGET.PLAYER_ROOTS,
    SYSTEM_AUDIT_TARGET.PLAYER_SEASONS,
    SYSTEM_AUDIT_TARGET.PLAYER_SEARCH_INDEXES,
    SYSTEM_AUDIT_TARGET.LEAGUES,
    SYSTEM_AUDIT_TARGET.CLUB_PROFILES,
  ],
  [SYSTEM_AUDIT_CHECK.PROJECTION_SYNC]: [
    SYSTEM_AUDIT_TARGET.TEAM_SEASONS,
    SYSTEM_AUDIT_TARGET.PLAYER_SEASONS,
    SYSTEM_AUDIT_TARGET.PLAYER_SEARCH_INDEXES,
    SYSTEM_AUDIT_TARGET.LEAGUES,
    SYSTEM_AUDIT_TARGET.CLUB_PROFILES,
    SYSTEM_AUDIT_TARGET.LEAGUES_CENTER,
    SYSTEM_AUDIT_TARGET.CLUBS_CENTER,
    SYSTEM_AUDIT_TARGET.CLUBS_DIRECTORY,
  ],
  [SYSTEM_AUDIT_CHECK.DOCUMENT_IDS]: SYSTEM_AUDIT_TARGETS,
})

const PROJECTION_TARGETS = new Set([
  SYSTEM_AUDIT_TARGET.PLAYER_SEARCH_INDEXES,
  SYSTEM_AUDIT_TARGET.LEAGUES_CENTER,
  SYSTEM_AUDIT_TARGET.CLUBS_CENTER,
  SYSTEM_AUDIT_TARGET.CLUBS_DIRECTORY,
])

export const buildSystemAuditPlan = checks => {
  const selectedChecks = SYSTEM_AUDIT_CHECKS.filter(check => checks.includes(check))
  const targets = new Set()

  selectedChecks.forEach(check => {
    TARGETS_BY_CHECK[check].forEach(target => targets.add(target))
  })

  return {
    checks: selectedChecks,
    targets: SYSTEM_AUDIT_TARGETS.filter(target => targets.has(target)),
  }
}

export const resolveSystemAuditFindingCheck = finding => {
  const type = String(finding && finding.type ? finding.type : '')
  const target = String(finding && finding.target ? finding.target : '')
  const title = String(finding && finding.title ? finding.title : '')

  if (type === 'orphan_projection' || type === 'unexpected_projection') {
    return SYSTEM_AUDIT_CHECK.UNUSED_DOCUMENTS
  }
  if (type === 'missing_projection' || type === 'missing_canonical') {
    return SYSTEM_AUDIT_CHECK.MISSING_DOCUMENTS
  }
  if (type === 'projection_mismatch') return SYSTEM_AUDIT_CHECK.PROJECTION_SYNC
  if (type === 'invalid_canonical_state' || title.includes('Movement')) return ''
  if (type === 'invalid_identity') return SYSTEM_AUDIT_CHECK.DOCUMENT_IDS
  if (type === 'broken_relation' && PROJECTION_TARGETS.has(target)) {
    return SYSTEM_AUDIT_CHECK.PROJECTION_SYNC
  }
  if (type === 'broken_relation') return SYSTEM_AUDIT_CHECK.DOCUMENT_REFERENCES
  return ''
}

export const filterSystemAuditFindings = ({ findings, checks }) => {
  const selected = new Set(checks)
  return findings.filter(finding => selected.has(resolveSystemAuditFindingCheck(finding)))
}
