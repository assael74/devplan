import { safeArr, safeId } from './data.utils.js'

export const pushToMapArray = (map, key, value) => {
  const k = safeId(key)
  if (!k) return
  if (!map.has(k)) map.set(k, [])
  map.get(k).push(value)
}

export const uniqBy = (arr, getKey) => {
  const map = new Map()

  for (const item of safeArr(arr)) {
    const key = getKey(item)
    if (!key) continue
    if (!map.has(key)) map.set(key, item)
  }

  return Array.from(map.values())
}

export const uniqById = (arr) => uniqBy(arr, (x) => safeId(x?.id))

export const mapBy = (arr, getKeys) => {
  const map = new Map()

  for (const item of safeArr(arr)) {
    const keys = safeArr(getKeys(item))
    for (const key of keys) {
      const id = safeId(key)
      if (id) map.set(id, item)
    }
  }

  return map
}
