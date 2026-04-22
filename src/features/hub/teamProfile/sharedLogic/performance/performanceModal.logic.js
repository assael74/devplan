// teamProfile/sharedLogic/performance/performanceModal.logic.js

import { POSITION_LAYERS } from '../../../../../shared/players/players.constants.js'

const s = (v) => (v == null ? '' : String(v))
const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)
const cmp = (a, b) => (a === b ? 0 : a > b ? 1 : -1)

export const LAYER_ORDER = ['goalkeeper', 'defense', 'dmMid', 'midfield', 'atMidfield', 'attack']
export const LAYER_LABELS = {
  goalkeeper: 'קו שוער',
  defense: 'קו הגנה',
  dmMid: 'קו קישור אחורי',
  midfield: 'קו קישור',
  atMidfield: 'קו קישור התקפי',
  attack: 'קו התקפה',
}

export const buildLayerIndex = () => {
  const posToLayer = {}
  const layerToCodes = {}
  const codeToLabel = {}

  LAYER_ORDER.forEach((layerKey) => {
    const arr = POSITION_LAYERS[layerKey] || []
    layerToCodes[layerKey] = arr.map((x) => x.code)
    arr.forEach((x) => {
      posToLayer[x.code] = layerKey
      codeToLabel[x.code] = x.label
    })
  })

  return { posToLayer, layerToCodes, codeToLabel }
}

export const buildHaystack = (r) => [s(r?.name), s((r?.positions || []).join(' ')), s(r?.id)].join(' ').toLowerCase()

export const sortRows = (rows, sortKey, sortDir) => {
  const dir = sortDir === 'desc' ? -1 : 1
  const { posToLayer } = buildLayerIndex()
  const layerRank = Object.fromEntries(LAYER_ORDER.map((k, i) => [k, i]))
  const pick = (r) => {
    const ps = r?.stats || {}

    // fixed keys
    if (sortKey === 'name') return s(r?.name).toLowerCase()
    if (sortKey === 'positions') {
      const pos = Array.isArray(r?.positions) ? r.positions : []
      const layers = pos.map((p) => posToLayer[p]).filter(Boolean)
      if (!layers.length) return 999
      return Math.min(...layers.map((l) => layerRank[l] ?? 999))
    }
    if (sortKey === 'games') return n(ps.gamesCount)
    if (sortKey === 'minutes') return n(ps.timePlayed)
    if (sortKey === 'goals') return n(ps.goals)
    if (sortKey === 'assists') return n(ps.assists)
    if (sortKey === 'playRate') return n(ps.playTimeRate)

    // ✅ dynamic: sort by stats key directly
    if (ps && ps[sortKey] != null) return n(ps[sortKey])

    return 0
  }

  return rows
    .slice()
    .sort((a, b) => {
      const pa = pick(a)
      const pb = pick(b)

      const primary = dir * cmp(pa, pb)
      if (primary !== 0) return primary

      return s(a?.name).localeCompare(s(b?.name), 'he')
    })
}

export const matchByLayer = (row, layerMode, layerToCodes) => {
  if (!layerMode || layerMode === 'all') return true
  if (!layerMode.startsWith('layer:')) return true
  const layerKey = layerMode.slice(6)
  const allowed = layerToCodes[layerKey] || []
  const pos = Array.isArray(row?.positions) ? row.positions : []
  return pos.some((p) => allowed.includes(p))
}

export const matchByPos = (row, posMode) => {
  if (!posMode || posMode === 'all') return true
  if (!posMode.startsWith('pos:')) return true
  const code = posMode.slice(4)
  const pos = Array.isArray(row?.positions) ? row.positions : []
  return pos.includes(code)
}
