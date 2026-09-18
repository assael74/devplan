import { AUDIT_DOMAIN } from './audit.scope.js'

export const AUDIT_FINDING_TYPE = Object.freeze({
  MISSING_DOCUMENT: 'missing_document',
  SOURCE_MISMATCH: 'source_mismatch',
  BROKEN_RELATION: 'broken_relation',
  UNEXPECTED_DOCUMENT: 'unexpected_document',
  PARTIAL_WRITE: 'partial_write',
})

export const AUDIT_REPAIR_TYPE = Object.freeze({
  CREATE_PLAYER_DOCUMENT: 'create_player_document',
  DELETE_ORPHAN_PLAYER_SEARCH_INDEX: 'delete_orphan_player_search_index',
  RESET_ORPHAN_TEAM_SEARCH_INDEX: 'reset_orphan_team_search_index',
  REBUILD_PLAYER_SEARCH_INDEX: 'rebuild_player_search_index',
  REBUILD_TEAM_SEARCH_INDEX: 'rebuild_team_search_index',
  REBUILD_CLUB_PROJECTION: 'rebuild_club_projection',
  REBUILD_CLUB_PERFORMANCE: 'rebuild_club_performance',
  REBUILD_CLUB_COMPETITION_PATH: 'rebuild_club_competition_path',
  REBUILD_CLUBS_MASTER: 'rebuild_clubs_master',
  RETRY_MOVEMENT_COUNTERPART: 'retry_movement_counterpart',
})

const clean = value => String(value === undefined || value === null ? '' : value).trim()
export const normalizeLegacyAuditRepairType = ({ repairType = '', type = '', entityType = '', source = '' } = {}) => {
  if (clean(repairType)) return clean(repairType)

  const legacySource = clean(source)
  if (type === AUDIT_FINDING_TYPE.MISSING_DOCUMENT && entityType === 'player') return AUDIT_REPAIR_TYPE.CREATE_PLAYER_DOCUMENT
  if (type === AUDIT_FINDING_TYPE.UNEXPECTED_DOCUMENT && entityType === 'playerSearchIndex') return AUDIT_REPAIR_TYPE.DELETE_ORPHAN_PLAYER_SEARCH_INDEX
  if (type === AUDIT_FINDING_TYPE.BROKEN_RELATION && entityType === 'teamSearchIndex') return AUDIT_REPAIR_TYPE.RESET_ORPHAN_TEAM_SEARCH_INDEX
  if (entityType === 'playerSearchIndex' && legacySource === 'Team Season player scout profile → Player SearchIndex') return AUDIT_REPAIR_TYPE.REBUILD_PLAYER_SEARCH_INDEX
  if (entityType === 'teamSearchIndex' && legacySource === 'League season → buildTeamSeasonSearchMetrics') return AUDIT_REPAIR_TYPE.REBUILD_TEAM_SEARCH_INDEX
  if ((entityType === 'clubDocument' || entityType === 'clubAgeGroupSeason') && legacySource === 'League table → Club Document') return AUDIT_REPAIR_TYPE.REBUILD_CLUB_PROJECTION
  if (entityType === 'clubAgeGroupSeason' && (legacySource === 'League table → Club performance' || legacySource === 'Team Season scout performance → Club performance')) return AUDIT_REPAIR_TYPE.REBUILD_CLUB_PERFORMANCE
  if (entityType === 'clubCompetitionPathSeason' && legacySource === 'Club ageGroups → competitionPaths') return AUDIT_REPAIR_TYPE.REBUILD_CLUB_COMPETITION_PATH
  if (entityType === 'clubsMasterClub' && legacySource === 'Club Document → buildClubsMasterClubProjection') return AUDIT_REPAIR_TYPE.REBUILD_CLUBS_MASTER
  return ''
}
const resolveAuditDomain = ({ auditDomain = '', entityType = '' } = {}) => {
  if (clean(auditDomain)) return clean(auditDomain)
  const entity = clean(entityType)
  if (entity.startsWith('club')) return entity.includes('Master')
    ? AUDIT_DOMAIN.CLUBS_MASTER
    : AUDIT_DOMAIN.CLUB_RELATIONS
  if (entity.startsWith('leaguesMaster')) return AUDIT_DOMAIN.LEAGUES_MASTER
  if (entity.startsWith('league')) return AUDIT_DOMAIN.LEAGUE_LIFECYCLE
  if (entity.startsWith('player')) return AUDIT_DOMAIN.PLAYER_RELATIONS
  if (entity === 'writeAction') return AUDIT_DOMAIN.WRITE_RECOVERY
  return AUDIT_DOMAIN.TEAM_RELATIONS
}

export const buildAuditFinding = ({
  type,
  entityType = '',
  documentId = '',
  relatedDocumentId = '',
  teamDocumentId = '',
  teamDisplayName = '',
  leagueId = '',
  playerDocumentId = '',
  playerId = '',
  externalPlayerId = '',
  playerDisplayName = '',
  seasonKey = '',
  relationKey = '',
  auditDomain = '',
  title = '',
  explanation = '',
  source = '',
  repairType = '',
  expected = null,
  actual = null,
  lifecycleStatus = '',
  severity = 'medium',
} = {}) => ({
  type,
  entityType: clean(entityType),
  documentId: clean(documentId),
  relatedDocumentId: clean(relatedDocumentId),
  teamDocumentId: clean(teamDocumentId),
  teamDisplayName: clean(teamDisplayName),
  leagueId: clean(leagueId),
  playerDocumentId: clean(playerDocumentId),
  playerId: clean(playerId),
  externalPlayerId: clean(externalPlayerId),
  playerDisplayName: clean(playerDisplayName),
  seasonKey: clean(seasonKey),
  relationKey: clean(relationKey),
  auditDomain: resolveAuditDomain({ auditDomain, entityType }),
  title: clean(title),
  explanation: clean(explanation),
  source: clean(source),
  repairType: normalizeLegacyAuditRepairType({ repairType, type, entityType, source }),
  expected,
  actual,
  lifecycleStatus: clean(lifecycleStatus),
  severity: clean(severity) || 'medium',
})

export const buildAuditResult = ({ scope, generatedAt, readsUsed = 0, checked = 0, findings = [], lifecycle = [], coverage = {}, auditMetadata = null } = {}) => {
  const summary = Object.values(AUDIT_FINDING_TYPE).reduce((result, type) => ({
    ...result,
    [type]: findings.filter(finding => finding.type === type).length,
  }), { checked: Number(checked) || 0, reads: Number(readsUsed) || 0 })

  return {
    generatedAt: generatedAt || new Date().toISOString(),
    scope,
    readsUsed: Number(readsUsed) || 0,
    checked: Number(checked) || 0,
    summary,
    lifecycle,
    coverage,
    auditMetadata,
    findings,
    issues: findings,
    issuesCount: findings.length,
  }
}
