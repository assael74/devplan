const hasField = (availableFields, field) => availableFields.includes(field)

export function buildDbSearchTeamColumns({
  availableDomains = [],
  availableFields = [],
} = {}) {
  const columns = [
    {
      id: 'teamName',
      label: 'קבוצה',
      field: 'teamName',
      sortable: true,
      kind: 'team',
    },
  ]

  if (hasField(availableFields, 'seasonKey')) {
    columns.push({ id: 'seasonKey', label: 'עונה', field: 'seasonKey' })
  }

  if (hasField(availableFields, 'birthYear')) {
    columns.push({ id: 'birthYear', label: 'שנתון', field: 'birthYear' })
  }

  if (hasField(availableFields, 'leagueName')) {
    columns.push({ id: 'leagueName', label: 'ליגה', field: 'leagueName' })
  }

  if (hasField(availableFields, 'leagueLevel')) {
    columns.push({
      id: 'leagueLevel',
      label: 'רמה',
      field: 'leagueLevel',
      sortable: true,
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

  if (
    hasField(availableFields, 'goalsFor') ||
    hasField(availableFields, 'goalsAgainst')
  ) {
    columns.push({ id: 'goals', label: 'שערים', kind: 'goals' })
  }

  if (
    availableDomains.includes('offense') &&
    hasField(availableFields, 'offense.scoutPriorityRate')
  ) {
    columns.push({
      id: 'offensePriority',
      label: 'עדיפות התקפית',
      field: 'offense.scoutPriorityRate',
      sortable: true,
      kind: 'rate',
    })
  }

  if (
    availableDomains.includes('defense') &&
    hasField(availableFields, 'defense.scoutPriorityRate')
  ) {
    columns.push({
      id: 'defensePriority',
      label: 'עדיפות הגנתית',
      field: 'defense.scoutPriorityRate',
      sortable: true,
      kind: 'rate',
    })
  }

  if (hasField(availableFields, 'expectedLeagueLevelChange.direction')) {
    columns.push({
      id: 'expectedLeagueLevelChange',
      label: 'שינוי רמה צפוי',
      kind: 'expectedLevelChange',
    })
  }

  return columns
}
