// src/features/playersDatabase/services/auditV2/system/orphans/contract.js

export const ORPHAN_AUDIT_V2_RESULT = Object.freeze({
  CLEAN: 'clean',
  FINDINGS: 'findings',
})

export const ORPHAN_AUDIT_V2_TARGET = Object.freeze({
  TEAM_SEARCH_INDEXES: 'teamSearchIndexes',
  PLAYER_SEARCH_INDEXES: 'playerSearchIndexes',
  CLUBS_MASTER: 'clubsMaster',
})

export const ORPHAN_AUDIT_V2_TARGETS = Object.freeze(
  Object.values(ORPHAN_AUDIT_V2_TARGET)
)

export const buildOrphanAuditFindingV2 = ({
  type = 'orphan_document',
  target,
  documentId = '',
  relatedDocumentId = '',
  teamId = '',
  playerId = '',
  clubId = '',
  seasonKey = '',
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
  playerId,
  clubId,
  seasonKey,
  title,
  reason,
  expected,
  actual,
})
