import { safeArr } from './_utils/array.utils'

export function buildVideoTagChips(videos, limit = 8) {
  const map = {}

  safeArr(videos).forEach((v) => {
    safeArr(v?.tags).forEach((tag) => {
      if (!tag) return
      map[tag] = (map[tag] || 0) + 1
    })
  })

  return Object.entries(map)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
