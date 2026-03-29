// src/shared/abilities/teamAbilities.breakdown.js

import { POSITION_LAYERS, SQUAD_ROLE_OPTIONS } from '../players/players.constants.js'
import { abilitiesList } from './abilities.list.js'
import {
  resolvePlayerAbilitiesMap,
  resolvePlayerLevel,
  resolvePlayerPotential,
  safeNum,
  safeStr,
} from './abilities.resolvers.js'

function round3(v) {
  return Math.round(Number(v || 0) * 1000) / 1000
}

function buildSquadRoleWeightsMap(options = []) {
  return options.reduce((acc, item) => {
    const key = safeStr(item?.value)
    const weight = Number(item?.weight)

    if (key && Number.isFinite(weight) && weight > 0) {
      acc[key] = weight
    }

    return acc
  }, {})
}

function pickPlayerWeight(player, roleWeights) {
  const role = safeStr(player?.squadRole)
  const weight = Number(roleWeights?.[role])

  if (Number.isFinite(weight) && weight > 0) return weight
  return 1
}

function addLayerCodes(map, layerKey, arr) {
  for (const item of arr || []) {
    const code = safeStr(item?.code)
    if (code) map[code] = layerKey
  }
}

function buildPosToLayerMap(positionLayers = {}) {
  const map = {}

  Object.entries(positionLayers || {}).forEach(([layerKey, arr]) => {
    addLayerCodes(map, layerKey, arr)
  })

  return map
}

function pickPositions(player = {}) {
  const arr = Array.isArray(player?.positions) ? player.positions : []
  const out = arr.map((item) => safeStr(item)).filter(Boolean)
  return out.length ? out : ['__noPos__']
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
  if (!agg || !weight || value == null || !(value > 0)) return

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

function makeAbilityAgg() {
  return {
    weightedSum: 0,
    usedWeight: 0,
    missingWeight: 0,
    min: null,
    max: null,
  }
}

function ensureAbilityAgg(store, id) {
  if (!store[id]) store[id] = makeAbilityAgg()
  return store[id]
}

function applyAbilityValue(agg, value, weight) {
  if (!weight) return

  const n = Number(value)

  if (!Number.isFinite(n) || !(n > 0)) {
    agg.missingWeight += weight
    return
  }

  agg.weightedSum += n * weight
  agg.usedWeight += weight
  agg.min = agg.min == null ? n : Math.min(agg.min, n)
  agg.max = agg.max == null ? n : Math.max(agg.max, n)
}

function finalizeAbilityAgg(agg, totalWeight) {
  const total = Number(totalWeight || 0)
  const count = round3(agg?.usedWeight || 0)

  return {
    avg: count ? Math.round((agg.weightedSum / count) * 10) / 10 : null,
    count,
    missing: round3(agg?.missingWeight || 0),
    min: agg?.min ?? null,
    max: agg?.max ?? null,
    total: round3(total),
  }
}

function finalizeAbilitiesMap(byAbilityId, totalWeight) {
  const out = {}

  Object.entries(byAbilityId || {}).forEach(([id, agg]) => {
    out[id] = finalizeAbilityAgg(agg, totalWeight)
  })

  return out
}

function makeSliceNode() {
  return {
    playersRaw: 0,
    weight: 0,
    byAbilityId: {},
    levelAgg: makeLevelAgg(),
    potAgg: makeLevelAgg(),
  }
}

function ensureSlice(store, key) {
  if (!store[key]) store[key] = makeSliceNode()
  return store[key]
}

function bumpSlice(node, weight, level, potential) {
  node.playersRaw += 1
  node.weight += weight
  applyLevelValue(node.levelAgg, level, weight)
  applyLevelValue(node.potAgg, potential, weight)
}

function applyAbilitiesToSlice(node, weight, abilities = {}) {
  for (const item of abilitiesList) {
    const id = item?.id
    if (!id) continue

    applyAbilityValue(
      ensureAbilityAgg(node.byAbilityId, id),
      safeNum(abilities?.[id], null),
      weight
    )
  }
}

function finalizeSliceMap(store) {
  const out = {}

  Object.entries(store).forEach(([key, node]) => {
    out[key] = {
      playersRaw: node.playersRaw,
      weight: round3(node.weight),
      level: finalizeLevelAgg(node.levelAgg, node.weight),
      levelPotential: finalizeLevelAgg(node.potAgg, node.weight),
      byAbilityId: finalizeAbilitiesMap(node.byAbilityId, node.weight),
    }
  })

  return out
}

export function buildTeamAbilitiesBreakdown(players, positionLayers = POSITION_LAYERS) {
  const list = Array.isArray(players) ? players : []
  const roleWeights = buildSquadRoleWeightsMap(SQUAD_ROLE_OPTIONS)
  const posToLayer = buildPosToLayerMap(positionLayers)

  const byPosition = {}
  const byLayer = {}

  for (const player of list) {
    const weight = pickPlayerWeight(player, roleWeights)
    const abilities = resolvePlayerAbilitiesMap(player)
    const positions = pickPositions(player)
    const level = resolvePlayerLevel(player)
    const potential = resolvePlayerPotential(player)

    for (const posKey of positions) {
      const node = ensureSlice(byPosition, posKey)
      bumpSlice(node, weight, level, potential)
      applyAbilitiesToSlice(node, weight, abilities)
    }

    const layerSet = new Set()

    for (const posKey of positions) {
      layerSet.add(posToLayer[posKey] || '__noLayer__')
    }

    for (const layerKey of layerSet) {
      const node = ensureSlice(byLayer, layerKey)
      bumpSlice(node, weight, level, potential)
      applyAbilitiesToSlice(node, weight, abilities)
    }
  }

  return {
    totalPlayers: list.length,
    byPosition: finalizeSliceMap(byPosition),
    byLayer: finalizeSliceMap(byLayer),
    updatedFrom: 'teamAbilitiesBreakdown',
  }
}
