// src/features/coreData/resolvers/builders/teamAbilities.builder.js

import { SQUAD_ROLE_OPTIONS } from '../../../../shared/players/players.constants.js'

const safeNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function round3(v) {
  return Math.round(Number(v || 0) * 1000) / 1000
}

function buildSquadRoleWeightsMap(options = []) {
  return options.reduce((acc, item) => {
    const key = String(item?.value || '').trim()
    const weight = Number(item?.weight)

    if (key && Number.isFinite(weight) && weight > 0) {
      acc[key] = weight
    }

    return acc
  }, {})
}

function pickPlayerWeight(player, roleWeights) {
  const role = String(player?.squadRole || '').trim()
  const weight = Number(roleWeights?.[role])

  if (Number.isFinite(weight) && weight > 0) return weight
  return 1
}

function pickPlayerLevel(player) {
  const n = safeNum(player?.level)
  return n > 0 ? n : null
}

function pickPlayerPotential(player) {
  const n = safeNum(player?.levelPotential)
  return n > 0 ? n : null
}

function makeLevelAgg() {
  return {
    weightedSum: 0,
    usedWeight: 0,
    min: null,
    max: null,
  }
}

function applyLevelValue(agg, value, weight) {
  if (!agg || !weight || value == null) return
  if (!(value > 0)) return

  agg.weightedSum += value * weight
  agg.usedWeight += weight
  agg.min = agg.min == null ? value : Math.min(agg.min, value)
  agg.max = agg.max == null ? value : Math.max(agg.max, value)
}

function finalizeLevelAgg(agg, totalWeight) {
  const total = Number(totalWeight || 0)
  const usedCount = round3(agg?.usedWeight || 0)
  const skippedCount = round3(Math.max(0, total - usedCount))

  return {
    avg: usedCount ? Math.round((agg.weightedSum / usedCount) * 10) / 10 : null,
    usedCount,
    skippedCount,
    min: agg?.min ?? null,
    max: agg?.max ?? null,
    total: round3(total),
  }
}

export function buildTeamAbilitiesSummary(players) {
  const list = Array.isArray(players) ? players : []
  const roleWeights = buildSquadRoleWeightsMap(SQUAD_ROLE_OPTIONS)

  let totalWeight = 0
  const levelAgg = makeLevelAgg()
  const potentialAgg = makeLevelAgg()

  for (let i = 0; i < list.length; i++) {
    const player = list[i] || {}
    const weight = pickPlayerWeight(player, roleWeights)
    const level = pickPlayerLevel(player)
    const levelPotential = pickPlayerPotential(player)

    totalWeight += weight

    applyLevelValue(levelAgg, level, weight)
    applyLevelValue(potentialAgg, levelPotential, weight)
  }

  const summary = {
    totalPlayers: list.length,
    totalWeight: round3(totalWeight),
    level: finalizeLevelAgg(levelAgg, totalWeight),
    levelPotential: finalizeLevelAgg(potentialAgg, totalWeight),
    updatedFrom: 'teamAbilitiesSummary',
  }

  return summary
}
