// features/playersDatabase/components/profilesPage/logic/utils.js

export const clean = value => String(value == null ? '' : value).trim()

export const unique = values =>
  Array.from(new Set((values || []).filter(Boolean)))

export const valueOrDash = value => clean(value) || '-'

export const listText = value => {
  if (!Array.isArray(value) || !value.length) return valueOrDash(value)
  return value.filter(Boolean).join(', ')
}

export const mergeCountMaps = maps =>
  (maps || []).reduce((result, map = {}) => {
    Object.entries(map || {}).forEach(([key, value]) => {
      const id = clean(key)
      if (!id) return
      result[id] = (result[id] || 0) + (Number(value) || 0)
    })

    return result
  }, {})
