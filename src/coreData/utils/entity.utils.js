// C:\projects\devplan\src\features\coreData\utils\entity.utils.js

import { safeId, safeArr, normalizeIds } from './data.utils.js'
import { mapBy, pushToMapArray, uniqById } from './map.utils.js'

export const getByPath = (obj, path) =>
  path.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj)

export const ensureEntityMap = (arr, { idKey = 'id', extraKeys = [] } = {}) =>
  mapBy(arr, (item) => [
    getByPath(item, idKey),
    ...extraKeys.map((k) => getByPath(item, k)),
  ])

export const buildArrayIndex = (arr, getKeys) => {
  const map = new Map()

  for (const item of safeArr(arr)) {
    const keys = safeArr(getKeys(item))
    for (const key of keys) pushToMapArray(map, key, item)
  }

  for (const [key, list] of map.entries()) map.set(key, uniqById(list))
  return map
}

export const getPlayerIdsFromMeeting = (meeting) => {
  const a = normalizeIds(meeting?.playerId)
  const b = normalizeIds(meeting?.playersId)
  return Array.from(new Set([...a, ...b]))
}

export const pickFirstId = (...vals) => {
  for (const val of vals) {
    if (Array.isArray(val)) {
      const first = safeId(val[0])
      if (first) return first
      continue
    }

    const id = safeId(val)
    if (id) return id
  }

  return ''
}
