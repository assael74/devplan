// teamProfile/sharedLogic/abilities/insightsLogic/insightsDrawer.breakdown.logic.js

import { getAbilityScoreHex } from '../../../../../../shared/abilities/abilities.utils.js'
import {
  POSITION_LAYERS,
  SQUAD_ROLE_OPTIONS,
  LAYER_TITLES,
} from '../../../../../../shared/players/players.constants.js'
import {
  toNum,
  toPlayersBasedText,
  toScore,
} from './insightsDrawer.rows.logic.js'

function getShortLetterByPosition(key = '') {
  const map = {
    AC: 'AC',
    AL: 'AL',
    AR: 'AR',
    MCL: 'MC',
    MCR: 'MC',
    DM: 'DM',
    DML: 'DM',
    DMR: 'DM',
    DL: 'DL',
    DR: 'DR',
    DCL: 'CB',
    DCR: 'CB',
    GK: 'GK',
    S: 'S',
    __noPos__: '?',
  }

  return map[key] || '?'
}

function buildPositionLabelMap() {
  const map = {}

  Object.values(POSITION_LAYERS || {}).forEach((items) => {
    ;(items || []).forEach((item) => {
      if (!item?.code) return
      map[item.code] = item.label || item.name || item.code
    })
  })

  map.__noPos__ = 'ללא עמדה'
  return map
}

function buildLayerLabelMap() {
  return {
    ...(LAYER_TITLES || {}),
    __noLayer__: 'ללא שכבה',
  }
}

function buildRoleLabelMap() {
  const map = {}

  ;(SQUAD_ROLE_OPTIONS || []).forEach((item) => {
    if (!item?.value) return
    map[item.value] = item.label || item.name || item.value
  })

  map.__unknown__ = 'ללא תפקיד'
  return map
}

function sortBreakdownRows(rows = []) {
  return [...rows].sort((a, b) => {
    const aVal = Number(a?.rawAvg)
    const bVal = Number(b?.rawAvg)

    if (Number.isFinite(aVal) && Number.isFinite(bVal) && aVal !== bVal) {
      return bVal - aVal
    }

    return String(a?.title || '').localeCompare(String(b?.title || ''), 'he')
  })
}

function mapBreakdownNodeToRow(
  key,
  node = {},
  labelMap = {},
  options = {}
) {
  const avg = toNum(node?.level?.avg)
  const playersTotal = Number(node?.playersRaw || 0)
  const playersIncluded = Number(node?.level?.count || 0)

  const {
    icon = 'group',
    useAvatarText = false,
    playersLabel = 'שחקנים',
  } = options

  return {
    id: key,
    title: labelMap?.[key] || key,
    value: toScore(avg),
    ratingValue: Number.isFinite(avg) ? avg : 0,
    subValue: toPlayersBasedText(playersIncluded, playersTotal, playersLabel),
    rowVariant: 'compact',
    icon,
    avatarText: useAvatarText ? getShortLetterByPosition(key) : '',
    accentHex: getAbilityScoreHex(avg),
    valueHex: getAbilityScoreHex(avg),
    endText: '',
    endTextHex: '',
    playersIncluded,
    playersTotal,
    rawAvg: avg,
  }
}

export function buildPositionRows(teamInsightsResult = {}) {
  const byPosition = teamInsightsResult?.metrics?.breakdown?.byPosition || {}
  const labelMap = buildPositionLabelMap()

  const rows = Object.entries(byPosition).map(([key, node]) =>
    mapBreakdownNodeToRow(key, node, labelMap, {
      icon: 'position',
      useAvatarText: true,
      playersLabel: 'שחקנים',
    })
  )

  return sortBreakdownRows(rows)
}

export function buildLayerRows(teamInsightsResult = {}) {
  const byLayer = teamInsightsResult?.metrics?.breakdown?.byLayer || {}
  const labelMap = buildLayerLabelMap()

  const rows = Object.entries(byLayer).map(([key, node]) =>
    mapBreakdownNodeToRow(key, node, labelMap, {
      icon: key,
      useAvatarText: false,
      playersLabel: 'שחקנים',
    })
  )

  return sortBreakdownRows(rows)
}

export function buildRoleRows(teamInsightsResult = {}) {
  const players = Array.isArray(teamInsightsResult?.metrics?.players)
    ? teamInsightsResult.metrics.players
    : []

  const labelMap = buildRoleLabelMap()
  const buckets = {}

  players.forEach((player) => {
    const roleKey = player?.squadRole || '__unknown__'
    if (!buckets[roleKey]) {
      buckets[roleKey] = {
        playersRaw: 0,
        sum: 0,
        count: 0,
      }
    }

    const level = Number(player?.level)
    buckets[roleKey].playersRaw += 1

    if (Number.isFinite(level) && level > 0) {
      buckets[roleKey].sum += level
      buckets[roleKey].count += 1
    }
  })

  const rows = Object.entries(buckets).map(([key, node]) => {
    const avg = node.count ? node.sum / node.count : NaN

    return {
      id: key,
      title: labelMap?.[key] || key,
      value: toScore(avg),
      ratingValue: Number.isFinite(avg) ? avg : 0,
      subValue: toPlayersBasedText(node.count || 0, node.playersRaw || 0, 'שחקנים'),
      icon: 'keyPlayer',
      accentHex: getAbilityScoreHex(avg),
      valueHex: getAbilityScoreHex(avg),
      endText: '',
      endTextHex: '',
      playersIncluded: node.count || 0,
      playersTotal: node.playersRaw || 0,
      rawAvg: avg,
    }
  })

  return sortBreakdownRows(rows)
}
