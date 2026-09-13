const PRIORITY_RANK = {
  low: 1,
  neutral: 2,
  positive: 3,
  high: 4,
  elite: 5,
}

export const matchesPriorityThreshold = (level, threshold) => {
  if (!threshold) return true

  return (PRIORITY_RANK[level] || 0) >= (PRIORITY_RANK[threshold] || 0)
}

export const buildPriorityCounts = (teams, side) => {
  const getLevel = team => side === 'attack'
    ? team.performanceView?.offense?.priority?.level || ''
    : team.performanceView?.defense?.priority?.level || ''

  return {
    all: teams.length,
    positive: teams.filter(team => (
      matchesPriorityThreshold(getLevel(team), 'positive')
    )).length,
    high: teams.filter(team => (
      matchesPriorityThreshold(getLevel(team), 'high')
    )).length,
    elite: teams.filter(team => (
      matchesPriorityThreshold(getLevel(team), 'elite')
    )).length,
  }
}

export const filterTeamsByPriority = ({
  teams,
  attackThreshold,
  defenseThreshold,
}) => teams.filter(team => {
  const attackLevel = team.performanceView?.offense?.priority?.level || ''
  const defenseLevel = team.performanceView?.defense?.priority?.level || ''

  return (
    matchesPriorityThreshold(attackLevel, attackThreshold) &&
    matchesPriorityThreshold(defenseLevel, defenseThreshold)
  )
})
