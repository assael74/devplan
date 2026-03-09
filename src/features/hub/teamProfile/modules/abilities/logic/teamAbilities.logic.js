// teamProfile/modules/abilities/logic/teamAbilities.logic.js

import { groupAbilitiesByDomain } from '../../../../../../shared/abilities/abilities.grouping.js'
import { abilitiesList } from '../../../../../../shared/abilities/abilities.list.js'

const safeNum = (v) => (typeof v === 'number' && !Number.isNaN(v) ? v : null)
const safeInt = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)

const buildAvgMapFromByAbilityId = (byAbilityId = {}, { scale = 1 } = {}) => {
  const res = {}
  ;(abilitiesList || []).forEach(({ id }) => {
    const avg = safeNum(byAbilityId?.[id]?.avg)
    res[id] = avg ? avg * scale : 0
  })
  return res
}

export function buildTeamAbilityDomains(abilitiesTeam, { scale = 1 } = {}) {
  const t = abilitiesTeam || {}
  const byAbilityId = t.byAbilityId || {}
  const totalPlayers = safeInt(t.totalPlayers)

  // מקור אמת לכיסוי איכות כללית
  const teamUsedCount = safeInt(t?.level?.usedCount)

  const avgMap = buildAvgMapFromByAbilityId(byAbilityId, { scale })
  const domains = groupAbilitiesByDomain(avgMap) || []

  return domains.map((d) => {
    const items = (d.items || []).map((it) => {
      const src = byAbilityId[it.id] || {}
      return {
        ...it,
        count: safeInt(src.count),
        missing: safeInt(src.missing),
        min: safeNum(src.min),
        max: safeNum(src.max),
      }
    })

    return {
      ...d,
      items,
      totalPlayers,
      usedPlayers: teamUsedCount,
    }
  })
}

export function buildTeamAbilitiesKpi(abilitiesTeam, domains = []) {
  const t = abilitiesTeam || {}
  const totalPlayers = safeInt(t.totalPlayers)

  const usedPlayers = safeInt(t?.level?.usedCount)
  const usedPlayersPotential = safeInt(t?.levelPotential?.usedCount)

  const items = (domains || []).flatMap((d) => d.items || [])
  const totalAbilities = items.length

  const filledItems = items.filter((x) => typeof x.value === 'number' && x.value > 0)
  const filledAbilities = filledItems.length

  const avgAll = filledItems.length ? filledItems.reduce((s, x) => s + x.value, 0) / filledItems.length : NaN

  return {
    totalAbilities,
    filledAbilities,
    avgAll,
    totalPlayers,
    usedPlayers,
    usedPlayersPotential,
  }
}
