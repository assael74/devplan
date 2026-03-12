// shared/abilities/abilities.domain.logic.js

import { abilitiesList } from './abilities.list'
import { isRated, roundTo, toNum, scoreColor, fmtScore } from './abilities.utils'

function resolveWeights(entity) {
  const w = entity?.abilityWeights
  if (!w || typeof w !== 'object') return {}
  if (w.items && typeof w.items === 'object') return w.items
  return w
}

function resolveAbilitiesValues(entity) {
  return (
    entity?.abilities ||
    entity?.playerAbilities ||
    entity?.playersAbilities ||
    entity?.playerAbilitiesValues ||
    {}
  )
}

function buildDomainsFromList({ values = {}, weights = {} }) {
  const map = new Map()

  for (const a of abilitiesList) {
    if (!map.has(a.domain)) {
      map.set(a.domain, {
        domain: a.domain,
        domainLabel: a.domainLabel || a.domain,
        items: [],
      })
    }

    const rawValue = values?.[a.id]
    const value = Number.isFinite(Number(rawValue)) ? Number(rawValue) : null

    const rawWeight = weights?.[a.id]
    const weight = Number.isFinite(Number(rawWeight))
      ? Number(rawWeight)
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

function calcDomainAvg(items = []) {
  const effective = items.filter((i) => (toNum(i.weight, 1) || 0) > 0 && isRated(i.value))
  if (!effective.length) return null

  const hasWeights = effective.some((i) => Number.isFinite(i.weight) && i.weight > 0)

  if (hasWeights) {
    const weightSum = effective.reduce((sum, i) => sum + (toNum(i.weight, 0) || 0), 0)
    if (!weightSum) return null

    const weightedSum = effective.reduce(
      (sum, i) => sum + toNum(i.value, 0) * (toNum(i.weight, 0) || 0),
      0
    )

    return roundTo(weightedSum / weightSum, 1)
  }

  return roundTo(
    effective.reduce((sum, i) => sum + toNum(i.value, 0), 0) / effective.length,
    1
  )
}

export function resolveAbilitiesDomain(entity = {}) {
  const values = resolveAbilitiesValues(entity)
  const weights = resolveWeights(entity)

  const domains = buildDomainsFromList({ values, weights }).map((domain) => {
    const items = domain.items || []
    const countable = items.filter((i) => (toNum(i.weight, 1) || 0) > 0)
    const ratedItems = countable.filter((i) => isRated(i.value))
    const avg = calcDomainAvg(items)

    return {
      domain: domain.domain,
      domainLabel: domain.domainLabel,
      items,
      total: countable.length,
      filled: ratedItems.length,
      avg,
      avgLabel: fmtScore(avg),
      color: scoreColor(avg),
      hasRated: ratedItems.length > 0,
    }
  })

  const ratedDomains = domains.filter((d) => d.hasRated && Number.isFinite(Number(d.avg)))

  const allRatedValues = []
  for (const d of domains) {
    for (const item of d.items || []) {
      if ((toNum(item.weight, 1) || 0) <= 0) continue
      if (!isRated(item.value)) continue
      allRatedValues.push(toNum(item.value, 0))
    }
  }

  const total = domains.reduce((sum, d) => sum + (d.total || 0), 0)
  const filled = domains.reduce((sum, d) => sum + (d.filled || 0), 0)

  const avgAll = allRatedValues.length
    ? roundTo(allRatedValues.reduce((sum, x) => sum + x, 0) / allRatedValues.length, 1)
    : null

  const strongest = ratedDomains.length
    ? ratedDomains.reduce((a, b) => (a.avg >= b.avg ? a : b))
    : null

  const weakest = ratedDomains.length
    ? ratedDomains.reduce((a, b) => (a.avg <= b.avg ? a : b))
    : null

  return {
    summary: {
      total,
      filled,
      completionPct: total > 0 ? roundTo((filled / total) * 100, 0) : 0,
      avgAll,
      avgAllLabel: fmtScore(avgAll),
      strongest,
      weakest,
    },
    domains,
  }
}
