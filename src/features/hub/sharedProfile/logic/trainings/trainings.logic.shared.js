// src/features/hub/sharedProfile/logic/trainings/trainings.logic.shared.js

export {
  buildTrainingsModel,
  buildTrainingsHeaderStats,
} from './trainings.model.shared.js'

export {
  getCompactTrainingLabel,
  getCompactTrainingSubLabel,
  formatDurationLabel,
  buildWeekRangeLabel,
  formatShortDateIl,
} from './trainings.format.shared.js'

export {
  getStartOfWeekSunday,
  toLocalYmd,
  toValidDate,
  startOfToday,
} from './trainings.date.shared.js'

export {
  addDaysToWeekId,
  buildWeekMeta,
} from './trainings.week.shared.js'
