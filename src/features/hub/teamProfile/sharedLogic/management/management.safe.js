// teamProfile/sharedLogic/management/management.safe.js

export const safeNum = (value, fallback = 0) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

export const safeText = (value, fallback = '') => {
  if (value == null) return fallback
  return String(value).trim() || fallback
}
