// teamProfile/modules/abilities/logic/abilities.drilldown.logic.js

const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)

const getPlayerName = (p) => [p?.playerFirstName, p?.playerLastName].filter(Boolean).join(' ')

const getPlayerPosText = (p) => {
  const arr = Array.isArray(p?.positions) ? p.positions : []
  const uniq = Array.from(new Set(arr.filter(Boolean)))
  return uniq.length ? uniq.join(', ') : '—'
}

const hasPos = (p, posCode) => {
  if (!posCode || posCode === 'all') return true
  const arr = Array.isArray(p?.positions) ? p.positions : []
  return arr.includes(posCode)
}

export function buildAbilityPlayersRows(players, abilityId, { posCode = 'all', minVal = 0 } = {}) {
  const arr = Array.isArray(players) ? players : []

  return arr
    .filter((p) => hasPos(p, posCode))
    .map((p) => {
      const v = safeNum(p?.abilities?.[abilityId])
      return {
        id: p?.id,
        name: getPlayerName(p),
        pos: getPlayerPosText(p),
        photoUrl: p?.photo || null,
        value: v,
        raw: p,
      }
    })
    .filter((r) => r.value > Math.max(0, safeNum(minVal)))
    .sort((a, b) => b.value - a.value)
}

export function buildDomainPlayersRows(players, domainAbilityIds, { posCode = 'all', minFilled = 1 } = {}) {
  const ids = Array.isArray(domainAbilityIds) ? domainAbilityIds.filter(Boolean) : []
  const arr = Array.isArray(players) ? players : []

  return arr
    .filter((p) => hasPos(p, posCode))
    .map((p) => {
      const vals = ids.map((id) => safeNum(p?.abilities?.[id]))
      const filled = vals.filter((x) => x > 0)
      const avg = filled.length ? filled.reduce((s, x) => s + x, 0) / filled.length : 0

      const row = {
        id: p?.id,
        name: getPlayerName(p),
        pos: getPlayerPosText(p),
        photoUrl: p?.photo || null,
        avg: Number(avg.toFixed(1)),
        filledCount: filled.length,
        raw: p,
      }

      // להוסיף עמודות לכל יכולת בדומיין
      ids.forEach((id, idx) => {
        row[`a${idx + 1}`] = safeNum(p?.abilities?.[id]) || 0
        row[`ability:${id}`] = safeNum(p?.abilities?.[id]) || 0
      })

      return row
    })
    .filter((r) => r.filledCount >= Math.max(1, Number(minFilled) || 1))
    .sort((a, b) => b.avg - a.avg)
}
