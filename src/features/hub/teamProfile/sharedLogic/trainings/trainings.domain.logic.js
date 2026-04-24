// playerProfile/sharedLogic/trainings/playerTrainings.domain.logic.js

const DOMAIN_STATE = {
  PARTIAL: 'PARTIAL',
  EMPTY: 'EMPTY',
  READY: 'READY',
}

const toArray = (v) => (Array.isArray(v) ? v : [])
const safeStr = (v) => (v == null ? '' : String(v).trim())

function resolvePlayerTrainingWeeks(player, deps = {}) {
  const directPlayerWeeks = toArray(player?.trainingWeeks)
  if (directPlayerWeeks.length) return directPlayerWeeks

  const directPlayerTraining = toArray(player?.training)
  if (directPlayerTraining.length) return directPlayerTraining

  const weeksList = toArray(player?.weeksList)
  if (weeksList.length) return weeksList

  const depWeeks = toArray(deps?.trainingWeeks)
  if (depWeeks.length) return depWeeks

  const depPlayerWeeksMap = deps?.playerTrainingWeeksById
  const playerId = safeStr(player?.id)

  if (playerId && depPlayerWeeksMap instanceof Map) {
    return toArray(depPlayerWeeksMap.get(playerId))
  }

  if (playerId && depPlayerWeeksMap && typeof depPlayerWeeksMap === 'object') {
    return toArray(depPlayerWeeksMap[playerId])
  }

  return []
}

export function resolvePlayerTrainingsDomain(entity, filters = {}, deps = {}) {
  const player = entity || null
  const trainingWeeks = resolvePlayerTrainingWeeks(player, deps)
  const totalTrainings = trainingWeeks.reduce((sum, week) => {
    const rows = Array.isArray(week?.rows) ? week.rows.length : 0
    return sum + rows
  }, 0)

  if (!player) {
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
