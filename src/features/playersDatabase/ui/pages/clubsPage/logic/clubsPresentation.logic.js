const AGE_GROUP_ORDER = ['u19', 'u17', 'u16', 'u15', 'u14', 'u13']
const clean = value => String(value === null || value === undefined ? '' : value).trim()

export const formatClubLevel = value => {
  const level = Number(value)
  if (!Number.isFinite(level) || level <= 0) return '-'
  return Number.isInteger(level) ? String(level) : level.toFixed(1)
}

export const formatLeagueLevel = value => {
  const level = Number(value)
  return Number.isInteger(level) && level > 0 ? `L${level}` : '-'
}

export const formatPerGame = value => {
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(1) : '-'
}

export const sortTeamsByAge = teams => [...teams].sort((left, right) => {
  const leftAge = AGE_GROUP_ORDER.indexOf(clean(left?.ageGroupId))
  const rightAge = AGE_GROUP_ORDER.indexOf(clean(right?.ageGroupId))
  const leftOrder = leftAge >= 0 ? leftAge : AGE_GROUP_ORDER.length
  const rightOrder = rightAge >= 0 ? rightAge : AGE_GROUP_ORDER.length

  if (leftOrder !== rightOrder) return leftOrder - rightOrder
  return clean(left?.teamId).localeCompare(clean(right?.teamId))
})
