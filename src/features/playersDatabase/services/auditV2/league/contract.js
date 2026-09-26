export const LEAGUE_AUDIT_V2_RESULT = Object.freeze({
  CLEAN: 'clean',
  FINDINGS: 'findings',
  PARTIAL: 'partial',
})

export const LEAGUE_AUDIT_V2_TARGET = Object.freeze({
  TEAMS: 'teams',
  TEAM_SEASONS: 'teamSeasons',
  TEAM_SEARCH_INDEXES: 'teamSearchIndexes',
  IDENTITY: 'identity',
  CLUBS: 'clubs',
  LEAGUES_MASTER: 'leaguesMaster',
  CLUBS_MASTER: 'clubsMaster',
})

export const LEAGUE_AUDIT_V2_ALL_TARGETS = Object.freeze(
  Object.values(LEAGUE_AUDIT_V2_TARGET)
)

export const LEAGUE_SEARCH_INDEX_TEAM_OWNED_FIELDS = Object.freeze([
  'playersCount',
  'scoutProfilesSummary',
  'teamSeasonDocumentId',
  'teamUrl',
])

export const LEAGUE_SEARCH_INDEX_IGNORED_FIELDS = Object.freeze([
  'updatedAt',
  'lastWriteAction',
  'lastWriteAt',
])

