// features/playersDatabase/ui/logic/scoutDisplay.logic.js

export const SCOUT_PRIORITY_DISPLAY = {
  elite: { label: 'יעד מוביל', tone: 'elite' },
  high: { label: 'עדיפות גבוהה', tone: 'high' },
  positive: { label: 'חיובי', tone: 'positive' },
  neutral: { label: 'רגיל', tone: 'neutral' },
  low: { label: 'עדיפות נמוכה', tone: 'low' },
}

export function resolveScoutPriority(value) {
  return SCOUT_PRIORITY_DISPLAY[value] || SCOUT_PRIORITY_DISPLAY.neutral
}

export function formatRate(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'
  return `${Math.round(Number(value))}%`
}
