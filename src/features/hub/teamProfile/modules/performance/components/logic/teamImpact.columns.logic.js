// src/features/teams/teamProfile/modules/performance/components/logic/teamImpact.columns.logic.js

const tripletMiniLabel = (sp, key) => {
  const id = String(sp?.id || key || '')
  if (id.endsWith('SuccessRate')) return '%'
  if (id.endsWith('Success')) return '+'
  if (id.endsWith('Total')) return 'סה"כ'
  return sp?.statsParmShortName || sp?.statsParmName || key
}

const tripletRank = (sp, key) => {
  const id = String(sp?.id || key || '')
  if (id.endsWith('SuccessRate')) return 2
  if (id.endsWith('Success')) return 1
  if (id.endsWith('Total')) return 0
  return 9
}

const tripletColsSorter = (a, b) => {
  return (
    (a.order - b.order) ||
    String(a.group).localeCompare(String(b.group)) ||
    (a.subOrder - b.subOrder) ||
    (b.cov - a.cov) ||
    String(a.label).localeCompare(String(b.label))
  )
}

export function buildDynamicCols({
  availableStatsParm,
  coverage,
  preset,
  getStatsParmKey,
  BASE_KEYS,
  presetMatch,
}) {
  const max = preset === 'all' ? 14 : 10

  const list = (availableStatsParm || [])
    .filter((sp) => presetMatch(preset, sp))
    .map((sp) => {
      const key = getStatsParmKey(sp)
      const group = String(sp?.tripletGroup || '')
      const cov = coverage[key] || 0

      return {
        key,
        group,
        cov,
        order: sp?.order ?? 999,
        subOrder: group ? tripletRank(sp, key) : 9,
        label: group ? tripletMiniLabel(sp, key) : (sp?.statsParmShortName || sp?.statsParmName || key),
      }
    })
    .filter((c) => c.key && !BASE_KEYS.has(c.key))

  return list.slice().sort(tripletColsSorter).slice(0, max)
}
