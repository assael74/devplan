// src/features/hub/teamProfile/sharedLogic/players/print/seasonPlanPrint.model.js

import {
  POSITION_LAYERS,
  SEASON_PLAN_STATUS_OPTIONS,
  SQUAD_ROLE_OPTIONS,
} from '../../../../../../shared/players/players.constants.js'

import {
  PLANNED_STATUS_ORDER,
  SEASON_PLAN_LAYER_ITEMS,
  SEASON_PLAN_PRINT_COLUMNS,
  SEASON_PLAN_REPORT_GROUPS,
} from './teamPlayersPrint.constants.js'
import {
  mapPlayerPrintRows,
  nameCollator,
  normalizeSeasonPlanStatus,
  squadRoleOrder,
} from './teamPlayersPrint.shared.js'

function buildSeasonPlanSummary(rows = []) {
  return SEASON_PLAN_STATUS_OPTIONS.map(option => ({
    id: option.value,
    value: option.value,
    label: option.label,
    shortLabel: option.shortLabel,
    iconId: option.idIcon,
    iconColor: option.color || '#64748B',
    tone: option.tone,
    count: rows.filter(row => {
      return normalizeSeasonPlanStatus(row) === option.value
    }).length,
  }))
}

function getLayerKey(row = {}) {
  return String(
    row.generalPositionKey ||
    row.generalPosition?.layerKey ||
    row.positionLayer ||
    row.layerKey ||
    ''
  ).trim()
}

function getLayerFallbackKey(row = {}) {
  const positions = Array.isArray(row.positions) ? row.positions : []

  for (const [layerKey, items] of Object.entries(POSITION_LAYERS || {})) {
    const list = Array.isArray(items) ? items : []

    if (list.some(item => positions.includes(item.code))) {
      return layerKey
    }
  }

  return ''
}

function buildSeasonPlanLayerSummary(rows = []) {
  return SEASON_PLAN_LAYER_ITEMS.map(item => {
    const count = rows.filter(row => {
      const layerKey = getLayerKey(row) || getLayerFallbackKey(row)

      if (item.id === 'atMidfield') {
        return layerKey === 'atMidfield' || layerKey === 'midfield'
      }

      return layerKey === item.id
    }).length

    return {
      ...item,
      iconId: 'players',
      iconColor: '#64748B',
      count,
    }
  })
}

function sortGroupRows(group, rows = []) {
  return [...rows].sort((a, b) => {
    if (group.id === 'planned') {
      const statusCompare =
        (PLANNED_STATUS_ORDER[a.seasonPlanStatus?.value] ?? 99) -
        (PLANNED_STATUS_ORDER[b.seasonPlanStatus?.value] ?? 99)

      if (statusCompare !== 0) return statusCompare
    }

    const roleCompare =
      (squadRoleOrder[a.role?.value] ?? SQUAD_ROLE_OPTIONS.length) -
      (squadRoleOrder[b.role?.value] ?? SQUAD_ROLE_OPTIONS.length)

    if (roleCompare !== 0) return roleCompare

    return nameCollator.compare(a.name || '', b.name || '')
  })
}

function buildSeasonPlanGroups(rows = []) {
  return SEASON_PLAN_REPORT_GROUPS.map(group => {
    const groupRows = rows.filter(row => {
      return group.statusValues.includes(row.seasonPlanStatus?.value)
    })

    return {
      ...group,
      rows: sortGroupRows(group, groupRows).map((row, index) => ({
        ...row,
        index: index + 1,
      })),
    }
  })
}

export function buildSeasonPlanPrintModel(rows = []) {
  const mappedRows = mapPlayerPrintRows(rows)

  return {
    columns: SEASON_PLAN_PRINT_COLUMNS,
    rows: mappedRows,
    seasonPlanSummary: buildSeasonPlanSummary(rows),
    seasonPlanLayerSummary: buildSeasonPlanLayerSummary(rows),
    squadGroups: buildSeasonPlanGroups(mappedRows),
  }
}
