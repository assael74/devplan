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
  getSquadRoleMeta,
  mapSeasonPlanPrintRow,
  nameCollator,
  normalizeSeasonPlanStatus,
  squadRoleOrder,
} from './teamPlayersPrint.shared.js'

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

function resolveLayerKey(row = {}) {
  return getLayerKey(row) || getLayerFallbackKey(row)
}

function isMatchingLayer(row, item) {
  const layerKey = resolveLayerKey(row)

  if (item.id === 'atMidfield') {
    return layerKey === 'atMidfield' || layerKey === 'midfield'
  }

  return layerKey === item.id
}

function getPlannedStatusOrder(row = {}) {
  const value = normalizeSeasonPlanStatus(row)
  const order = PLANNED_STATUS_ORDER[value]

  return Number.isFinite(order) ? order : 99
}

function getSquadRoleOrder(row = {}) {
  const squadRole = getSquadRoleMeta(row)
  const order = squadRoleOrder[squadRole.value]

  return Number.isFinite(order) ? order : SQUAD_ROLE_OPTIONS.length
}

function sortSeasonPlanGroupRows(group, rows = []) {
  return [...rows].sort((first, second) => {
    if (group.id === 'planned') {
      const statusCompare =
        getPlannedStatusOrder(first) -
        getPlannedStatusOrder(second)

      if (statusCompare !== 0) return statusCompare
    }

    const squadRoleCompare =
      getSquadRoleOrder(first) -
      getSquadRoleOrder(second)

    if (squadRoleCompare !== 0) return squadRoleCompare

    return nameCollator.compare(
      first.playerFullName || first.fullName || first.name || '',
      second.playerFullName || second.fullName || second.name || ''
    )
  })
}

export function buildSeasonPlanSummary(rows = []) {
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

export function buildSeasonPlanLayerSummary(rows = []) {
  return SEASON_PLAN_LAYER_ITEMS.map(item => ({
    ...item,
    iconId: 'players',
    iconColor: '#64748B',
    count: rows.filter(row => isMatchingLayer(row, item)).length,
  }))
}

export function buildSeasonPlanGroups(rows = []) {
  return SEASON_PLAN_REPORT_GROUPS.map(group => {
    const groupRows = rows.filter(row => {
      return group.statusValues.includes(normalizeSeasonPlanStatus(row))
    })

    const sortedRows = sortSeasonPlanGroupRows(group, groupRows)

    return {
      ...group,
      rows: sortedRows.map((row, index) => {
        return mapSeasonPlanPrintRow(row, index)
      }),
    }
  })
}

export function buildSeasonPlanPrintModel(rows = []) {
  return {
    columns: SEASON_PLAN_PRINT_COLUMNS,
    rows: rows.map((row, index) => {
      return mapSeasonPlanPrintRow(row, index)
    }),
    seasonPlanSummary: buildSeasonPlanSummary(rows),
    seasonPlanLayerSummary: buildSeasonPlanLayerSummary(rows),
    squadGroups: buildSeasonPlanGroups(rows),
  }
}
