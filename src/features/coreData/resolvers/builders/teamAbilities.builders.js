// src/features/coreData/resolvers/builders/teamAbilities.builder.js

const safeStr = (v) => (v == null ? '' : String(v))
const safeId = (v) => safeStr(v).trim()
const isNum = (v) => Number.isFinite(Number(v))

// --- abilities: Object ---
function getAbilitiesObject(p) {
  if (p?.playersAbilities && typeof p.playersAbilities === 'object' && !Array.isArray(p.playersAbilities)) return p.playersAbilities
  if (p?.playerAbilities && typeof p.playerAbilities === 'object' && !Array.isArray(p.playerAbilities)) return p.playerAbilities
  if (p?.abilities && typeof p.abilities === 'object' && !Array.isArray(p.abilities)) return p.abilities
  return null
}

// --- abilities: Array ---
function getAbilitiesArray(p) {
  if (Array.isArray(p?.playersAbilities)) return p.playersAbilities
  if (Array.isArray(p?.abilities)) return p.abilities
  return []
}

function getAbilityItemId(a) {
  return safeId(a?.id || a?.abilityId || a?.key)
}

function getAbilityItemValue(a) {
  const v = a && a.value != null ? a.value : null
  return isNum(v) ? Number(v) : null
}

function applyAbilityItem(out, item) {
  const a = item || {}
  const id = getAbilityItemId(a)
  if (!id) return
  out[id] = getAbilityItemValue(a)
}

function mapAbilitiesArrayToObject(arr) {
  const out = {}
  for (let i = 0; i < arr.length; i++) applyAbilityItem(out, arr[i])
  return out
}

function pickAbilitiesMap(player) {
  const p = player || {}
  const obj = getAbilitiesObject(p)
  if (obj) return obj
  return mapAbilitiesArrayToObject(getAbilitiesArray(p))
}

// --- level / potential ---
function pickPlayerLevel(p) {
  const v = p && p.level != null ? p.level : null
  const n = isNum(v) ? Number(v) : null
  return n > 0 ? n : null
}

function pickPlayerPotential(p) {
  const v = p && p.levelPotential != null ? p.levelPotential : null
  const n = isNum(v) ? Number(v) : null
  return n > 0 ? n : null
}

// --- position -> layer ---
function addLayerCodes(map, layerKey, arr) {
  for (let i = 0; i < (arr || []).length; i++) {
    const code = safeId(arr[i]?.code)
    if (code) map[code] = layerKey
  }
}

function buildPosToLayer(POSITION_LAYERS) {
  const map = {}
  const layers = POSITION_LAYERS && typeof POSITION_LAYERS === 'object' ? POSITION_LAYERS : {}
  Object.entries(layers).forEach(([layerKey, arr]) => addLayerCodes(map, layerKey, arr))
  return map
}

// --- abilities aggregation ---
function makeAbilityAgg() {
  return { wSum: 0, wCount: 0, wMissing: 0, min: null, max: null }
}

function ensureAbilityAgg(store, id) {
  if (!store[id]) store[id] = makeAbilityAgg()
  return store[id]
}

function applyAbilityVal(agg, val, w) {
  if (!w) return

  const n = Number(val)

  if (!Number.isFinite(n) || !(n > 0)) {
    agg.wMissing += w
    return
  }

  agg.wSum += n * w
  agg.wCount += w
  agg.min = agg.min == null ? n : Math.min(agg.min, n)
  agg.max = agg.max == null ? n : Math.max(agg.max, n)
}

function round3(v) {
  return Math.round(Number(v || 0) * 1000) / 1000
}

function finalizeAbilityAgg(agg, totalWeight) {
  const total = Number(totalWeight || 0)
  return {
    avg: agg.wCount ? Math.round((agg.wSum / agg.wCount) * 10) / 10 : null,
    count: round3(agg.wCount),       // כמה "שחקנים שקולים" תרמו (כעת יהיה שלם בסלייסים)
    missing: round3(agg.wMissing),
    min: agg.min,
    max: agg.max,
    total: round3(total),            // כמה שחקנים בסלייס
  }
}

function finalizeAbilitiesMap(byAbilityId, totalWeight) {
  const out = {}
  for (const [id, agg] of Object.entries(byAbilityId || {})) out[id] = finalizeAbilityAgg(agg, totalWeight)
  return out
}

// --- level aggregation ---
function makeLvlAgg() {
  return { wSum: 0, wCount: 0, min: null, max: null }
}

function applyLvl(agg, val, w) {
  if (!w || val == null) return
  if (!(val > 0)) return
  agg.wSum += val * w
  agg.wCount += w
  agg.min = agg.min == null ? val : Math.min(agg.min, val)
  agg.max = agg.max == null ? val : Math.max(agg.max, val)
}

