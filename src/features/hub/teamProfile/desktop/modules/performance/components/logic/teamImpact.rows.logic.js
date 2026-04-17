// src/features/teams/teamProfile/modules/performance/components/logic/teamImpact.rows.logic.js
import { buildHaystack, sortRows, matchByLayer, matchByPos } from './performanceModal.logic'

export function buildRowsForView(domainRows, viewMode) {
  return (domainRows || []).map((r) => {
    const raw = r.stats || {}
    const can = r?.statsMeta?.canNormalize === true
    const stats = viewMode === 'norm' && can ? r.statsNorm || raw : raw

    return {
      ...r,
      __statsRaw: raw,
      stats,
    }
  })
}

export function filterAndSortRows({
  rows,
  q,
  onlyUsable,
  layerMode,
  posMode,
  sortKey,
  sortDir,
  layerToCodes,
}) {
  const search = String(q || '').trim().toLowerCase()

  const base = (rows || []).filter((r) => {
    if (onlyUsable && !r.usable) return false
    if (!matchByLayer(r, layerMode, layerToCodes)) return false
    if (!matchByPos(r, posMode)) return false
    if (!search) return true
    return buildHaystack(r).includes(search)
  })

  return sortRows(base, sortKey, sortDir)
}
