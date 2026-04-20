//  playerProfile/sharedLogic/trainings/trainings.logic.js

export {
  buildTrainingsModel,
  buildTrainingsHeaderStats,
} from './trainings.model.js'

export {
  getCompactTrainingLabel,
  getCompactTrainingSubLabel,
  formatDurationLabel,
  buildWeekRangeLabel,
  formatShortDateIl,
} from './trainings.format.js'

export {
  getStartOfWeekSunday,
  toLocalYmd,
  toValidDate,
  startOfToday,
} from './trainings.date.js'

export {
  addDaysToWeekId,
  buildWeekMeta,
} from './trainings.week.js'
