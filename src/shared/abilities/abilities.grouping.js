// shared/abilities/abilities.grouping.js
import { abilitiesList } from './abilities.list'
import { toNum } from './abilities.utils'

export function groupAbilitiesByDomain(abilities = {}) {
  const grouped = {}

  for (const { id, label, domain, domainLabel, weight } of abilitiesList) {
    if (!grouped[domain]) grouped[domain] = { domain, domainLabel, items: [] }

    const raw = abilities?.[id]
    const value = raw == null || raw === '' ? null : toNum(raw, null)

    grouped[domain].items.push({
      id,
      label,
      weight: toNum(weight, 1),
      value, // null = לא דורג
    })
  }

  return Object.values(grouped)
}
