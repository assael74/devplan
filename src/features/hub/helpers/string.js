// src/features/hub/helpers/string.js
export function normalizeStr(s) {
  return String(s ?? '').trim().toLowerCase()
}
