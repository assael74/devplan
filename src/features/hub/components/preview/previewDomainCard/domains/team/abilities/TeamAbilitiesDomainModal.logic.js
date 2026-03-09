// TeamAbilitiesDomainModal.logic.js
import { isRated, safeStr, toNum } from '../../../../../../../../shared/abilities/abilities.utils'

// --- אופציות לסלקט דומיינים ---
export function buildDomainOptions(domains) {
  const list = Array.isArray(domains) ? domains : []
  return [{ id: 'all', label: 'כל הדומיינים' }, ...list.map((d) => ({ id: d.domain, label: d.domainLabel }))]
}

// --- סינון דומיינים/יכולות ---
export function filterDomains(domains, q, domainFilter, filledFilter) {
  const list = Array.isArray(domains) ? domains : []
  const search = safeStr(q).trim().toLowerCase()
  const df = safeStr(domainFilter).trim().toLowerCase()
  const ff = safeStr(filledFilter).trim().toLowerCase()

  return list
    .filter((d) => df === 'all' || df === safeStr(d?.domain).trim().toLowerCase())
    .map((d) => {
      const items = (d.items || []).filter((it) => {
        const filled = isRated(it?.value)
        if (ff === 'filled' && !filled) return false
        if (ff === 'missing' && filled) return false
        if (!search) return true
        return safeStr(it?.label).toLowerCase().includes(search) || safeStr(it?.id).toLowerCase().includes(search)
      })
      return items.length ? { ...d, items } : null
    })
    .filter(Boolean)
}

// --- כיסוי עבור דומיין (לפי רשימת היכולות המוצגות) ---
export function sumCoverageForItems(coverageMap, items) {
  let count = 0
  let missing = 0

  for (const it of Array.isArray(items) ? items : []) {
    const c = coverageMap?.[it?.id]
    if (!c) continue
    count += toNum(c?.count, 0)
    missing += toNum(c?.missing, 0)
  }

  return { count, missing }
}
