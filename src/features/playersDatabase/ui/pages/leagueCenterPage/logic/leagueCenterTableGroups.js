// src/features/playersDatabase/ui/pages/leagueCenterPage/logic/leagueCenterTableGroups.js

const toNumber = value => Number(value || 0)

const seasonOrder = seasonKey => (
  toNumber(String(seasonKey || '').split('/')[0])
)

const compareLeagueRows = (left, right) => {
  const birthYearDifference = toNumber(right.birthYear) - toNumber(left.birthYear)
  if (birthYearDifference) return birthYearDifference

  const seasonDifference = seasonOrder(right.seasonKey) - seasonOrder(left.seasonKey)
  if (seasonDifference) return seasonDifference

  return String(left.leagueName || '').localeCompare(
    String(right.leagueName || ''),
    'he'
  )
}

const buildGroupKey = row => `${row.birthYear || '-'}_${row.seasonKey || '-'}`

const buildGroupLabel = row => (
  `שנתון ${row.birthYear || '-'} · עונה ${row.seasonKey || '-'}`
)

export const buildLeagueCenterTableGroups = rows => {
  const sortedRows = [...rows].sort(compareLeagueRows)
  const groupKeys = new Set(sortedRows.map(buildGroupKey))

  if (groupKeys.size < 2) return sortedRows

  return sortedRows.flatMap((row, index) => {
    const previousRow = sortedRows[index - 1]
    const startsGroup = !previousRow || buildGroupKey(previousRow) !== buildGroupKey(row)

    return startsGroup
      ? [{
        id: `group_${buildGroupKey(row)}`,
        fullWidthMessage: buildGroupLabel(row),
        fullWidthMessageFullRow: true,
      }, row]
      : [row]
  })
}
