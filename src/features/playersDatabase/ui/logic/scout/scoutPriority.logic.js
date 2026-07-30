// features/playersDatabase/ui/logic/scout/scoutPriority.logic.js

import { SCOUT_PRIORITY_DISPLAY } from './scoutDisplay.constants.js'

export function resolveScoutPriority(value) {
  return SCOUT_PRIORITY_DISPLAY[value] || SCOUT_PRIORITY_DISPLAY.neutral
}

export function formatRate(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'
  return `${Math.round(Number(value))}%`
}

export function formatScore(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'
  return `${Math.round(Number(value))}`
}
