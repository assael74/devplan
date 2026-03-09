// domains/team/performance/performanceModal.logic.js
import { POSITION_LAYERS } from '../../../../../../../../shared/players/players.constants.js'

const safe = (v) => (v == null ? '' : String(v))
const toNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)

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

export const buildHaystack = (r) =>
  [safe(r?.name), safe((r?.positions || []).join(' ')), safe(r?.id)].join(' ').toLowerCase()

const cmp = (a, b) => (a === b ? 0 : a > b ? 1 : -1)

export const sortRows = (rows, sortKey, sortDir) => {
  const dir = sortDir === 'desc' ? -1 : 1
  const pick = (r) => {
    const ps = r?.stats || {}
    switch (sortKey) {
      case 'name':
        return safe(r?.name).toLowerCase()
      case 'positions':
        return safe((r?.positions || []).join(' ')).toLowerCase()
      case 'games':
        return toNum(ps.gamesCount)
      case 'minutes':
        return toNum(ps.timePlayed)
      case 'goals':
        return toNum(ps.goals)
      case 'assists':
        return toNum(ps.assists)
      case 'playRate':
        return toNum(ps.playTimeRate)
      default:
        return 0
    }
  }
  return rows.slice().sort((a, b) => dir * cmp(pick(a), pick(b)))
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
