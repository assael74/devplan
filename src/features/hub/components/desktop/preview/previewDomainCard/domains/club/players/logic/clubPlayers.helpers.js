// preview/previewDomainCard/domains/team/players/logic/teamPlayers.helpers.js

import { PROJECT_STATUS_CANDIDATE, SQUAD_ROLE_OPTIONS } from '../../../../../../../../../../shared/players/players.constants.js'

const safe = (v) => (v == null ? '' : String(v))
const num = (v) => (typeof v === 'number' && !Number.isNaN(v) ? v : Number(v) || 0)

export const getTeamName = (entity) =>
  safe(entity?.name || entity?.teamName || 'קבוצה')

export const getPlayerStatusLabel = (row) =>
  row?.isKey ? 'שחקן מפתח בקבוצה' : 'שחקן סגל'

export const getReferenceLabel = (timeRef) => {
  const value = num(timeRef)
  return value > 0 ? `${value} דק׳` : 'ללא רפרנס'
}

const NON_PROJECT = {
  id: 'none',
  labelH: 'לא מועמד',
  idIcon: 'isNotProject',
  color: '#f87970',
  icCol: '#f87970',
}

export const getProjectStatusMeta = (status) => {
  if (!status) return null
  return PROJECT_STATUS_CANDIDATE.find((s) => s.id === status) || NON_PROJECT
}