function finalizeLvl(agg, totalWeight) {
  const total = Number(totalWeight || 0)
  const usedCount = round3(agg.wCount)                   // ✅ "על בסיס כמה שחקנים נקבעה האיכות"
  const skippedCount = round3(Math.max(0, total - usedCount))
  return {
    avg: usedCount ? Math.round((agg.wSum / usedCount) * 10) / 10 : null,
    usedCount,
    skippedCount,
    min: agg.min,
    max: agg.max,
    total: round3(total),
  }
}

// --- ability universe ---
function addAbilityUniverseKeys(set, map) {
  Object.keys(map || {}).forEach((k) => {
    const id = safeId(k)
    if (id) set.add(id)
  })
}

function buildAbilityUniverse(players) {
  const set = new Set()
  for (let i = 0; i < players.length; i++) addAbilityUniverseKeys(set, pickAbilitiesMap(players[i]))
  return Array.from(set)
}

// --- positions ---
function normalizePositions(arr) {
  const out = []
  for (let i = 0; i < (arr || []).length; i++) {
    const v = safeId(arr[i])
    if (v) out.push(v)
  }
  return out.length ? out : ['__noPos__']
}

function pickPositions(p) {
  return normalizePositions(Array.isArray(p?.positions) ? p.positions : [])
}

// --- slice nodes ---
function makeSliceNode() {
  return { playersRaw: 0, weight: 0, byAbilityId: {}, levelAgg: makeLvlAgg(), potAgg: makeLvlAgg() }
}

function ensureSlice(store, key) {
  if (!store[key]) store[key] = makeSliceNode()
  return store[key]
}

function bumpSlice(node, w, level, pot) {
  node.playersRaw += 1
  node.weight += w
  applyLvl(node.levelAgg, level, w)
  applyLvl(node.potAgg, pot, w)
}

function applyAbilitiesToSlice(node, abilityIds, vals, w) {
  for (let j = 0; j < abilityIds.length; j++) {
    const id = abilityIds[j]
    applyAbilityVal(ensureAbilityAgg(node.byAbilityId, id), vals[id], w)
  }
}

// --- global abilities ---
function applyAbilitiesToGlobal(store, abilityIds, vals) {
  for (let j = 0; j < abilityIds.length; j++) {
    const id = abilityIds[j]
    applyAbilityVal(ensureAbilityAgg(store, id), vals[id], 1)
  }
}

function finalizeSliceMap(store) {
  const out = {}
  Object.entries(store).forEach(([k, n]) => {
    out[k] = {
      playersRaw: n.playersRaw,
      weight: round3(n.weight),
      level: finalizeLvl(n.levelAgg, n.weight),
      levelPotential: finalizeLvl(n.potAgg, n.weight),
      byAbilityId: finalizeAbilitiesMap(n.byAbilityId, n.weight),
    }
  })
  return out
}

export function buildTeamAbilitiesSummary(players, POSITION_LAYERS) {
  const list = Array.isArray(players) ? players : []
  const totalPlayers = list.length

  const posToLayer = buildPosToLayer(POSITION_LAYERS)
  const abilityIds = buildAbilityUniverse(list)

  const globalAbilities = {}
  const globalLevelAgg = makeLvlAgg()
  const globalPotAgg = makeLvlAgg()
  let globalWeight = 0

  const byPosition = {}
  const byLayer = {}

  for (let i = 0; i < list.length; i++) {
    const p = list[i] || {}

    const vals = pickAbilitiesMap(p)
    const posArr = pickPositions(p)

    const pLevel = pickPlayerLevel(p)
    const pPot = pickPlayerPotential(p)

    // --- global: תמיד משקל 1 לכל שחקן ---
    globalWeight += 1
    applyAbilitiesToGlobal(globalAbilities, abilityIds, vals)
    applyLvl(globalLevelAgg, pLevel, 1)
    applyLvl(globalPotAgg, pPot, 1)

    // --- byPosition: כל שחקן נספר 1 בתוך כל עמדה שהוא נמצא בה ---
    for (let k = 0; k < posArr.length; k++) {
      const posKey = posArr[k]
      const posNode = ensureSlice(byPosition, posKey)

      bumpSlice(posNode, 1, pLevel, pPot)
      applyAbilitiesToSlice(posNode, abilityIds, vals, 1)
    }

    // --- byLayer: כל שחקן נספר 1 בתוך שכבה, פעם אחת בלבד ---
    const layerSet = new Set()
    for (let k = 0; k < posArr.length; k++) {
      const layerKey = posToLayer[posArr[k]] || '__noLayer__'
      layerSet.add(layerKey)
    }

    for (const layerKey of layerSet) {
      const layerNode = ensureSlice(byLayer, layerKey)

      bumpSlice(layerNode, 1, pLevel, pPot)
      applyAbilitiesToSlice(layerNode, abilityIds, vals, 1)
    }
  }

  return {
    totalPlayers,
    level: finalizeLvl(globalLevelAgg, globalWeight),
    levelPotential: finalizeLvl(globalPotAgg, globalWeight),
    byAbilityId: finalizeAbilitiesMap(globalAbilities, globalWeight),
    byPosition: finalizeSliceMap(byPosition),
    byLayer: finalizeSliceMap(byLayer),
  }
}
