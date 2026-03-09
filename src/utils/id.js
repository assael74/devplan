// utils/id.js
export function makeId(prefix = "") {
  const rand = crypto.randomUUID().slice(0, 8)
  const ts = Date.now().toString(36)

  return prefix
    ? `${prefix}_${ts}_${rand}`
    : `${ts}_${rand}`
}
