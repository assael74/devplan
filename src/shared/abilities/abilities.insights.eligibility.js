// shared/abilities/abilities.insights.eligibility.js

import { abilitiesList } from './abilities.list.js'
import { isRated, roundTo } from './abilities.utils.js'

const DEFAULTS = {
  minDomainCoveragePct: 60,
  minDocumentedPerformanceDomains: 3,
  requireDevelopment: true,
  developmentDomainId: 'development',
  minEligiblePlayersForTeam: 11,
}

function normalizeOptions(options = {}) {
  return {
    ...DEFAULTS,
    ...(options || {}),
  }
}

function getPlayerAbilities(entity = {}) {
  return (
    entity?.abilities ||
    entity?.playerAbilities ||
    entity?.playersAbilities ||
    entity?.playerAbilitiesValues ||
    {}
  )
}

function buildDomainMeta() {
  const map = new Map()

  for (const item of abilitiesList) {
    const domain = item?.domain
    if (!domain) continue

    if (!map.has(domain)) {
      map.set(domain, {
        domain,
        domainLabel: item?.domainLabel || domain,
        items: [],
      })
    }

    map.get(domain).items.push(item)
  }

  return Array.from(map.values())
}

function calcDomainCoverage(items = [], values = {}) {
  const total = items.length
  const filled = items.filter((item) => isRated(values?.[item.id])).length
  const coveragePct = total > 0 ? roundTo((filled / total) * 100, 0) : 0

  return {
    total,
    filled,
    coveragePct,
  }
}

function buildPlayerDomainDocumentation(player = {}, options = {}) {
  const cfg = normalizeOptions(options)
  const values = getPlayerAbilities(player)
  const domains = buildDomainMeta()

  return domains.map((domain) => {
    const isDevelopment = domain.domain === cfg.developmentDomainId

    const relevantItems = isDevelopment
      ? domain.items
      : domain.items.filter((item) => Number(item?.weight ?? 1) > 0)

    const stats = calcDomainCoverage(relevantItems, values)

    const isDocumented = isDevelopment
      ? stats.filled > 0
      : stats.coveragePct >= cfg.minDomainCoveragePct

    return {
      domain: domain.domain,
      domainLabel: domain.domainLabel,
      isDevelopment,
      total: stats.total,
      filled: stats.filled,
      coveragePct: stats.coveragePct,
      isDocumented,
      missingCount: Math.max(0, stats.total - stats.filled),
      abilityIds: relevantItems.map((item) => item.id),
      missingAbilityIds: relevantItems
        .filter((item) => !isRated(values?.[item.id]))
        .map((item) => item.id),
    }
  })
}

function buildPlayerMissingReasons({
  hasDevelopment,
  documentedPerformanceDomains,
  minDocumentedPerformanceDomains,
}) {
  const reasons = []

  if (!hasDevelopment) {
    reasons.push('missingDevelopment')
  }

  if (documentedPerformanceDomains < minDocumentedPerformanceDomains) {
    reasons.push('notEnoughDocumentedDomains')
  }

  return reasons
}

export function resolvePlayerAbilitiesInsightsEligibility(player = {}, options = {}) {
  const cfg = normalizeOptions(options)
  const domains = buildPlayerDomainDocumentation(player, cfg)

  const developmentDomain = domains.find((d) => d.isDevelopment) || null
  const performanceDomains = domains.filter((d) => !d.isDevelopment)
  const documentedPerformanceDomainsList = performanceDomains.filter((d) => d.isDocumented)

  const hasDevelopment = cfg.requireDevelopment
    ? Boolean(developmentDomain?.isDocumented)
    : true

  const documentedPerformanceDomains = documentedPerformanceDomainsList.length
  const totalPerformanceDomains = performanceDomains.length

  const isEligible =
    hasDevelopment &&
    documentedPerformanceDomains >= cfg.minDocumentedPerformanceDomains

  const missingReasons = buildPlayerMissingReasons({
    hasDevelopment,
    documentedPerformanceDomains,
    minDocumentedPerformanceDomains: cfg.minDocumentedPerformanceDomains,
  })

  return {
    isEligible,
    missingReasons,
    thresholds: {
      minDomainCoveragePct: cfg.minDomainCoveragePct,
      minDocumentedPerformanceDomains: cfg.minDocumentedPerformanceDomains,
      requireDevelopment: cfg.requireDevelopment,
    },
    summary: {
      hasDevelopment,
      documentedPerformanceDomains,
      totalPerformanceDomains,
      documentedDomainsIncludingDevelopment: domains.filter((d) => d.isDocumented).length,
    },
    developmentDomain,
    domains,
    documentedPerformanceDomainsList,
    undocumentedPerformanceDomainsList: performanceDomains.filter((d) => !d.isDocumented),
  }
}

function resolveTeamPlayers(entity = {}, context = {}) {
  const direct =
    entity?.teamPlayers ||
    entity?.players ||
    entity?.squad ||
    entity?.playersList ||
    []

  if (Array.isArray(direct) && direct.length) {
    return direct.filter(Boolean)
  }

  const allPlayers = Array.isArray(context?.players) ? context.players : []
  const teamId = entity?.id || entity?.teamId || null

  if (!teamId) return []

  return allPlayers.filter((p) => p?.teamId === teamId)
}

export function resolveTeamAbilitiesInsightsEligibility(entity = {}, context = {}, options = {}) {
  const cfg = normalizeOptions(options)
  const players = resolveTeamPlayers(entity, context)

  const playersEligibility = players.map((player) => {
    const eligibility = resolvePlayerAbilitiesInsightsEligibility(player, cfg)

    return {
      player,
      playerId: player?.id || null,
      playerName:
        player?.playerFullName ||
        [player?.playerFirstName, player?.playerLastName].filter(Boolean).join(' ') ||
        player?.fullName ||
        'ללא שם',
      ...eligibility,
    }
  })

  const eligiblePlayers = playersEligibility.filter((item) => item.isEligible)
  const eligiblePlayersCount = eligiblePlayers.length
  const playersCount = players.length

  const eligiblePct =
    playersCount > 0 ? roundTo((eligiblePlayersCount / playersCount) * 100, 0) : 0

  const isEligible = eligiblePlayersCount >= cfg.minEligiblePlayersForTeam

  return {
    isEligible,
    thresholds: {
      minEligiblePlayersForTeam: cfg.minEligiblePlayersForTeam,
      minDomainCoveragePct: cfg.minDomainCoveragePct,
      minDocumentedPerformanceDomains: cfg.minDocumentedPerformanceDomains,
      requireDevelopment: cfg.requireDevelopment,
    },
    summary: {
      playersCount,
      eligiblePlayersCount,
      eligiblePct,
      missingPlayersToThreshold: Math.max(0, cfg.minEligiblePlayersForTeam - eligiblePlayersCount),
    },
    players,
    playersEligibility,
    eligiblePlayers,
    ineligiblePlayers: playersEligibility.filter((item) => !item.isEligible),
  }
}
