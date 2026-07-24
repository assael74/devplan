// src/features/hub/teamProfile/sharedLogic/players/print/minutesPlanPrint.model.js

import {
  POSITION_LAYERS,
  SEASON_PLAN_LAYER_TARGETS,
  SEASON_PLAN_POSITION_TARGETS,
  SQUAD_ROLE_OPTIONS,
} from '../../../../../../shared/players/players.constants.js'

import {
  resolvePlayerPrimaryPositionCode,
} from '../../../../../../shared/players/targets/playerTarget.resolve.js'

import {
  MINUTES_PLAN_PRINT_COLUMNS,
  MINUTES_PLAN_ROLE_TARGETS,
} from './teamPlayersPrint.constants.js'

import {
  getSquadRoleMeta,
  mapMinutesPlanPrintRows,
  nameCollator,
  squadRoleOrder,
  UNDEFINED_SQUAD_ROLE,
} from './teamPlayersPrint.shared.js'

const minutesFormatter = new Intl.NumberFormat('he-IL')

function formatMinutes(value) {
  const number = Number(value)

  return Number.isFinite(number) ? minutesFormatter.format(number) : '0'
}

function resolveTargetTone(target, count) {
  const value = Number(count) || 0

  if (target.mode === 'fixed') {
    if (value === target.target) return 'good'
    if (Math.abs(value - target.target) === 1) return 'warn'

    return 'bad'
  }

  if (target.mode === 'range') {
    if (value >= target.min && value <= target.max) return 'good'
    if (value === target.min - 1 || value === target.max + 1) return 'warn'

    return 'bad'
  }

  if (target.mode === 'min') {
    if (value >= target.target && value <= target.target + 2) return 'good'
    if (value >= target.target - 2 && value < target.target) return 'warn'

    return 'bad'
  }

  return 'neutral'
}

function getMinutesTarget(squadRoleValue) {
  return MINUTES_PLAN_ROLE_TARGETS[squadRoleValue] || null
}

function getSquadRoleSummaryMeta(squadRoleValue) {
  const option = SQUAD_ROLE_OPTIONS.find(item => {
    return item.value === squadRoleValue
  })

  const minutesTarget = getMinutesTarget(squadRoleValue)
  const optionLabel = option?.label || ''

  const shortLabel =
    option?.shortLabel ||
    optionLabel.replace(/^שחקן\s+/, '').trim() ||
    'ללא מעמד'

  return {
    id: squadRoleValue,
    value: squadRoleValue,
    label: optionLabel || 'שחקנים ללא מעמד',
    shortLabel,
    iconId: option?.idIcon || 'players',
    iconColor: option?.color || '#64748B',
    defined: Boolean(option),
    minutesTarget,
    requirement: minutesTarget
      ? `${formatMinutes(minutesTarget)} דק׳ לשחקן`
      : '',
    countLabel: '',
  }
}

