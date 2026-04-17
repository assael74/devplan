// playerProfile/modules/abilities/logic/abilities.logic.js

import { fmtScore, scoreColor } from '../../../../../../../shared/abilities/abilities.utils.js'
import { resolvePlayerAbilitiesMap } from '../../../../../../../shared/abilities/abilities.resolvers.js'

export const DOMAIN_ACCENT = {
  mental: 'success',
  physical: 'success',
  technical: 'success',
  tactical: 'success',
  gameUnderstanding: 'success',
  cognitive: 'success',
  development: 'success',
}

export function isFilled(v) {
  return typeof v === 'number' && v > 0 && !Number.isNaN(v)
}

export function clamp0to5(v) {
  return Number.isFinite(v) ? Math.min(5, Math.max(0, v)) : 0
}

export function toFixed1(n) {
  return fmtScore(n)
}

export function calcDomainScore(items = []) {
  const filledItems = items.filter((item) => isFilled(item?.value))
  if (!filledItems.length) return NaN

  const hasWeights = filledItems.some(
    (item) => typeof item?.weight === 'number' && item.weight > 0
  )

  if (hasWeights) {
    const weightSum = filledItems.reduce((sum, item) => sum + (item.weight || 0), 0)
    if (!weightSum) return NaN

    return (
      filledItems.reduce((sum, item) => sum + item.value * (item.weight || 0), 0) /
      weightSum
    )
  }

  return filledItems.reduce((sum, item) => sum + item.value, 0) / filledItems.length
}

export function getScoreColor(value) {
  return scoreColor(value)
}

export function comparePlayerToSlice(player, slice) {
  const result = []

  const playerAbilities = resolvePlayerAbilitiesMap(player)
  const sliceMap = slice?.byAbilityId || {}

  Object.keys(sliceMap).forEach((abilityId) => {
    const playerValue = Number(playerAbilities?.[abilityId])
    const sliceAvg = Number(sliceMap?.[abilityId]?.avg)
    const usedCount = Number(sliceMap?.[abilityId]?.count)

    if (!playerValue || !sliceAvg || !usedCount) return

    result.push({
      abilityId,
      playerValue,
      sliceAvg,
      delta: +(playerValue - sliceAvg).toFixed(1),
      usedCount,
    })
  })

  return result.sort((a, b) => b.delta - a.delta)
}
