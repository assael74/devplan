const DOMAIN_STATE = {
  PARTIAL: 'PARTIAL',
  EMPTY: 'EMPTY',
  READY: 'READY',
}

const toArray = (v) => (Array.isArray(v) ? v : [])
const safeStr = (v) => (v == null ? '' : String(v).trim())

function resolveTeamTrainingWeeks(team, deps = {}) {
  const directTeamWeeks = toArray(team?.trainingWeeks)
  if (directTeamWeeks.length) return directTeamWeeks

  const directTeamTraining = toArray(team?.training)
  if (directTeamTraining.length) return directTeamTraining

  const weeksList = toArray(team?.weeksList)
  if (weeksList.length) return weeksList

  const depWeeks = toArray(deps?.trainingWeeks)
  if (depWeeks.length) return depWeeks

  const depTeamWeeksMap = deps?.teamTrainingWeeksById
  const teamId = safeStr(team?.id)

  if (teamId && depTeamWeeksMap instanceof Map) {
    return toArray(depTeamWeeksMap.get(teamId))
  }

  if (teamId && depTeamWeeksMap && typeof depTeamWeeksMap === 'object') {
    return toArray(depTeamWeeksMap[teamId])
  }

  return []
}

export function resolveTeamTrainingsDomain(entity, filters = {}, deps = {}) {
  const team = entity || null
  const trainingWeeks = resolveTeamTrainingWeeks(team, deps)
  const totalTrainings = trainingWeeks.reduce((sum, week) => {
    const rows = Array.isArray(week?.rows) ? week.rows.length : 0
    return sum + rows
  }, 0)

  if (!team) {
    return {
      state: DOMAIN_STATE.EMPTY,
      summary: {
        trainings: 0,
        totalTrainings: 0,
        totalWeeks: 0,
      },
      trainingWeeks: [],
    }
  }

  if (!trainingWeeks.length) {
    return {
      state: DOMAIN_STATE.EMPTY,
      summary: {
        trainings: 0,
        totalTrainings: 0,
        totalWeeks: 0,
      },
      trainingWeeks: [],
    }
  }

  const state = totalTrainings > 0 ? DOMAIN_STATE.READY : DOMAIN_STATE.PARTIAL

  return {
    state,
    trainingWeeks,
    summary: {
      trainings: totalTrainings,
      totalTrainings,
      totalWeeks: trainingWeeks.length,
    },
  }
}