function buildSquadRoleSummary(rows = []) {
  const items = SQUAD_ROLE_OPTIONS.map(option => {
    const count = rows.filter(row => {
      return getSquadRoleMeta(row).value === option.value
    }).length

    return {
      ...getSquadRoleSummaryMeta(option.value),
      count,
      countLabel: `${count} שחקנים`,
    }
  })

  const undefinedCount = rows.filter(row => {
    return getSquadRoleMeta(row).value === UNDEFINED_SQUAD_ROLE
  }).length

  if (undefinedCount) {
    items.push({
      ...getSquadRoleSummaryMeta(UNDEFINED_SQUAD_ROLE),
      count: undefinedCount,
      tone: 'warning',
      countLabel: `${undefinedCount} שחקנים`,
    })
  }

  return items
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

function resolveLayerKey(row = {}) {
  return getLayerKey(row) || getLayerFallbackKey(row)
}

function isMatchingLayer(row, target) {
  const layerKey = resolveLayerKey(row)

  if (target.value === 'atMidfield') {
    return layerKey === 'atMidfield' || layerKey === 'midfield'
  }

  return layerKey === target.value
}

function buildMinutesLayerSummary(rows = []) {
  const items = SEASON_PLAN_LAYER_TARGETS.map(target => {
    const count = rows.filter(row => {
      return isMatchingLayer(row, target)
    }).length

    const label =
      target.value === 'dmMid'
        ? 'קישור הגנתי'
        : target.value === 'atMidfield'
          ? 'קישור התקפי'
          : target.label

    return {
      ...target,
      label,
      shortLabel: label,
      iconId: 'players',
      iconColor: '#64748B',
      count,
      tone: resolveTargetTone(target, count),
    }
  })

  const undefinedCount = rows.filter(row => {
    return !resolveLayerKey(row)
  }).length

  if (undefinedCount) {
    items.push({
      id: 'undefined',
      value: 'undefined',
      label: 'לא הוגדר',
      shortLabel: 'לא הוגדר',
      requirement: '',
      iconId: 'players',
      iconColor: '#64748B',
      count: undefinedCount,
      tone: 'warning',
    })
  }

  return items
}

function buildPrimaryPositionSummary(rows = []) {
  const countsByCode = rows.reduce((result, row) => {
    const code = resolvePlayerPrimaryPositionCode(row)

    if (!code) return result

    result[code] = (result[code] || 0) + 1

    return result
  }, {})

  const items = SEASON_PLAN_POSITION_TARGETS.map(target => {
    const codes =
      Array.isArray(target.codes) && target.codes.length
        ? target.codes
        : [target.value]

    const count = codes.reduce((total, code) => {
      return total + (countsByCode[code] || 0)
    }, 0)

    return {
      id: target.value,
      value: target.value,
      label: target.label,
      shortLabel: target.label,
      iconId: target.value,
      iconColor: '#64748B',
      count,
      requirement: target.requirement,
      tone: resolveTargetTone(target, count),
    }
  })

  const undefinedCount = rows.filter(row => {
    return !resolvePlayerPrimaryPositionCode(row)
  }).length

  if (undefinedCount) {
    items.push({
      id: 'undefined',
      value: 'undefined',
      label: 'לא הוגדרה עמדה ראשית',
      shortLabel: 'לא הוגדר',
      iconId: 'players',
      iconColor: '#64748B',
      count: undefinedCount,
      requirement: '',
      tone: 'warning',
    })
  }

  return items
}

function getSquadRoleOrder(row = {}) {
  const squadRole = getSquadRoleMeta(row)
  const order = squadRoleOrder[squadRole.value]

  return Number.isFinite(order) ? order : SQUAD_ROLE_OPTIONS.length
}

function sortMinutesPlanRows(rows = []) {
  return [...rows].sort((first, second) => {
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

function createMinutesGroup(option) {
  const squadRole = getSquadRoleSummaryMeta(option.value)

  return {
    id: squadRole.value,
    value: squadRole.value,
    title: squadRole.label,
    shortLabel: squadRole.shortLabel,
    minutesTarget: squadRole.minutesTarget,
    iconId: squadRole.iconId,
    iconColor: squadRole.iconColor,
    defined: squadRole.defined,
    rows: [],
  }
}

function createUndefinedMinutesGroup() {
  const squadRole = getSquadRoleSummaryMeta(UNDEFINED_SQUAD_ROLE)

  return {
    id: squadRole.value,
    value: squadRole.value,
    title: squadRole.label,
    shortLabel: squadRole.shortLabel,
    minutesTarget: null,
    iconId: squadRole.iconId,
    iconColor: squadRole.iconColor,
    defined: false,
    rows: [],
  }
}

function buildMinutesGroupResult(group) {
  const sortedRows = [...group.rows].sort((first, second) => {
    return nameCollator.compare(
      first.playerFullName || '',
      second.playerFullName || ''
    )
  })

  return {
    ...group,
    rows: sortedRows.map((row, index) => ({
      ...row,
      index: index + 1,
    })),
    count: sortedRows.length,
    totalMinutes: sortedRows.length * (group.minutesTarget || 0),
    minutesLabel: group.minutesTarget
      ? `${formatMinutes(group.minutesTarget)} דקות לשחקן`
      : 'שחקנים ללא מעמד',
  }
}

function buildMinutesGroups(rows = []) {
  const groups = SQUAD_ROLE_OPTIONS.map(createMinutesGroup)
  const undefinedGroup = createUndefinedMinutesGroup()
  const groupMap = new Map(groups.map(group => [group.value, group]))

  rows.forEach(row => {
    const squadRoleValue =
      row.squadRole?.value ||
      UNDEFINED_SQUAD_ROLE

    const minutesTarget = getMinutesTarget(squadRoleValue)

    const nextRow = {
      ...row,
      minutesTarget,
      minutesTargetLabel: minutesTarget
        ? formatMinutes(minutesTarget)
        : '—',
    }

    const group = groupMap.get(squadRoleValue) || undefinedGroup

    group.rows.push(nextRow)
  })

  const result = groups
    .filter(group => group.rows.length)
    .map(buildMinutesGroupResult)

  if (undefinedGroup.rows.length) {
    result.push(buildMinutesGroupResult(undefinedGroup))
  }

  return result
}

export function buildMinutesPlanPrintModel(rows = []) {
  const sortedRows = sortMinutesPlanRows(rows)
  const mappedRows = mapMinutesPlanPrintRows(sortedRows)

  return {
    columns: MINUTES_PLAN_PRINT_COLUMNS,
    rows: mappedRows,
    layerSummary: buildMinutesLayerSummary(sortedRows),
    minutesGroups: buildMinutesGroups(mappedRows),
    squadRoleSummary: buildSquadRoleSummary(sortedRows),
    primaryPositionSummary: buildPrimaryPositionSummary(sortedRows),
  }
}
