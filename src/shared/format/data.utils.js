// src/shared/utils/data.utils.js

export const safeArr = (val) => {
  if (Array.isArray(val)) return val
  if (val === null || val === undefined) return []
  return [val]
}

export const safeId = (val) => {
  if (val === null || val === undefined) return ''
  if (typeof val === 'string') return val.trim()
  if (typeof val === 'number') return String(val)
  if (typeof val === 'object') {
    if (val.id) return String(val.id)
    if (val._id) return String(val._id)
  }
  return ''
}
