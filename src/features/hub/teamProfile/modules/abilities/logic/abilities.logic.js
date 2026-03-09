// teamProfile/modules/abilities/logic/abilities.logic.js

export const DOMAIN_ACCENT = {
  mental: 'success',
  physical: 'success',
  technical: 'success',
  tactical: 'success',
  gameUnderstanding: 'success',
  cognitive: 'success',
  development: 'success',
}

export const isFilled = (v) =>
  typeof v === 'number' && v > 0 && !Number.isNaN(v)

export const toFixed1 = (n) =>
  Number.isFinite(n) ? (Math.round(n * 10) / 10).toFixed(1) : '—'

export const clamp0to5 = (v) =>
  Number.isFinite(v) ? Math.min(5, Math.max(0, v)) : 0

export function scoreColor(v) {
  if (!Number.isFinite(v)) return 'neutral'
  if (v >= 4) return 'success'
  if (v >= 3) return 'primary'
  if (v > 0) return 'warning'
  return 'neutral'
}

export function calcDomainScore(items = []) {
  const filledItems = items.filter((i) => isFilled(i.value))
  if (!filledItems.length) return NaN

  const hasWeights = filledItems.some(
    (i) => typeof i.weight === 'number' && i.weight > 0
  )

  if (hasWeights) {
    const wSum = filledItems.reduce((s, i) => s + (i.weight || 0), 0)
    if (!wSum) return NaN
    return (
      filledItems.reduce((s, i) => s + i.value * (i.weight || 0), 0) / wSum
    )
  }

  return filledItems.reduce((s, i) => s + i.value, 0) / filledItems.length
}

export function comparePlayerToSlice(player, slice) {
  const res = []

  const pMap = player?.abilities?.byAbilityId || {}
  const sMap = slice?.byAbilityId || {}

  Object.keys(pMap).forEach((abilityId) => {
    const pVal = Number(pMap[abilityId]?.value)
    const sAvg = Number(sMap[abilityId]?.avg)
    const used = Number(sMap[abilityId]?.count)

    if (!pVal || !sAvg || !used) return

    res.push({
      abilityId,
      playerValue: pVal,
      sliceAvg: sAvg,
      delta: +(pVal - sAvg).toFixed(1),
      usedCount: used,
    })
  })

  return res
}
