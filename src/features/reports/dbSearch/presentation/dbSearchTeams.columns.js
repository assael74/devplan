import { getDbSearchTeamColumnWidth } from './dbSearchTeams.table.js'

const hasField = (availableFields, field) => availableFields.includes(field)

export function buildDbSearchTeamColumns({
  availableDomains = [],
  availableFields = [],
} = {}) {
  const columns = [
    {
      id: 'teamName',
      label: 'שם קבוצה',
      field: 'teamName',
      sortable: true,
      kind: 'team',
    },
  ]

  if (hasField(availableFields, 'clubLevel')) {
    columns.push({
      id: 'clubLevel',
      label: 'רמת מועדון',
      field: 'clubLevel',
      sortable: true,
      kind: 'clubLevel',
    })
  }

  if (hasField(availableFields, 'seasonKey')) {
    columns.push({ id: 'seasonKey', label: 'עונה', field: 'seasonKey' })
  }

  if (hasField(availableFields, 'birthYear')) {
    columns.push({ id: 'birthYear', label: 'שנתון', field: 'birthYear' })
  }

  if (hasField(availableFields, 'leagueName')) {
    columns.push({
      id: 'leagueName',
      label: 'ליגה',
      field: 'leagueName',
      sortable: true,
      kind: 'league',
      showLevel: hasField(availableFields, 'leagueLevel'),
    })
  }

  if (hasField(availableFields, 'tableRank')) {
    columns.push({
      id: 'tableRank',
      label: 'מיקום',
      field: 'tableRank',
      sortable: true,
    })
  }

  if (hasField(availableFields, 'appearances')) {
    columns.push({ id: 'appearances', label: 'מש׳', field: 'appearances' })
  }

  if (hasField(availableFields, 'goalsFor')) {
    columns.push({
      id: 'goalsFor',
      label: 'שערים',
      field: 'goalsFor',
      sortable: true,
    })
  }

  if (hasField(availableFields, 'goalsAgainst')) {
    columns.push({
      id: 'goalsAgainst',
      label: 'ספיגה',
      field: 'goalsAgainst',
      sortable: true,
    })
  }

  if (
    availableDomains.includes('offense') &&
    hasField(availableFields, 'offense.scoutPriorityScore')
  ) {
    columns.push({
      id: 'offensePriority',
      label: 'עדיפות התקפית',
      field: 'offense.scoutPriorityScore',
      sortable: true,
      kind: 'scoutPriority',
      domain: 'offense',
    })
  }

  if (
    availableDomains.includes('defense') &&
    hasField(availableFields, 'defense.scoutPriorityScore')
  ) {
    columns.push({
      id: 'defensePriority',
      label: 'עדיפות הגנתית',
      field: 'defense.scoutPriorityScore',
      sortable: true,
      kind: 'scoutPriority',
      domain: 'defense',
    })
  }

  if (hasField(availableFields, 'expectedLeagueLevelChange.direction')) {
    columns.push({
      id: 'expectedLeagueLevelChange',
      label: 'שינוי רמה צפוי',
      kind: 'expectedLevelChange',
    })
  }

  return columns.map(column => ({
    ...column,
    width: getDbSearchTeamColumnWidth(column.id),
    align: ['teamName', 'clubLevel', 'leagueName'].includes(column.id) ? 'left' : 'center',
    headerAlign: ['teamName', 'clubLevel', 'leagueName'].includes(column.id) ? 'left' : 'center',
  }))
}
