// src/features/playersDatabase/ui/components/modals/audit/auditFindingSelectors.js

import { AUDIT_FINDING_TYPE } from '../../../../services/audit/index.js'
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

