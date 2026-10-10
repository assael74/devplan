// src/features/playersDatabase/services/audit/system/contract.js

export const SYSTEM_AUDIT_RESULT = Object.freeze({
  CLEAN: 'CLEAN',
  FINDINGS: 'FINDINGS',
})

export const SYSTEM_AUDIT_TARGET = Object.freeze({
  TEAM_ROOTS: 'teamRoots',
  TEAM_SEASONS: 'teamSeasons',
  PLAYER_ROOTS: 'playerRoots',
  PLAYER_SEASONS: 'playerSeasons',
  PLAYER_SEARCH_INDEXES: 'playerSearchIndexes',
  LEAGUES: 'leagues',
  CLUB_PROFILES: 'clubProfiles',
  LEAGUES_CENTER: 'leaguesCenter',
  CLUBS_CENTER: 'clubsCenter',
  CLUBS_DIRECTORY: 'clubsDirectory',
})

export const SYSTEM_AUDIT_TARGETS = Object.freeze(
  Object.values(SYSTEM_AUDIT_TARGET)
)

export const buildSystemAuditFinding = ({
  type,
  target,
  documentId = '',
  relatedDocumentId = '',
  playerId = '',
  teamId = '',
  leagueId = '',
  clubId = '',
  seasonId = '',
  title,
  reason,
  expected = null,
  actual = null,
  owner = '',
  recommendedAction = '',
}) => ({
  type,
  target,
  documentId,
  relatedDocumentId,
  playerId,
  teamId,
  leagueId,
  clubId,
  seasonId,
  title,
  reason,
  expected,
  actual,
  owner,
  recommendedAction,
})
