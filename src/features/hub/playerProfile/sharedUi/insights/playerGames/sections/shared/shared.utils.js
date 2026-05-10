// playerProfile/sharedUi/insights/playerGames/sections/shared/shared.utils.js

const JOY_COLORS = [
  'primary',
  'neutral',
  'danger',
  'success',
  'warning',
]

export const normalizeColor = (value, fallback = 'neutral') => {
  if (JOY_COLORS.includes(value)) return value
  return fallback
}

export const safeArray = (value) => {
  return Array.isArray(value) ? value.filter(Boolean) : []
}
