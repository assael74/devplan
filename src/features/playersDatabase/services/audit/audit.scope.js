// src/features/playersDatabase/services/audit/audit.scope.js

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

export const AUDIT_SCOPE_TYPE = Object.freeze({
  COLLECTION: 'collection',
  TEAM_SEASON: 'teamSeason',
  TEAM_SEASONS: 'teamSeasons',
  RELATIONS: 'relations',
  FULL_SYSTEM: 'fullSystem',
})

export const AUDIT_COLLECTION_SCOPE = Object.freeze({
  LEAGUES: 'leagues',
  TEAMS: 'teams',
  PLAYERS: 'players',
  TEAM_INDEXES: 'teamIndexes',
  PLAYER_INDEXES: 'playerIndexes',
})


export const AUDIT_RELATION_SCOPE = Object.freeze({
  LEAGUE_TEAMS: 'leagueTeams',
  LEAGUE_TEAM_INDEXES: 'leagueTeamIndexes',
  TEAMS_TEAM_INDEXES: 'teamsTeamIndexes',
  TEAMS_PLAYERS: 'teamsPlayers',
  TEAMS_PLAYER_INDEXES: 'teamsPlayerIndexes',
  PLAYERS_PLAYER_INDEXES: 'playersPlayerIndexes',
})

export const AUDIT_RELATION_LABELS = Object.freeze({
  [AUDIT_RELATION_SCOPE.LEAGUE_TEAMS]: 'ליגות מול קבוצות',
  [AUDIT_RELATION_SCOPE.LEAGUE_TEAM_INDEXES]: 'ליגות מול אינדקסי קבוצות',
  [AUDIT_RELATION_SCOPE.TEAMS_TEAM_INDEXES]: 'קבוצות מול אינדקסי קבוצות',
  [AUDIT_RELATION_SCOPE.TEAMS_PLAYERS]: 'קבוצות מול מסמכי שחקנים',
  [AUDIT_RELATION_SCOPE.TEAMS_PLAYER_INDEXES]: 'קבוצות מול אינדקסי שחקנים',
  [AUDIT_RELATION_SCOPE.PLAYERS_PLAYER_INDEXES]: 'מסמכי שחקנים מול אינדקסי שחקנים',
})

export const AUDIT_SCOPE_LABELS = Object.freeze({
  [AUDIT_COLLECTION_SCOPE.LEAGUES]: 'מסמכי ליגה',
  [AUDIT_COLLECTION_SCOPE.TEAMS]: 'מסמכי קבוצות',
  [AUDIT_COLLECTION_SCOPE.PLAYERS]: 'מסמכי שחקנים',
  [AUDIT_COLLECTION_SCOPE.TEAM_INDEXES]: 'אינדקסי קבוצות',
  [AUDIT_COLLECTION_SCOPE.PLAYER_INDEXES]: 'אינדקסי שחקנים',
  [AUDIT_SCOPE_TYPE.TEAM_SEASON]: 'קבוצה ועונה',
  [AUDIT_SCOPE_TYPE.TEAM_SEASONS]: 'העדכון האחרון',
  [AUDIT_SCOPE_TYPE.RELATIONS]: 'קשרים בין הנתונים',
  [AUDIT_SCOPE_TYPE.FULL_SYSTEM]: 'כל המערכת',
})

export const buildAuditCollectionScope = collectionScope => ({
  type: AUDIT_SCOPE_TYPE.COLLECTION,
  collectionScope: clean(collectionScope),
})

export const buildAuditTeamSeasonScope = ({ teamDocumentId, seasonKey }) => ({
  type: AUDIT_SCOPE_TYPE.TEAM_SEASON,
  teamDocumentId: clean(teamDocumentId),
  seasonKey: clean(seasonKey),
})

export const buildAuditTeamSeasonsScope = scopes => ({
  type: AUDIT_SCOPE_TYPE.TEAM_SEASONS,
  scopes: (Array.isArray(scopes) ? scopes : [])
    .map(scope => buildAuditTeamSeasonScope(scope))
    .filter(scope => scope.teamDocumentId && scope.seasonKey),
})

export const buildAuditRelationsScope = relationId => ({
  type: AUDIT_SCOPE_TYPE.RELATIONS,
  relationId: clean(relationId),
})

export const normalizeAuditScope = value => {
  const source = value && typeof value === 'object' ? value : {}
  const type = clean(source.type)

  if (type === AUDIT_SCOPE_TYPE.COLLECTION) {
    return buildAuditCollectionScope(source.collectionScope)
  }

  if (type === AUDIT_SCOPE_TYPE.TEAM_SEASON) {
    return buildAuditTeamSeasonScope(source)
  }

  if (type === AUDIT_SCOPE_TYPE.TEAM_SEASONS) {
    const normalized = buildAuditTeamSeasonsScope(source.scopes)
    if (!normalized.scopes.length) {
      throw new Error('לא נמצאו קבוצות ועונות בהיקף העדכון האחרון.')
    }
    return normalized
  }

  if (type === AUDIT_SCOPE_TYPE.RELATIONS) {
    return buildAuditRelationsScope(source.relationId)
  }

  if (type === AUDIT_SCOPE_TYPE.FULL_SYSTEM) {
    return { type: AUDIT_SCOPE_TYPE.FULL_SYSTEM }
  }

  throw new Error('היקף הבדיקה אינו נתמך.')
}
