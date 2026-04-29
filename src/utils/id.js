// src/utils/id.js

function getSafeRandomPart() {
  const hasRandomUuid =
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'

  if (hasRandomUuid) {
    return crypto.randomUUID().slice(0, 8)
  }

  return Math.random().toString(36).slice(2, 10)
}

export function makeId(prefix = '') {
  const rand = getSafeRandomPart()
  const ts = Date.now().toString(36)

  return prefix
    ? `${prefix}_${ts}_${rand}`
    : `${ts}_${rand}`
}
