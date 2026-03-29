// teamProfile/modules/abilities/logic/teamAbilities.logic.js

import { groupAbilitiesByDomain } from '../../../../../../shared/abilities/abilities.grouping.js'
import { abilitiesList } from '../../../../../../shared/abilities/abilities.list.js'

const safeNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const safeInt = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function buildAvgMapFromSlice(slice = {}, { scale = 1 } = {}) {
  const byAbilityId = slice?.byAbilityId || {}
  const result = {}

  ;(abilitiesList || []).forEach(({ id }) => {
    const avg = safeNum(byAbilityId?.[id]?.avg)
    result[id] = avg ? avg * scale : 0
  })

  return result
}

export function buildTeamAbilityDomains(slice, { scale = 1 } = {}) {
  const avgMap = buildAvgMapFromSlice(slice, { scale })
  const domains = groupAbilitiesByDomain(avgMap) || []

  return domains.map((domain) => {
    const items = (domain?.items || []).map((item) => {
      const src = slice?.byAbilityId?.[item.id] || {}

      return {
        ...item,
        count: safeInt(src?.count),
        missing: safeInt(src?.missing),
        min: safeNum(src?.min),
        max: safeNum(src?.max),
      }
    })

    return {
      ...domain,
      items,
      totalPlayers: safeInt(slice?.playersRaw),
      usedPlayers: safeInt(slice?.level?.usedCount),
      usedPlayersPotential: safeInt(slice?.levelPotential?.usedCount),
      totalWeight: safeNum(slice?.weight) ?? 0,
    }
  })
}

export function buildTeamAbilitiesKpi(slice, domains = []) {
  const items = (domains || []).flatMap((domain) => domain?.items || [])
  const filledItems = items.filter((item) => typeof item?.value === 'number' && item.value > 0)

  const avgAll = filledItems.length
    ? filledItems.reduce((sum, item) => sum + item.value, 0) / filledItems.length
    : NaN

  return {
    totalAbilities: items.length,
    filledAbilities: filledItems.length,
    avgAll,
    totalPlayers: safeInt(slice?.playersRaw),
    usedPlayers: safeInt(slice?.level?.usedCount),
    usedPlayersPotential: safeInt(slice?.levelPotential?.usedCount),
    totalWeight: safeNum(slice?.weight) ?? 0,
  }
}
