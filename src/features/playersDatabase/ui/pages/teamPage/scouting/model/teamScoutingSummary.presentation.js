// src/features/playersDatabase/ui/pages/teamPage/scouting/model/teamScoutingSummary.presentation.js

import { TEAM_STRUCTURE_FILTER } from '../../structure/model/teamStructureFilter.model.js'
import { getTeamSquadUsageLabel } from '../../structure/model/teamSquadUsage.presentation.js'
import { getTeamDiagnosticSignalLabel } from './teamDiagnosticSignalTask.presentation.js'

export const TEAM_SCOUTING_SUMMARY_ITEMS = Object.freeze([
  {
    key: 'defense',
    label: 'הגנה',
    iconId: 'defense',
    filterKey: TEAM_STRUCTURE_FILTER.DEFENSE,
  },
  {
    key: 'offense',
    label: 'התקפה',
    iconId: 'attack',
    filterKey: TEAM_STRUCTURE_FILTER.ATTACK,
  },
  {
    key: 'squad',
    label: 'שימוש בסגל',
    iconId: 'group',
    filterKey: TEAM_STRUCTURE_FILTER.ALL_SQUAD,
  },
])

export const getTeamScoutingSummaryTitle = ({ structure, item }) => {
  if (item.key === 'squad') {
    return getTeamSquadUsageLabel(structure?.classificationCoverageBenchmark?.state)
  }

  const interest = structure?.teamInterest?.lines?.[item.key]
  const signalId = interest?.finding || interest?.reason || ''
  if (['ATTACK_CLASSIFICATION_MISSING', 'DEFENSE_CLASSIFICATION_MISSING'].includes(signalId)) {
    return `אין שחקנים מסווגים ל${item.label}`
  }

  const signalLabel = getTeamDiagnosticSignalLabel(signalId)
  if (interest?.isInteresting) {
    return signalLabel || structure?.interestPresentation?.[item.key]?.label || item.label
  }

  return signalId === 'REVIEW_REQUIRED'
    ? 'אירוע למעקב ולבחינה עתידית.'
    : signalLabel || item.label
}

export const getTeamScoutingSummaryTitles = structure => (
  TEAM_SCOUTING_SUMMARY_ITEMS.map(item => getTeamScoutingSummaryTitle({ structure, item }))
)
