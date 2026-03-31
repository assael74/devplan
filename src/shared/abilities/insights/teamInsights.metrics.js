import { abilitiesList } from '../abilities.list.js'
import { POSITION_LAYERS, SQUAD_ROLE_OPTIONS } from '../../players/players.constants.js'
import {
  resolvePlayerDomainPotentialScores,
  resolvePlayerDomainScores,
  resolvePlayerFullName,
  resolvePlayerLevel,
  resolvePlayerPotential,
  resolveTeamPlayers,
  safeNum,
  safeStr,
} from '../abilities.resolvers.js'
import { buildTeamAbilitiesBreakdown } from '../teamAbilities.breakdown.js'

function round1(v) {
  const n = Number(v)
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : null
}

function round2(v) {
  const n = Number(v)
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null
}

function buildRoleWeightsMap() {
  return (SQUAD_ROLE_OPTIONS || []).reduce((acc, item) => {
    const key = safeStr(item?.value)
    const weight = Number(item?.weight)
    if (key && Number.isFinite(weight) && weight > 0) {
      acc[key] = weight
    }
    return acc
  }, {})
}

function getPlayerWeight(player, weightsMap) {
  const role = safeStr(player?.squadRole)
  const weight = Number(weightsMap?.[role])
  return Number.isFinite(weight) && weight > 0 ? weight : 1
}

function getDomainIds() {
  const ids = new Set()

  for (const item of abilitiesList || []) {
    const domain = safeStr(item?.domain)
    if (!domain || domain === 'development') continue
    ids.add(domain)
  }

  return Array.from(ids)
}

function getDomainLabelMap() {
  const map = {}

  for (const item of abilitiesList || []) {
    const domain = safeStr(item?.domain)
    if (!domain || map[domain]) continue
    map[domain] = item?.domainLabel || domain
  }

  return map
}

function getTeamLevelSummary(team = {}) {
  return team?.squadStrength?.level || team?.level || null
}

function getTeamPotentialSummary(team = {}) {
  return team?.squadStrength?.levelPotential || team?.levelPotential || null
}

function buildContributionRows(players = [], field = 'level') {
  const roleWeights = buildRoleWeightsMap()

  return players
    .map((player) => {
      const weight = getPlayerWeight(player, roleWeights)
      const rawValue =
        field === 'levelPotential'
          ? resolvePlayerPotential(player)
          : resolvePlayerLevel(player)

      const value = Number(rawValue)
      const contribution = Number.isFinite(value) && value > 0
        ? round2(value * weight)
        : null

      return {
        id: player?.id || null,
        playerId: player?.id || null,
        playerName: resolvePlayerFullName(player),
        squadRole: safeStr(player?.squadRole) || null,
        weight,
        value: Number.isFinite(value) ? value : null,
        contribution,
        photo: player?.photo || null,
        raw: player,
      }
    })
    .filter((row) => Number.isFinite(row?.contribution))
    .sort((a, b) => Number(b.contribution) - Number(a.contribution))
}

function buildSquadMatrix(players = [], opts = {}) {
  const highAbilityMin = Number(opts?.highAbilityMin ?? 3.5)
  const highPotentialMin = Number(opts?.highPotentialMin ?? 4.0)

  const buckets = {
    highAbilityHighPotential: [],
    highAbilityLowPotential: [],
    lowAbilityHighPotential: [],
    lowAbilityLowPotential: [],
  }

  const eligiblePlayers = []

  for (const player of players) {
    const level = resolvePlayerLevel(player)
    const potential = resolvePlayerPotential(player)

    if (!Number.isFinite(level) || !Number.isFinite(potential)) continue

    const row = {
      id: player?.id || null,
      playerId: player?.id || null,
      playerName: resolvePlayerFullName(player),
      level,
      levelPotential: potential,
      gap: round1(potential - level),
      squadRole: safeStr(player?.squadRole) || null,
      photo: player?.photo || null,
      raw: player,
    }

    eligiblePlayers.push(row)

    if (level >= highAbilityMin && potential >= highPotentialMin) {
      buckets.highAbilityHighPotential.push(row)
      continue
    }

    if (level >= highAbilityMin && potential < highPotentialMin) {
      buckets.highAbilityLowPotential.push(row)
      continue
    }

    if (level < highAbilityMin && potential >= highPotentialMin) {
      buckets.lowAbilityHighPotential.push(row)
      continue
    }

    buckets.lowAbilityLowPotential.push(row)
  }

  return {
    thresholds: {
      highAbilityMin,
      highPotentialMin,
    },
    buckets,
    counts: {
      highAbilityHighPotential: buckets.highAbilityHighPotential.length,
      highAbilityLowPotential: buckets.highAbilityLowPotential.length,
      lowAbilityHighPotential: buckets.lowAbilityHighPotential.length,
      lowAbilityLowPotential: buckets.lowAbilityLowPotential.length,
    },
    eligiblePlayersCount: eligiblePlayers.length,
    players: eligiblePlayers,
  }
}

