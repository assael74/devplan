// src/features/playersDatabase/components/scan/logic/utils.js

export const clean = value => String(value ?? '').trim()

export const unique = values => Array.from(new Set((values || []).filter(Boolean)))

export const valueOrDash = value => clean(value) || '-'

export const listText = value => Array.isArray(value) && value.length ? value.filter(Boolean).join(', ') : valueOrDash(value)

export const mergeCountMaps = maps => (maps || []).reduce((acc, map = {}) => {
  Object.entries(map || {}).forEach(([key, value]) => {
    const id = clean(key)
    if (!id) return
    acc[id] = (acc[id] || 0) + (Number(value) || 0)
  })
  return acc
}, {})
