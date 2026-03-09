import { safeArr } from './_utils/array.utils'
import { toIso } from './_utils/date.utils'

export function buildGamesHomePreview(games, now = new Date()) {
  const past = []
  const future = []

  safeArr(games).forEach((g) => {
    const d = new Date(toIso(g?.date))
    if (!Number.isFinite(d.getTime())) return
    if (d < now && !g?.analysisDone) past.push(g)
    if (d >= now) future.push(g)
  })

  return {
    recentPending: past.slice(0, 5),
    upcoming: future.slice(0, 5),
  }
}
