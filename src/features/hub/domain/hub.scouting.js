// features/hub/domain/hub.scouting.js
const asArray = (x) => (Array.isArray(x) ? x : [])

const uniqBy = (arr, keyFn) => {
  const seen = new Set()
  const out = []
  for (const item of asArray(arr)) {
    const k = keyFn(item)
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(item)
  }
  return out
}

export function buildScoutingPlayers(coreScouting, playersById) {
  const src = asArray(coreScouting)

  const directPlayers = src.filter((x) => x?.id)
  if (directPlayers.length) return uniqBy(directPlayers, (x) => x?.id)

  const ids = uniqBy(
    src.map((x) => x?.playerId || x?.id || null).filter(Boolean),
    (x) => x
  )

  return ids.map((id) => playersById[id]).filter(Boolean)
}