function buildTeamDomainsMetrics(players = []) {
  const domainIds = getDomainIds()
  const domainLabelMap = getDomainLabelMap()

  const abilityRows = []
  const potentialRows = []

  for (const domainId of domainIds) {
    const values = []
    const potentialValues = []

    for (const player of players) {
      const score = safeNum(resolvePlayerDomainScores(player)?.[domainId], null)
      if (Number.isFinite(score)) values.push(score)

      const potentialScore = safeNum(resolvePlayerDomainPotentialScores(player)?.[domainId], null)
      if (Number.isFinite(potentialScore)) potentialValues.push(potentialScore)
    }

    const avg = values.length
      ? round1(values.reduce((sum, n) => sum + n, 0) / values.length)
      : null

    const potentialAvg = potentialValues.length
      ? round1(potentialValues.reduce((sum, n) => sum + n, 0) / potentialValues.length)
      : null

    abilityRows.push({
      domain: domainId,
      domainLabel: domainLabelMap?.[domainId] || domainId,
      avg,
      ratedPlayersCount: values.length,
    })

    potentialRows.push({
      domain: domainId,
      domainLabel: domainLabelMap?.[domainId] || domainId,
      avg: potentialAvg,
      ratedPlayersCount: potentialValues.length,
      gap: Number.isFinite(avg) && Number.isFinite(potentialAvg)
        ? round1(potentialAvg - avg)
        : null,
    })
  }

  const strongestDomain = abilityRows
    .filter((row) => Number.isFinite(row?.avg))
    .sort((a, b) => Number(b.avg) - Number(a.avg))[0] || null

  const biggestPotentialGapDomain = potentialRows
    .filter((row) => Number.isFinite(row?.gap))
    .sort((a, b) => Number(b.gap) - Number(a.gap))[0] || null

  return {
    abilityRows,
    potentialRows,
    strongestDomain,
    biggestPotentialGapDomain,
  }
}

export function buildTeamInsightsMetrics(team = {}, context = {}, rules = {}) {
  const players = resolveTeamPlayers(team, context)
  const breakdown = buildTeamAbilitiesBreakdown(players, POSITION_LAYERS)

  const level = getTeamLevelSummary(team)
  const levelPotential = getTeamPotentialSummary(team)

  const levelAvg = safeNum(level?.avg, null)
  const potentialAvg = safeNum(levelPotential?.avg, null)
  const potentialGap =
    Number.isFinite(levelAvg) && Number.isFinite(potentialAvg)
      ? round1(potentialAvg - levelAvg)
      : null

  const topAbilityContributors = buildContributionRows(players, 'level')
  const topPotentialContributors = buildContributionRows(players, 'levelPotential')
  const matrix = buildSquadMatrix(players, rules?.matrix || {})
  const domains = buildTeamDomainsMetrics(players)

  return {
    players,
    breakdown,

    teamLevel: {
      avg: levelAvg,
      usedCount: safeNum(level?.usedCount, 0),
      total: safeNum(level?.total, players.length),
      min: safeNum(level?.min, null),
      max: safeNum(level?.max, null),
    },

    teamPotential: {
      avg: potentialAvg,
      usedCount: safeNum(levelPotential?.usedCount, 0),
      total: safeNum(levelPotential?.total, players.length),
      min: safeNum(levelPotential?.min, null),
      max: safeNum(levelPotential?.max, null),
    },

    potentialGap: {
      value: potentialGap,
    },

    topAbilityContributors,
    topPotentialContributors,
    matrix,

    strongestDomain: domains.strongestDomain,
    biggestPotentialGapDomain: domains.biggestPotentialGapDomain,

    meta: {
      playersCount: players.length,
      updatedFrom: 'teamInsights.metrics',
    },
  }
}
