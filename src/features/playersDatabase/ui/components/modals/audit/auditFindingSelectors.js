import { AUDIT_FINDING_TYPE, AUDIT_REPAIR_TYPE, normalizeLegacyAuditRepairType } from '../../../../services/audit/index.js'
import { clean } from './auditFindingPresentation.js'

export const MISMATCH_COLLECTION_TABS = Object.freeze([
  { id: 'playerSearchIndex', label: 'אינדקסי שחקנים' },
  { id: 'teamSearchIndex', label: 'אינדקסי קבוצות' },
  { id: 'teamSeason', label: 'עונות קבוצה' },
  { id: 'player', label: 'מסמכי שחקנים' },
  { id: 'league', label: 'ליגות ומאסטר' },
  { id: 'club', label: 'מסמכי מועדון' },
  { id: 'clubsMaster', label: 'Clubs Master' },
  { id: 'other', label: 'אחר' },
])

export const mismatchCollectionOf = finding => {
  const entityType = clean(finding?.entityType)
  if (entityType === 'playerSearchIndex') return 'playerSearchIndex'
  if (entityType === 'teamSearchIndex') return 'teamSearchIndex'
  if (entityType === 'teamSeason' || entityType === 'teamSeasonPlayer') return 'teamSeason'
  if (entityType === 'player') return 'player'
  if (entityType.includes('league')) return 'league'
  if (entityType === 'clubDocument' || entityType === 'clubAgeGroupSeason' || entityType === 'clubCompetitionPathSeason') return 'club'
  if (entityType === 'clubsMaster' || entityType === 'clubsMasterClub') return 'clubsMaster'
  return 'other'
}

export const selectLifecycleSummary = result => (
  (Array.isArray(result?.lifecycle) ? result.lifecycle : []).reduce((summary, item) => {
    const key = clean(item?.status) || 'unknown'
    summary[key] = Number(summary[key] || 0) + 1
    return summary
  }, {})
)

export const selectFindingView = ({ findings = [], filter = 'all', mismatchCollection }) => {
  const mismatchFindings = findings.filter(item => item.type === AUDIT_FINDING_TYPE.SOURCE_MISMATCH)
  const mismatchCounts = mismatchFindings.reduce((counts, finding) => {
    const key = mismatchCollectionOf(finding)
    counts[key] = Number(counts[key] || 0) + 1
    return counts
  }, {})
  const activeMismatchCollection = Number(mismatchCounts[mismatchCollection] || 0) > 0
    ? mismatchCollection
    : MISMATCH_COLLECTION_TABS.find(tab => Number(mismatchCounts[tab.id] || 0) > 0)?.id || 'other'
  const filtered = filter === 'all'
    ? findings
    : filter === AUDIT_FINDING_TYPE.SOURCE_MISMATCH
      ? mismatchFindings.filter(item => mismatchCollectionOf(item) === activeMismatchCollection)
      : findings.filter(item => item.type === filter)

  return { mismatchCounts, activeMismatchCollection, filtered }
}

export const selectRepairFindings = findings => {
  const mismatchFindings = findings.filter(item => item.type === AUDIT_FINDING_TYPE.SOURCE_MISMATCH)
  const hasRepairType = (finding, repairType) => (
    normalizeLegacyAuditRepairType(finding) === repairType
  )

  return {
    repairable: findings.filter(finding => hasRepairType(finding, AUDIT_REPAIR_TYPE.CREATE_PLAYER_DOCUMENT) && clean(finding.playerDocumentId)),
    clubProjection: findings.filter(finding => hasRepairType(finding, AUDIT_REPAIR_TYPE.REBUILD_CLUB_PROJECTION)),
    playerIndex: mismatchFindings.filter(finding => hasRepairType(finding, AUDIT_REPAIR_TYPE.REBUILD_PLAYER_SEARCH_INDEX)),
    orphanPlayerIndex: findings.filter(finding => (
      hasRepairType(finding, AUDIT_REPAIR_TYPE.DELETE_ORPHAN_PLAYER_SEARCH_INDEX) &&
      clean(finding.documentId) &&
      clean(finding.teamDocumentId) &&
      clean(finding.seasonKey)
    )),
    orphanTeamIndex: findings.filter(finding => (
      hasRepairType(finding, AUDIT_REPAIR_TYPE.RESET_ORPHAN_TEAM_SEARCH_INDEX) &&
      clean(finding.documentId) &&
      clean(finding.teamDocumentId) &&
      clean(finding.seasonKey)
    )),
    teamIndex: mismatchFindings.filter(finding => hasRepairType(finding, AUDIT_REPAIR_TYPE.REBUILD_TEAM_SEARCH_INDEX)),
    clubsMaster: mismatchFindings.filter(finding => hasRepairType(finding, AUDIT_REPAIR_TYPE.REBUILD_CLUBS_MASTER) && clean(finding.relatedDocumentId)),
    clubCompetitionPath: findings.filter(finding => hasRepairType(finding, AUDIT_REPAIR_TYPE.REBUILD_CLUB_COMPETITION_PATH)),
    clubPerformance: mismatchFindings.filter(finding => hasRepairType(finding, AUDIT_REPAIR_TYPE.REBUILD_CLUB_PERFORMANCE)),
    movementCounterpart: findings.filter(finding => hasRepairType(finding, AUDIT_REPAIR_TYPE.RETRY_MOVEMENT_COUNTERPART)),
  }
}
