//  playerProfile/sharedLogic/trainings/trainings.model.js

import {
  flattenTrainingWeeks,
  groupTrainingRowsByWeek,
} from '../../../../../shared/trainings'

import { getStartOfWeekSunday } from './trainings.date.js'
import { addDaysToWeekId, buildWeekMeta } from './trainings.week.js'
import { buildWeekRangeLabel } from './trainings.format.js'

const createEmptyWeekGroup = (weekId) => ({
  weekId,
  rows: [],
})

const buildWeekSummary = ({
  allRows = [],
  currentWeekRows = [],
  nextWeekRows = [],
} = {}) => {
  return {
    totalTrainings: (Array.isArray(allRows) ? allRows : []).filter((row) => !row?.isEmpty).length,
    currentWeekCount: (Array.isArray(currentWeekRows) ? currentWeekRows : []).filter((row) => !row?.isEmpty).length,
    nextWeekCount: (Array.isArray(nextWeekRows) ? nextWeekRows : []).filter((row) => !row?.isEmpty).length,
  }
}

export const buildTrainingsModel = ({
  entity = null,
  trainingWeeks = null,
  selectedWeekId = '',
} = {}) => {
  const weeks =
    trainingWeeks ||
    entity?.trainingWeeks ||
    entity?.training ||
    entity?.weeksList ||
    []

  const currentWeekId = selectedWeekId || getStartOfWeekSunday(new Date())
  const nextWeekId = addDaysToWeekId(currentWeekId, 7)

  const weekGroups = groupTrainingRowsByWeek({
    trainingWeeks: weeks,
    fillMissingDays: true,
  })

  const allRows = flattenTrainingWeeks({ trainingWeeks: weeks })

  const rawCurrentWeek =
    weekGroups.find((x) => x.weekId === currentWeekId) || createEmptyWeekGroup(currentWeekId)

  const rawNextWeek =
    weekGroups.find((x) => x.weekId === nextWeekId) || createEmptyWeekGroup(nextWeekId)

  const currentMeta = buildWeekMeta(rawCurrentWeek.weekId)
  const nextMeta = buildWeekMeta(rawNextWeek.weekId)

  const summary = buildWeekSummary({
    allRows,
    currentWeekRows: rawCurrentWeek.rows,
    nextWeekRows: rawNextWeek.rows,
  })

  return {
    currentWeek: rawCurrentWeek,
    nextWeek: rawNextWeek,
    summary,
    currentWeekId,
    nextWeekId,
    currentWeekRangeLabel: buildWeekRangeLabel(currentMeta.startDate, currentMeta.endDate),
    nextWeekRangeLabel: buildWeekRangeLabel(nextMeta.startDate, nextMeta.endDate),
  }
}

export const buildTrainingsHeaderStats = (model) => {
  const summary = model?.summary || {}

  return [
    { id: 'all', label: 'סה״כ', value: summary.totalTrainings || 0, color: 'neutral' },
    { id: 'current', label: 'השבוע', value: summary.currentWeekCount || 0, color: 'primary' },
    { id: 'next', label: 'שבוע הבא', value: summary.nextWeekCount || 0, color: 'success' },
  ]
}
