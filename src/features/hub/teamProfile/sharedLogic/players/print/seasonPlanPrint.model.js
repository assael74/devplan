// features/hub/teamProfile/sharedLogic/players/print/seasonPlanPrint.model.js

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

function getLayerKey(row = {}) {
  const generalPosition = row.generalPosition || {}

  return String(
    row.generalPositionKey ||
    generalPosition.layerKey ||
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
  const seasonPlanStatus = row.seasonPlanStatus || {}
  const order = PLANNED_STATUS_ORDER[seasonPlanStatus.value]

  return Number.isFinite(order) ? order : 99
}

function getSquadRoleOrder(row = {}) {
  const role = row.role || {}
  const order = squadRoleOrder[role.value]

  return Number.isFinite(order) ? order : SQUAD_ROLE_OPTIONS.length
}

function sortSeasonPlanGroupRows(group, rows = []) {
  return [...rows].sort((a, b) => {
    if (group.id === 'planned') {
      const statusCompare = getPlannedStatusOrder(a) - getPlannedStatusOrder(b)

      if (statusCompare !== 0) return statusCompare
    }

    const roleCompare = getSquadRoleOrder(a) - getSquadRoleOrder(b)

    if (roleCompare !== 0) return roleCompare

    return nameCollator.compare(a.name || '', b.name || '')
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
      const seasonPlanStatus = row.seasonPlanStatus || {}

      return group.statusValues.includes(seasonPlanStatus.value)
    })

    return {
      ...group,
      rows: sortSeasonPlanGroupRows(group, groupRows).map((row, index) => ({
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
