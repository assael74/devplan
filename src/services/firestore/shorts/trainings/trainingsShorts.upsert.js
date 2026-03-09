// C:\projects\devplan\src\services\firestore\shorts\trainings\trainingsShorts.upsert.js
import { buildWeekFromDraft, clean } from '../../../../shared/trainings/trainingsWeek.logic.js'
import { normalizeWeekId } from '../../../../shared/trainings/trainingsWeek.dates.js'

export const getTeamTrainingFromList = ({ list, teamId } = {}) => {
  const arr = Array.isArray(list) ? list : []
  const tid = clean(teamId)
  if (!tid) return null
  return arr.find((x) => clean(x?.id) === tid) || null
}

export const getWeekFromTeamTraining = ({ teamTraining, weekId } = {}) => {
  const tt = teamTraining || {}
  const wid = normalizeWeekId(weekId)
  if (!wid) return null

  const trainingWeeks = Array.isArray(tt.trainingWeeks) ? tt.trainingWeeks : []
  return trainingWeeks.find((x) => normalizeWeekId(x?.weekId) === wid) || null
}

export const upsertTeamTrainingInList = ({ list, teamId, now = Date.now() } = {}) => {
  const arr = Array.isArray(list) ? list.slice() : []
  const tid = clean(teamId)
  if (!tid) throw new Error('trainingsShorts.upsert: missing teamId')

  const idx = arr.findIndex((x) => clean(x?.id) === tid)

  if (idx === -1) {
    arr.push({
      id: tid,
      teamId: tid,
      trainingWeeks: [],
      createdAt: now,
      updatedAt: now,
    })
    return { list: arr, teamIndex: arr.length - 1 }
  }

  const cur = arr[idx] || {}
  arr[idx] = {
    ...cur,
    id: tid,
    teamId: tid,
    trainingWeeks: Array.isArray(cur.trainingWeeks) ? cur.trainingWeeks : [],
    updatedAt: now,
  }

  return { list: arr, teamIndex: idx }
}

export const upsertWeekInTeamTraining = ({ teamTraining, week, now = Date.now() } = {}) => {
  const tt = teamTraining || {}
  const trainingWeeks = Array.isArray(tt.trainingWeeks) ? tt.trainingWeeks.slice() : []
  const w = week || {}
  const weekId = normalizeWeekId(w.weekId)

  if (!weekId) throw new Error('trainingsShorts.upsert: missing weekId')

  const idx = trainingWeeks.findIndex((x) => normalizeWeekId(x?.weekId) === weekId)

  if (idx === -1) {
    trainingWeeks.push({
      ...w,
      weekId,
      createdAt: w.createdAt || now,
      updatedAt: now,
    })
  } else {
    const cur = trainingWeeks[idx] || {}
    trainingWeeks[idx] = {
      ...cur,
      ...w,
      weekId,
      createdAt: cur.createdAt || w.createdAt || now,
      updatedAt: now,
    }
  }

  return {
    ...tt,
    trainingWeeks,
    updatedAt: now,
  }
}

export const upsertWeekDraftIntoTeamsTrainingList = ({ list, draft, now = Date.now() } = {}) => {
  const teamId = clean(draft?.teamId)
  if (!teamId) throw new Error('trainingsShorts.upsert: missing teamId')

  const week = buildWeekFromDraft({ draft, now })

  const { list: nextList, teamIndex } = upsertTeamTrainingInList({
    list,
    teamId,
    now,
  })

  const teamTraining = nextList[teamIndex]

  nextList[teamIndex] = upsertWeekInTeamTraining({
    teamTraining,
    week,
    now,
  })

  return {
    list: nextList,
    teamTraining: nextList[teamIndex],
    week,
  }
}
