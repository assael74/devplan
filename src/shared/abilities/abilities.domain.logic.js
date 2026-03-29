// shared/abilities/abilities.domain.logic.js

import { abilitiesList } from './abilities.list.js'
import { fmtScore, roundTo, scoreColor } from './abilities.utils.js'
import {
  resolvePlayerAbilitiesMap,
  resolvePlayerCoverage,
  resolvePlayerDomainScores,
  resolvePlayerDomainsMeta,
  resolveTeamPlayers,
  safeNum,
} from './abilities.resolvers.js'

function buildAbilityMetaMap() {
  const map = new Map()

  for (const item of abilitiesList) {
    map.set(item.id, item)
  }

  return map
}

function buildDomainMetaMap() {
  const map = new Map()

  for (const item of abilitiesList) {
    if (!map.has(item.domain)) {
      map.set(item.domain, {
        domain: item.domain,
        domainLabel: item.domainLabel || item.domain,
        items: [],
      })
    }

    map.get(item.domain).items.push(item)
  }

  return map
}

function toPlayerDomainItem(domainMeta = {}, domainScore = null) {
  const score = Number.isFinite(Number(domainScore)) ? Number(domainScore) : null
  const items = Array.isArray(domainMeta?.items) ? domainMeta.items : []

  return {
    domain: domainMeta?.domain || '',
    domainLabel: domainMeta?.domainLabel || domainMeta?.domain || '',
    items,
    total: Number(domainMeta?.totalCount || items.filter((it) => Number(it?.weight ?? 1) > 0).length || 0),
    filled: Number(domainMeta?.filledCount || 0),
    avg: score,
    avgLabel: fmtScore(score),
    color: scoreColor(score),
    hasRated: Number.isFinite(score),
    coveragePct: safeNum(domainMeta?.coveragePct, 0) || 0,
    validity: domainMeta?.validity || 'invalid',
    reliability: domainMeta?.reliability || 'low',
  }
}

export function resolveAbilitiesDomain(player = {}) {
  const domainScores = resolvePlayerDomainScores(player)
  const domainsMeta = resolvePlayerDomainsMeta(player)
  const coverage = resolvePlayerCoverage(player)

  const domainsFromEngine = Array.isArray(domainsMeta) ? domainsMeta : []
  const domainMetaMap = new Map(domainsFromEngine.map((d) => [d.domain, d]))

  const baseDomains = Array.from(buildDomainMetaMap().values())

  const domains = baseDomains.map((base) => {
    const engineMeta = domainMetaMap.get(base.domain) || {}
    return toPlayerDomainItem(
      {
        ...base,
        ...engineMeta,
      },
      domainScores?.[base.domain]
    )
  })

  const ratedDomains = domains.filter((d) => d.hasRated)

  const strongest = ratedDomains.length
    ? ratedDomains.reduce((a, b) => (Number(a.avg) >= Number(b.avg) ? a : b))
    : null

  const weakest = ratedDomains.length
    ? ratedDomains.reduce((a, b) => (Number(a.avg) <= Number(b.avg) ? a : b))
    : null

  const avgAll = ratedDomains.length
    ? roundTo(
        ratedDomains.reduce((sum, d) => sum + Number(d.avg || 0), 0) / ratedDomains.length,
        1
      )
    : null

  const total = domains.reduce((sum, d) => sum + Number(d.total || 0), 0)
  const filled = domains.reduce((sum, d) => sum + Number(d.filled || 0), 0)

  return {
    summary: {
      total,
      filled,
      completionPct: safeNum(coverage?.ability, total > 0 ? roundTo((filled / total) * 100, 0) : 0) || 0,
      avgAll,
      avgAllLabel: fmtScore(avgAll),
      strongest,
      weakest,
    },
    domains,
  }
}

export function resolveTeamAbilitiesDomain(entity = {}, context = {}) {
  const players = resolveTeamPlayers(entity, context)
  const abilityMetaMap = buildAbilityMetaMap()
  const baseDomains = Array.from(buildDomainMetaMap().values())

  const domains = baseDomains.map((domainBase) => {
    const items = (domainBase.items || []).map((abilityMeta) => {
      const values = players
        .map((player) => safeNum(resolvePlayerAbilitiesMap(player)?.[abilityMeta.id], null))
        .filter((value) => Number.isFinite(value) && value > 0)

      const avg = values.length
        ? roundTo(values.reduce((sum, n) => sum + n, 0) / values.length, 1)
        : null

      return {
        id: abilityMeta.id,
        label: abilityMeta.label,
        description: abilityMeta.description || '',
        avg,
        value: avg,
        ratedCount: values.length,
        weight: Number(abilityMeta?.weight ?? 1) || 1,
      }
    })

    const validPlayerDomainScores = players
      .map((player) => safeNum(resolvePlayerDomainScores(player)?.[domainBase.domain], null))
      .filter((score) => Number.isFinite(score))

    const avg = validPlayerDomainScores.length
      ? roundTo(
          validPlayerDomainScores.reduce((sum, score) => sum + score, 0) /
            validPlayerDomainScores.length,
          1
        )
      : null

    const playersRated = validPlayerDomainScores.length
    const total = items.filter((i) => Number(i.weight || 0) > 0).length
    const filled = items.filter((i) => Number.isFinite(Number(i.avg))).length

    return {
      domain: domainBase.domain,
      domainLabel: domainBase.domainLabel,
      items: items.map((item) => ({
        id: item.id,
        label: abilityMetaMap.get(item.id)?.label || item.id,
        description: '',
        value: item.avg,
        avg: item.avg,
        ratedCount: item.ratedCount,
        weight: item.weight,
      })),
      total,
      filled,
      avg,
      avgLabel: fmtScore(avg),
      color: scoreColor(avg),
      hasRated: Number.isFinite(avg),
      playersRated,
      ratingsCount: items.reduce((sum, item) => sum + Number(item.ratedCount || 0), 0),
    }
  })

  const ratedDomains = domains.filter((d) => d.hasRated)

  const strongest = ratedDomains.length
    ? ratedDomains.reduce((a, b) => (Number(a.avg) >= Number(b.avg) ? a : b))
    : null

  const weakest = ratedDomains.length
    ? ratedDomains.reduce((a, b) => (Number(a.avg) <= Number(b.avg) ? a : b))
    : null

  const avgAll = ratedDomains.length
    ? roundTo(
        ratedDomains.reduce((sum, d) => sum + Number(d.avg || 0), 0) / ratedDomains.length,
        1
      )
    : null

  const total = domains.reduce((sum, d) => sum + Number(d.total || 0), 0)
  const filled = domains.reduce((sum, d) => sum + Number(d.filled || 0), 0)
  const playersWithAbilities = players.filter((player) => {
    const abilities = resolvePlayerAbilitiesMap(player)
    return Object.values(abilities || {}).some((value) => Number(value) > 0)
  }).length

  return {
    summary: {
      total,
      filled,
      completionPct: total > 0 ? roundTo((filled / total) * 100, 0) : 0,
      avgAll,
      avgAllLabel: fmtScore(avgAll),
      strongest,
      weakest,
      playersCount: players.length,
      playersWithAbilities,
      withVideo: playersWithAbilities,
    },
    domains,
    players,
  }
}
