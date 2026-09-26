export const ROSTER_AUDIT_V2_RESULT = Object.freeze({
  CLEAN: 'clean',
  FINDINGS: 'findings',
  PARTIAL: 'partial',
})

export const ROSTER_AUDIT_V2_TARGET = Object.freeze({
  PLAYER_SEARCH_INDEXES: 'playerSearchIndexes',
  TEAM_SEARCH_INDEX: 'teamSearchIndex',
  LEAGUE_ROSTER_METADATA: 'leagueRosterMetadata',
  COUNTERPARTS: 'counterparts',
  LEAGUES_MASTER: 'leaguesMaster',
  CLUBS: 'clubs',
  CLUBS_MASTER: 'clubsMaster',
})

export const ROSTER_AUDIT_V2_COVERED_TARGETS = Object.freeze([
  ROSTER_AUDIT_V2_TARGET.PLAYER_SEARCH_INDEXES,
  ROSTER_AUDIT_V2_TARGET.TEAM_SEARCH_INDEX,
  ROSTER_AUDIT_V2_TARGET.LEAGUE_ROSTER_METADATA,
  ROSTER_AUDIT_V2_TARGET.COUNTERPARTS,
  ROSTER_AUDIT_V2_TARGET.LEAGUES_MASTER,
  ROSTER_AUDIT_V2_TARGET.CLUBS,
  ROSTER_AUDIT_V2_TARGET.CLUBS_MASTER,
])

export const ROSTER_AUDIT_V2_UNCOVERED_TARGETS = Object.freeze([])

export const ROSTER_TEAM_INDEX_OWNED_FIELDS = Object.freeze([
  'teamSeasonDocumentId',
  'playersCount',
  'playerSeasonIndexCount',
  'sourceTarget',
])
