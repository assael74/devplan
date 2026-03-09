// shared/abilities/abilities.domain.logic.js
import { abilitiesList } from './abilities.list'
import { isRated, roundTo, toNum, scoreColor } from './abilities.utils'

// משקלים – תומך ב־entity.abilityWeights או items
function resolveWeights(entity) {
  const w1 = entity?.abilityWeights
  if (w1 && typeof w1 === 'object') {
    if (w1.items && typeof w1.items === 'object') return w1.items
    return w1
  }
  return {}
}

// ערכי יכולות – תומך בכמה מבנים + קריאה עם { abilities }
function resolveAbilitiesValues(entity) {
  return (
    entity?.abilities ||
    entity?.playerAbilities ||
    entity?.playersAbilities ||
    entity?.playerAbilitiesValues ||
    {}
  )
}

// ממוצע דומיין (משוקלל אם יש weights>0), תוך החרגת weight<=0 מה־level
function calcDomainAvg(items = []) {
  const filled = items.filter((i) => isRated(i.value))

  // abilities עם weight<=0 לא נכנסות למדד level
  const effective = filled.filter((i) => (toNum(i.weight, 1) || 0) > 0)
  if (!effective.length) return NaN

  const hasWeights = effective.some((i) => Number.isFinite(i.weight) && i.weight > 0)
  if (hasWeights) {
    const wSum = effective.reduce((s, i) => s + (toNum(i.weight, 0) || 0), 0)
    if (!wSum) return NaN
    return effective.reduce((s, i) => s + toNum(i.value, 0) * (toNum(i.weight, 0) || 0), 0) / wSum
  }

  return effective.reduce((s, i) => s + toNum(i.value, 0), 0) / effective.length
}

// בניית דומיינים לפי abilitiesList (SoT)
function buildDomainsFromList({ values, weights }) {
  const map = new Map()

  for (const a of abilitiesList) {
    if (!map.has(a.domain)) {
      map.set(a.domain, {
        domain: a.domain,
        domainLabel: a.domainLabel || a.domain,
        items: [],
      })
    }

    const rawVal = values?.[a.id]
    const value = Number.isFinite(Number(rawVal)) ? Number(rawVal) : NaN

    const wRaw = weights?.[a.id]
    const weight = Number.isFinite(Number(wRaw))
      ? Number(wRaw)
      : Number.isFinite(Number(a.weight))
      ? Number(a.weight)
      : 1

    map.get(a.domain).items.push({
      id: a.id,
      label: a.label,
      description: a.description || '',
      value,
      weight,
    })
  }

  return Array.from(map.values())
}

// --- API גנרי ---
export function resolveAbilitiesDomain(entity = {}) {
  const values = resolveAbilitiesValues(entity)
  const weights = resolveWeights(entity)

  const domainsBase = buildDomainsFromList({ values, weights })

  const domains = domainsBase.map((d) => {
    const items = d.items || []

    // Completion: נספר רק יכולות עם weight>0 (weight=0 = מידע נלווה)
    const countable = items.filter((i) => (toNum(i.weight, 1) || 0) > 0)
    const filled = countable.filter((i) => isRated(i.value)).length
    const total = countable.length

    const avgRaw = calcDomainAvg(items)
    const avg = roundTo(avgRaw, 1)
    const avgNum = Number.isFinite(Number(avg)) ? Number(avg) : NaN

    return {
      domain: d.domain,
      domainLabel: d.domainLabel,
      filled,
      total,
      avg: Number.isFinite(avgNum) ? avgNum : NaN,
      color: scoreColor(avgNum),
      items,
    }
  })

  // סיכום כללי: completion + avgAll רק על weight>0
  const totalAll = domains.reduce((s, d) => s + (d.total || 0), 0)
  const filledAll = domains.reduce((s, d) => s + (d.filled || 0), 0)

  const allFilledVals = []
  for (const d of domains) {
    for (const it of d.items || []) {
      if ((toNum(it.weight, 1) || 0) <= 0) continue
      if (isRated(it.value)) allFilledVals.push(toNum(it.value, NaN))
    }
  }

  const avgAllRaw = allFilledVals.length
    ? allFilledVals.reduce((s, x) => s + toNum(x, 0), 0) / allFilledVals.length
    : NaN

  const avgAll = roundTo(avgAllRaw, 1)
  const avgAllNum = Number.isFinite(Number(avgAll)) ? Number(avgAll) : NaN

  const withAvg = domains.filter((d) => Number.isFinite(d.avg))
  const strongest = withAvg.length ? withAvg.reduce((a, b) => (a.avg >= b.avg ? a : b)) : null
  const weakest = withAvg.length ? withAvg.reduce((a, b) => (a.avg <= b.avg ? a : b)) : null

  return {
    summary: {
      total: totalAll,
      filled: filledAll,
      avgAll: Number.isFinite(avgAllNum) ? avgAllNum : NaN,
      strongest,
      weakest,
    },
    domains,
  }
}
