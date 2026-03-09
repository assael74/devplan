// shared/abilities/abilities.summaries.js
import { abilitiesList } from './abilities.list'
import { buildDomainsMeta, isRated, roundTo, toNum } from './abilities.utils'

// ---- 1) סיכום שחקנים לפי דומיין ----
// avgWeighted + counts מתבססים על abilities עם weight>0 בלבד (weight=0 = מידע נלווה)
export function summarizePlayersByDomain(players = []) {
  const domainsMeta = buildDomainsMeta(abilitiesList)

  const acc = {}
  for (const { domain } of abilitiesList) {
    if (!acc[domain]) {
      acc[domain] = {
        domain,
        domainLabel: domainsMeta?.[domain]?.domainLabel || domain,
        weightedSum: 0,
        weightSum: 0,
        ratingsCount: 0,
        playersRated: 0,
      }
    }
  }

  for (const player of players) {
    const abilities = player?.abilities || {}
    const hasRatedPerDomain = {}

    for (const { id, domain, weight } of abilitiesList) {
      const raw = abilities[id]
      const val = raw == null || raw === '' ? null : toNum(raw, null)
      if (!isRated(val)) continue

      const w = toNum(weight, 1)
      if (w <= 0) continue

      acc[domain].weightedSum += toNum(val, 0) * w
      acc[domain].weightSum += w
      acc[domain].ratingsCount += 1
      hasRatedPerDomain[domain] = true
    }

    for (const d of Object.keys(hasRatedPerDomain)) {
      acc[d].playersRated += 1
    }
  }

  return Object.values(acc).map((d) => ({
    domain: d.domain,
    domainLabel: d.domainLabel,
    avgWeighted: d.weightSum > 0 ? roundTo(d.weightedSum / d.weightSum, 1) : null,
    ratingsCount: d.ratingsCount,
    playersRated: d.playersRated,
  }))
}

// ---- 2) סיכום לפי יכולת בתוך כל דומיין ----
// כאן כן מציגים גם abilities עם weight=0, אבל עדיין "לא דורג" = null
export function summarizePlayersByAbility(players = []) {
  const domainsMeta = buildDomainsMeta(abilitiesList)

  const byDomain = {}
  for (const { domain } of abilitiesList) {
    if (!byDomain[domain]) {
      byDomain[domain] = {
        domain,
        domainLabel: domainsMeta[domain].domainLabel || domain,
        items: {},
      }
    }
  }

  for (const { id, label, domain } of abilitiesList) {
    byDomain[domain].items[id] = { id, label, sum: 0, count: 0 }
  }

  for (const player of players) {
    const abilities = player?.abilities || {}
    for (const { id, domain } of abilitiesList) {
      const raw = abilities[id]
      const val = raw == null || raw === '' ? null : toNum(raw, null)
      if (!isRated(val)) continue

      byDomain[domain].items[id].sum += toNum(val, 0)
      byDomain[domain].items[id].count += 1
    }
  }

  return Object.values(byDomain).map((d) => ({
    domain: d.domain,
    domainLabel: d.domainLabel,
    items: Object.values(d.items).map((it) => ({
      id: it.id,
      label: it.label,
      avg: it.count > 0 ? roundTo(it.sum / it.count, 1) : null,
      ratedCount: it.count,
    })),
  }))
}
