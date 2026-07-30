const hasField = (availableFields, field) => availableFields.includes(field)

export function buildDbSearchPlayerColumns({ availableFields = [] } = {}) {
  const columns = [
    {
      id: 'playerName',
      label: 'שחקן',
      field: 'playerName',
      sortable: true,
      kind: 'player',
    },
  ]

  if (hasField(availableFields, 'birthYear')) {
    columns.push({ id: 'birthYear', label: 'שנתון', field: 'birthYear', sortable: true })
  }

  if (hasField(availableFields, 'seasonKey')) {
    columns.push({ id: 'seasonKey', label: 'עונה', field: 'seasonKey' })
  }

  if (hasField(availableFields, 'teamName')) {
    columns.push({ id: 'teamName', label: 'קבוצה', field: 'teamName', sortable: true })
  }

  if (hasField(availableFields, 'leagueName')) {
    columns.push({ id: 'leagueName', label: 'ליגה', field: 'leagueName' })
  }

  if (hasField(availableFields, 'primaryPosition')) {
    columns.push({ id: 'primaryPosition', label: 'עמדה', field: 'primaryPosition' })
  }

  if (hasField(availableFields, 'minutes')) {
    columns.push({ id: 'minutes', label: 'דקות', field: 'minutes', sortable: true })
  }

  if (hasField(availableFields, 'starts') || hasField(availableFields, 'appearances')) {
    columns.push({ id: 'startsAppearances', label: 'הרכב/הופעות', kind: 'startsAppearances' })
  }

  if (hasField(availableFields, 'goals')) {
    columns.push({ id: 'goals', label: 'שערים', field: 'goals', sortable: true })
  }

  if (hasField(availableFields, 'primaryProfile')) {
    columns.push({ id: 'primaryProfile', label: 'פרופיל סקאוט', field: 'primaryProfile' })
  }

  if (hasField(availableFields, 'score')) {
    columns.push({ id: 'score', label: 'ציון', field: 'score', sortable: true })
  }

  return columns
}
