import { safeArr, safeId, safeNum, toMillis } from '../../utils/data.utils.js'

const resolveTrainingWeeks = (team) => {
  if (!team || typeof team !== 'object') return []
  return (
    safeArr(team?.trainingWeeks).length ? team.trainingWeeks :
    safeArr(team?.training).length ? team.training :
    safeArr(team?.weeksList).length ? team.weeksList :
    []
  )
}

const getTrainingSortTime = (item) =>
  toMillis(item?.date) ||
  toMillis(item?.startDate) ||
  toMillis(item?.trainingDate) ||
  toMillis(item?.weekStart) ||
  toMillis(item?.updatedAt) ||
  toMillis(item?.createdAt)

const sortByDateDesc = (arr) =>
  safeArr(arr).slice().sort((a, b) => getTrainingSortTime(b) - getTrainingSortTime(a))

export const getTrainingWeeksFromTeam = (team) => sortByDateDesc(resolveTrainingWeeks(team))

export const buildTrainingWeeksByTeamId = (teamsArr = []) => {
  const map = new Map()

  for (const team of safeArr(teamsArr)) {
    const teamId = safeId(team?.id)
    if (teamId) map.set(teamId, getTrainingWeeksFromTeam(team))
  }

  return map
}

const countWeekUnits = (week) => {
  const days = week?.days
  if (days && typeof days === 'object') {
    return Object.values(days).filter((d) => d && d.enabled !== false).length
  }

  return (
    safeNum(week?.trainingCount) ||
    safeNum(week?.sessionsCount) ||
    safeNum(week?.unitsCount) ||
    safeArr(week?.trainings).length ||
    safeArr(week?.sessions).length ||
    safeArr(week?.units).length ||
    0
  )
}

export const buildTrainingWeeksSummary = (trainingWeeks = []) => {
  const weeks = safeArr(trainingWeeks)

  return {
    weeksCount: weeks.length,
    trainingsCount: weeks.reduce((sum, week) => sum + countWeekUnits(week), 0),
    lastWeek: weeks[0] || null,
  }
}
