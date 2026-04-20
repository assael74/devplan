//  playerProfile/sharedLogic/trainings/trainings.week.js

import { normalizeWeekId } from '../../../../../shared/trainings'
import { toLocalYmd, toValidDate } from './trainings.date.js'

export const addDaysToWeekId = (weekId, daysToAdd) => {
  const wid = normalizeWeekId(weekId)
  if (!wid) return ''

  const d = new Date(`${wid}T00:00:00`)
  if (Number.isNaN(d.getTime())) return ''

  d.setDate(d.getDate() + (Number(daysToAdd) || 0))
  return toLocalYmd(d)
}

export const buildWeekMeta = (weekId) => {
  const wid = normalizeWeekId(weekId)
  if (!wid) {
    return {
      weekId: '',
      startDate: null,
      endDate: null,
      rangeLabel: '',
    }
  }

  const startDate = toValidDate(`${wid}T00:00:00`)
  const endDate = startDate ? new Date(startDate) : null

  if (endDate) endDate.setDate(endDate.getDate() + 6)

  return {
    weekId: wid,
    startDate,
    endDate,
  }
}
