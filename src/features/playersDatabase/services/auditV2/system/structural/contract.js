// src/features/playersDatabase/services/auditV2/system/structural/contract.js

export const STRUCTURAL_AUDIT_V2_RESULT = Object.freeze({
  CLEAN: 'clean',
  FINDINGS: 'findings',
})

export const STRUCTURAL_AUDIT_V2_TARGET = Object.freeze({
  LEAGUES: 'leagues',
  TEAM_ROOTS: 'teamRoots',
  TEAM_SEASONS: 'teamSeasons',
  CLUBS: 'clubs',
  MOVEMENT: 'movement',
})

export const STRUCTURAL_AUDIT_V2_TARGETS = Object.freeze(
  Object.values(STRUCTURAL_AUDIT_V2_TARGET)
)

export const buildStructuralAuditFindingV2 = ({
  type,
  target,
  documentId = '',
  relatedDocumentId = '',
  teamId = '',
  leagueId = '',
  clubId = '',
  seasonKey = '',
  playerId = '',
  relationKey = '',
  title,
  reason,
  expected = null,
  actual = null,
}) => ({
  type,
  target,
  documentId,
  relatedDocumentId,
  teamId,
  leagueId,
  clubId,
  seasonKey,
  playerId,
  relationKey,
  title,
  reason,
  expected,
  actual,
})
