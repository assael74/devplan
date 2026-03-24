// C:\projects\devplan\src\shared\Trainings\trainingsWeek.model.js

export const TRAINING_DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export const DEFAULT_WEEK_TITLE = 'אימון'
export const DEFAULT_WEEK_STATUS = 'planned'

export const TRAINING_TYPES = [
  { id: 'tactical', labelH: 'טקטי', idIcon: 'tactical', color: 'primary' },
  { id: 'technical', labelH: 'טכני', idIcon: 'technical', color: 'success' },
  { id: 'fitness', labelH: 'כושר', idIcon: 'fitness', color: 'warning' },
  { id: 'smallSidedGame', labelH: 'משחקון', idIcon: 'smallSidedGame', color: 'neutral' },
  { id: 'recovery', labelH: 'שחרור', idIcon: 'recovery', color: 'danger' },
]

export const TRAINING_DAY_LABELS = {
  sun: "א׳",
  mon: "ב׳",
  tue: "ג׳",
  wed: "ד׳",
  thu: "ה׳",
  fri: "ו׳",
  sat: "ש׳",
}

export const TRAINING_STATUS_META = {
  planned: { labelH: 'מתוכנן', color: 'primary', idIcon: 'planned' },
  completed: { labelH: 'בוצע', color: 'success', idIcon: 'completed' },
  canceled: { labelH: 'בוטל', color: 'danger', idIcon: 'canceled' },
  postponed: { labelH: 'נדחה', color: 'warning', idIcon: 'postponed' },
}

export const DEFAULT_TRAINING_DAY = {
  hour: '',
  duration: 90,
  type: 'technical',
  location: '',
  notes: '',
  enabled: false,
  status: DEFAULT_WEEK_STATUS,
}

export const EMPTY_TRAINING_DAY = {
  hour: '',
  duration: 0,
  type: '',
  location: '',
  enabled: false,
  status: '',
}
