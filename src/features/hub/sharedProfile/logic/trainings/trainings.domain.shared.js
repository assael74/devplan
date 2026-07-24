// src/features/hub/sharedProfile/logic/trainings/trainings.domain.shared.js

const DOMAIN_STATE = {
  PARTIAL: 'PARTIAL',
  EMPTY: 'EMPTY',
  READY: 'READY',
}

const toArray = (value) => (Array.isArray(value) ? value : [])
const safeString = (value) => (value == null ? '' : String(value).trim())

function resolveTrainingWeeks(entity, deps = {}) {
  const directTrainingWeeks = toArray(entity?.trainingWeeks)
  if (directTrainingWeeks.length) return directTrainingWeeks

  const directTraining = toArray(entity?.training)
  if (directTraining.length) return directTraining

  const weeksList = toArray(entity?.weeksList)
  if (weeksList.length) return weeksList

  const dependencyWeeks = toArray(deps?.trainingWeeks)
  if (dependencyWeeks.length) return dependencyWeeks

  const weeksByEntityId =
    deps?.trainingWeeksByEntityId ||
    deps?.playerTrainingWeeksById ||
    deps?.teamTrainingWeeksById

  const entityId = safeString(entity?.id)

  if (entityId && weeksByEntityId instanceof Map) {
    return toArray(weeksByEntityId.get(entityId))
  }

  if (entityId && weeksByEntityId && typeof weeksByEntityId === 'object') {
    return toArray(weeksByEntityId[entityId])
  }

  return []
}

export function resolveTrainingsDomain(entity, filters = {}, deps = {}) {
  const trainingWeeks = resolveTrainingWeeks(entity, deps)
  const totalTrainings = trainingWeeks.reduce((sum, week) => {
    const rows = Array.isArray(week?.rows) ? week.rows.length : 0
    return sum + rows
  }, 0)

  if (!entity || !trainingWeeks.length) {
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

  return {
    state: totalTrainings > 0 ? DOMAIN_STATE.READY : DOMAIN_STATE.PARTIAL,
    trainingWeeks,
    summary: {
      trainings: totalTrainings,
      totalTrainings,
      totalWeeks: trainingWeeks.length,
    },
  }
}
