// src/shared/abilities/insights/abilities.insights.eligibility.js

import {
  resolvePlayerCoverage,
  resolvePlayerReliability,
  resolvePlayerValidDomainsCount,
  resolveTeamPlayers,
  resolvePlayerFullName,
} from '../abilities.resolvers.js'

const DEFAULTS = {
  minEligiblePlayerDomains: 3,
  minEligibleTeamPlayers: 11,
  minAbilityCoveragePct: 65,
  minPotentialCoveragePct: 70,
}

function normalizeOptions(options = {}) {
  return {
    ...DEFAULTS,
    ...(options || {}),
  }
}

export function resolvePlayerAbilitiesInsightsEligibility(player = {}, options = {}) {
  const cfg = normalizeOptions(options)
  const coverage = resolvePlayerCoverage(player)
  const reliability = resolvePlayerReliability(player)
  const validDomainsCount = resolvePlayerValidDomainsCount(player)

  const abilityCoverage = Number(coverage?.ability || 0)
  const potentialCoverage = Number(coverage?.potential || 0)
  const validAbilityDomains = Number(validDomainsCount?.ability || 0)
  const validPotentialDomains = Number(validDomainsCount?.potential || 0)

  const hasEnoughAbilityDomains = validAbilityDomains >= cfg.minEligiblePlayerDomains
  const hasEnoughPotentialDomains = validPotentialDomains >= cfg.minEligiblePlayerDomains
  const hasEnoughAbilityCoverage = abilityCoverage >= cfg.minAbilityCoveragePct
  const hasEnoughPotentialCoverage = potentialCoverage >= cfg.minPotentialCoveragePct

  const isEligible =
    hasEnoughAbilityDomains &&
    hasEnoughPotentialDomains &&
    hasEnoughAbilityCoverage &&
    hasEnoughPotentialCoverage

  const missingReasons = []

  if (!hasEnoughAbilityDomains) missingReasons.push('notEnoughAbilityDomains')
  if (!hasEnoughPotentialDomains) missingReasons.push('notEnoughPotentialDomains')
  if (!hasEnoughAbilityCoverage) missingReasons.push('lowAbilityCoverage')
  if (!hasEnoughPotentialCoverage) missingReasons.push('lowPotentialCoverage')

  return {
    isEligible,
    missingReasons,
    thresholds: cfg,
    summary: {
      validAbilityDomains,
      validPotentialDomains,
      abilityCoverage,
      potentialCoverage,
      abilityReliability: reliability?.ability || 'low',
      potentialReliability: reliability?.potential || 'low',
    },
  }
}

export function resolveTeamAbilitiesInsightsEligibility(entity = {}, context = {}, options = {}) {
  const cfg = normalizeOptions(options)
  const players = resolveTeamPlayers(entity, context)

  const playersEligibility = players.map((player) => {
    const eligibility = resolvePlayerAbilitiesInsightsEligibility(player, cfg)

    return {
      player,
      playerId: player?.id || null,
      playerName: resolvePlayerFullName(player),
      ...eligibility,
    }
  })

  const eligiblePlayers = playersEligibility.filter((item) => item.isEligible)
  const eligiblePlayersCount = eligiblePlayers.length
  const playersCount = players.length
  const eligiblePct = playersCount > 0 ? Math.round((eligiblePlayersCount / playersCount) * 100) : 0

  return {
    isEligible: eligiblePlayersCount >= cfg.minEligibleTeamPlayers,
    thresholds: cfg,
    summary: {
      playersCount,
      eligiblePlayersCount,
      eligiblePct,
      missingPlayersToThreshold: Math.max(0, cfg.minEligibleTeamPlayers - eligiblePlayersCount),
    },
    players,
    playersEligibility,
    eligiblePlayers,
    ineligiblePlayers: playersEligibility.filter((item) => !item.isEligible),
  }
}
