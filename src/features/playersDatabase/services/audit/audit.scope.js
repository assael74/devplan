// src/features/playersDatabase/services/audit/audit.scope.js

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const AUDIT_SCOPE_TYPE = Object.freeze({ TEAM_SEASON: 'teamSeason', TEAM_SEASONS: 'teamSeasons', CLUB_TEAM_SEASON: 'clubTeamSeason', LEAGUE_SEASON: 'leagueSeason', FULL_SYSTEM: 'fullSystem' })
export const AUDIT_DOMAIN = Object.freeze({
  TEAM_RELATIONS: 'team_relations',
  PLAYER_RELATIONS: 'player_relations',
  LEAGUE_LIFECYCLE: 'league_lifecycle',
  LEAGUES_MASTER: 'leagues_master',
  CLUB_RELATIONS: 'club_relations',
  CLUBS_MASTER: 'clubs_master',
  WRITE_RECOVERY: 'write_recovery',
})
export const AUDIT_SCOPE_LABELS = Object.freeze({ [AUDIT_SCOPE_TYPE.TEAM_SEASON]: 'קבוצה ועונה', [AUDIT_SCOPE_TYPE.TEAM_SEASONS]: 'העדכון האחרון', [AUDIT_SCOPE_TYPE.CLUB_TEAM_SEASON]: 'מועדון, קבוצה, שנתון ועונה', [AUDIT_SCOPE_TYPE.LEAGUE_SEASON]: 'ליגה ועונה', [AUDIT_SCOPE_TYPE.FULL_SYSTEM]: 'כל המערכת' })

export const buildAuditTeamSeasonScope = ({ teamDocumentId, seasonKey }) => ({ type: AUDIT_SCOPE_TYPE.TEAM_SEASON, teamDocumentId: clean(teamDocumentId), seasonKey: clean(seasonKey) })
export const buildAuditClubTeamSeasonScope = ({ clubId, teamDocumentId, birthYear, seasonKey }) => ({ type: AUDIT_SCOPE_TYPE.CLUB_TEAM_SEASON, clubId: clean(clubId), teamDocumentId: clean(teamDocumentId), birthYear: clean(birthYear), seasonKey: clean(seasonKey) })
export const buildAuditTeamSeasonsScope = scopes => ({ type: AUDIT_SCOPE_TYPE.TEAM_SEASONS, scopes: (Array.isArray(scopes) ? scopes : []).map(buildAuditTeamSeasonScope).filter(scope => scope.teamDocumentId && scope.seasonKey) })
export const buildAuditLeagueSeasonScope = ({ leagueId, seasonKey }) => ({ type: AUDIT_SCOPE_TYPE.LEAGUE_SEASON, leagueId: clean(leagueId), seasonKey: clean(seasonKey) })
export const normalizeAuditScope = value => {
  const source = value && typeof value === 'object' ? value : {}
  if (source.type === AUDIT_SCOPE_TYPE.TEAM_SEASON) {
    const scope = buildAuditTeamSeasonScope(source)
    if (!scope.teamDocumentId || !scope.seasonKey) throw new Error('חסרים מזהה קבוצה או עונה.')
    return scope
  }
  if (source.type === AUDIT_SCOPE_TYPE.CLUB_TEAM_SEASON) {
    const scope = buildAuditClubTeamSeasonScope(source)
    if (!scope.clubId || !scope.teamDocumentId || !scope.birthYear || !scope.seasonKey) throw new Error('חסרים מזהה מועדון, קבוצה, שנתון או עונה.')
    return scope
  }
  if (source.type === AUDIT_SCOPE_TYPE.TEAM_SEASONS) {
    const scope = buildAuditTeamSeasonsScope(source.scopes)
    if (!scope.scopes.length) throw new Error('לא נמצאו קבוצות ועונות לבדיקה.')
    return scope
  }
  if (source.type === AUDIT_SCOPE_TYPE.LEAGUE_SEASON) {
    const scope = buildAuditLeagueSeasonScope(source)
    if (!scope.leagueId || !scope.seasonKey) throw new Error('חסרים מזהה ליגה או עונה.')
    return scope
  }
  return { type: AUDIT_SCOPE_TYPE.FULL_SYSTEM }
}

export const buildAuditScopeKey = ({ teamDocumentId = '', leagueId = '', seasonKey = '', auditDomain = '' } = {}) => {
  const teamId = clean(teamDocumentId)
  const season = clean(seasonKey)
  const domain = clean(auditDomain)
  if (teamId && season && domain) return `teamSeason__${domain}__${teamId}__${season}`
  return clean(leagueId) && season && domain ? `leagueSeason__${domain}__${clean(leagueId)}__${season}` : ''
}

export const getAuditScopeKeys = (scope, auditDomains = []) => {
  const normalizedScope = normalizeAuditScope(scope)
  if (normalizedScope.type === AUDIT_SCOPE_TYPE.FULL_SYSTEM) return []
  if (normalizedScope.type === AUDIT_SCOPE_TYPE.LEAGUE_SEASON) {
    return auditDomains.map(auditDomain => buildAuditScopeKey({ ...normalizedScope, auditDomain })).filter(Boolean)
  }

  const scopes = normalizedScope.type === AUDIT_SCOPE_TYPE.TEAM_SEASON || normalizedScope.type === AUDIT_SCOPE_TYPE.CLUB_TEAM_SEASON
    ? [normalizedScope]
    : normalizedScope.scopes
  return [...new Set(scopes.flatMap(item => auditDomains.map(auditDomain => (
    buildAuditScopeKey({ ...item, auditDomain })
  )).filter(Boolean)))]
}
