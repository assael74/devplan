// src/features/hub/teamProfile/sharedLogic/players/print/minutesPlanPrint.model.js

import {
  POSITION_LAYERS,
  SQUAD_ROLE_OPTIONS,
  SEASON_PLAN_POSITION_TARGETS,
  SEASON_PLAN_LAYER_TARGETS,
} from '../../../../../../shared/players/players.constants.js'
import {
  resolvePlayerPrimaryPositionCode,
} from '../../../../../../shared/players/targets/playerTarget.resolve.js'

import {
  MINUTES_PLAN_PRINT_COLUMNS,
  MINUTES_PLAN_ROLE_TARGETS,
} from './teamPlayersPrint.constants.js'
import {
  mapPlayerPrintRows,
  nameCollator,
  squadRoleOrder,
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

function getMinutesTarget(role) {
  return MINUTES_PLAN_ROLE_TARGETS[role] || null
}

function getRoleMeta(role) {
  const option = SQUAD_ROLE_OPTIONS.find(item => item.value === role)
  const minutesTarget = getMinutesTarget(role)

  return {
    id: role,
    value: role,
    label: option?.label || 'מעמד לא הוגדר',
    shortLabel: option?.label?.replace(/^שחקן\s+/, '').trim() || option?.label || 'לא הוגדר',
    iconId: option?.idIcon || 'players',
    iconColor: option?.color || '#64748B',
    defined: Boolean(option),
    minutesTarget,
    requirement: minutesTarget ? `${formatMinutes(minutesTarget)} דק׳ לשחקן` : '',
    countLabel: '',
  }
}

function buildSquadRoleSummary(rows = []) {
  const items = SQUAD_ROLE_OPTIONS.map(option => {
    const count = rows.filter(row => row.squadRole === option.value).length

    return {
      ...getRoleMeta(option.value),
      count,
      countLabel: `${count} שחקנים`,
    }
  })

  const undefinedCount = rows.filter(row => {
    return !SQUAD_ROLE_OPTIONS.some(option => option.value === row.squadRole)
  }).length

  if (undefinedCount) {
    items.push({
      id: 'undefined',
      value: '',
      label: 'מעמד לא הוגדר',
      shortLabel: 'לא הוגדר',
      iconId: 'players',
      iconColor: '#64748B',
      count: undefinedCount,
      defined: false,
      tone: 'warning',
      minutesTarget: null,
      requirement: '',
      countLabel: `${undefinedCount} שחקנים`,
    })
  }

  return items
}

function buildPositionSummary(rows = []) {
  const buckets = new Map()

  rows.forEach(row => {
    const key = String(
      row.generalPositionKey ||
      row.generalPosition?.layerKey ||
      row.positionLayer ||
      row.layerKey ||
      row.mainPosition ||
      row.primaryPosition ||
      ''
    ).trim() || 'undefined'

    const label = String(
      row.generalPositionLabel ||
      row.generalPosition?.layerLabel ||
      row.layerLabel ||
      row.mainPosition ||
      row.primaryPosition ||
      'לא הוגדר'
    ).trim() || 'לא הוגדר'

    if (!buckets.has(key)) {
      buckets.set(key, {
        id: key,
        value: key,
        label,
        shortLabel: label,
        iconId: key || 'players',
        iconColor: '#64748B',
        count: 0,
      })
    }

    buckets.get(key).count += 1
  })

  return Array.from(buckets.values()).sort((a, b) => {
    const countCompare = b.count - a.count
    if (countCompare !== 0) return countCompare

    return nameCollator.compare(a.label, b.label)
  })
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

function buildMinutesLayerSummary(rows = []) {
  const items = SEASON_PLAN_LAYER_TARGETS.map(item => {
    const count = rows.filter(row => {
      const layerKey = getLayerKey(row) || getLayerFallbackKey(row)

      if (item.value === 'atMidfield') {
        return layerKey === 'atMidfield' || layerKey === 'midfield'
      }

      return layerKey === item.value
    }).length

    const labelOverrides = {
      dmMid: 'קישור הגנתי',
      atMidfield: 'קישור התקפי',
    }

    return {
      ...item,
      label: labelOverrides[item.value] || item.label,
      shortLabel: labelOverrides[item.value] || item.label,
      iconId: 'players',
      iconColor: '#64748B',
      count,
      tone: resolveTargetTone(item, count),
    }
  })

  const undefinedCount = rows.filter(row => {
    return !(getLayerKey(row) || getLayerFallbackKey(row))
  }).length

  items.push({
    id: 'undefined',
    value: '',
    label: 'לא הוגדר',
    shortLabel: 'לא הוגדר',
    requirement: '',
    iconId: 'players',
    iconColor: '#64748B',
    count: undefinedCount,
    tone: 'warning',
  })

  return items
}

const PRIMARY_POSITION_GROUPS = [
  {
    id: 'goalkeeper',
    label: 'שוער',
    shortLabel: 'שוער',
    iconId: 'GK',
    codes: ['GK'],
  },
  {
    id: 'centerBack',
    label: 'בלם',
    shortLabel: 'בלם',
    iconId: 'DCR',
    codes: ['DCR', 'DCL', 'DC'],
  },
  {
    id: 'rightBack',
    label: 'מגן ימין',
    shortLabel: 'מגן ימין',
    iconId: 'DR',
    codes: ['DR'],
  },
  {
    id: 'leftBack',
    label: 'מגן שמאל',
    shortLabel: 'מגן שמאל',
    iconId: 'DL',
    codes: ['DL'],
  },
  {
    id: 'defensiveMid',
    label: 'קשר אחורי',
    shortLabel: 'קשר אחורי',
    iconId: 'DM',
    codes: ['DM', 'DMR', 'DML', 'DMC'],
  },
  {
    id: 'centerMid',
    label: 'קשר אמצע',
    shortLabel: 'קשר אמצע',
    iconId: 'MCR',
    codes: ['MCR', 'MCL', 'MC'],
  },
  {
    id: 'attackingMid',
    label: 'קשר התקפי',
    shortLabel: 'קשר התקפי',
    iconId: 'AC',
    codes: ['AC'],
  },
  {
    id: 'rightWing',
    label: 'כנף ימין',
    shortLabel: 'כנף ימין',
    iconId: 'AR',
    codes: ['AR'],
  },
  {
    id: 'leftWing',
    label: 'כנף שמאל',
    shortLabel: 'כנף שמאל',
    iconId: 'AL',
    codes: ['AL'],
  },
  {
    id: 'striker',
    label: 'חלוץ',
    shortLabel: 'חלוץ',
    iconId: 'S',
    codes: ['S'],
  },
]

function buildPrimaryPositionSummary(rows = []) {
  const countsByCode = rows.reduce((acc, row) => {
    const code = resolvePlayerPrimaryPositionCode(row)
    if (!code) return acc

    acc[code] = (acc[code] || 0) + 1
    return acc
  }, {})

  const items = SEASON_PLAN_POSITION_TARGETS.map(target => {
    const codes = Array.isArray(target.codes) && target.codes.length
      ? target.codes
      : [target.value]
    const count = codes.reduce((sum, code) => sum + (countsByCode[code] || 0), 0)

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

  const undefinedCount = rows.filter(row => !resolvePlayerPrimaryPositionCode(row)).length

  if (undefinedCount) {
    items.push({
      id: 'undefined',
      value: '',
      label: 'לא הוגדרה עמדה ראשית',
      shortLabel: 'לא הוגדר',
      iconId: 'players',
      iconColor: '#64748B',
      count: undefinedCount,
    })
  }

  return items
}

function sortMinutesPlanRows(rows = []) {
  return [...rows].sort((a, b) => {
    const roleCompare =
      (squadRoleOrder[a.squadRole] ?? SQUAD_ROLE_OPTIONS.length) -
      (squadRoleOrder[b.squadRole] ?? SQUAD_ROLE_OPTIONS.length)

    if (roleCompare !== 0) return roleCompare

    return nameCollator.compare(
      a.playerFullName || a.fullName || '',
      b.playerFullName || b.fullName || ''
    )
  })
}

function buildMinutesGroups(rows = []) {
  const groups = SQUAD_ROLE_OPTIONS.map(option => {
    const role = getRoleMeta(option.value)

    return {
      id: option.value,
      value: option.value,
      title: role.label,
      shortLabel: role.shortLabel,
      minutesTarget: role.minutesTarget,
      iconId: role.iconId,
      iconColor: role.iconColor,
      defined: true,
      rows: [],
    }
  })

  const undefinedGroup = {
    id: 'undefined',
    value: '',
    title: 'מעמד לא הוגדר',
    shortLabel: 'לא הוגדר',
    minutesTarget: null,
    iconId: 'players',
    iconColor: '#64748B',
    defined: false,
    rows: [],
  }

  const groupMap = new Map(groups.map(group => [group.value, group]))

  rows.forEach(row => {
    const roleId = row.role?.value || ''
    const target = getMinutesTarget(roleId)
    const nextRow = {
      ...row,
      minutesTarget: target,
      minutesTargetLabel: target ? formatMinutes(target) : '—',
    }

    const group = groupMap.get(roleId) || undefinedGroup
    group.rows.push(nextRow)
  })

  const result = groups
    .filter(group => group.rows.length)
    .map(group => {
      const sortedRows = [...group.rows].sort((a, b) => {
        return nameCollator.compare(a.name || '', b.name || '')
      })

      return {
        ...group,
        rows: sortedRows,
        count: sortedRows.length,
        totalMinutes: sortedRows.length * (group.minutesTarget || 0),
        minutesLabel: group.minutesTarget
          ? `${formatMinutes(group.minutesTarget)} דקות לשחקן`
          : 'ללא יעד מוגדר',
      }
    })

  if (undefinedGroup.rows.length) {
    const sortedRows = [...undefinedGroup.rows].sort((a, b) => {
      return nameCollator.compare(a.name || '', b.name || '')
    })

    result.push({
      ...undefinedGroup,
      rows: sortedRows,
      count: sortedRows.length,
      totalMinutes: 0,
      minutesLabel: 'ללא יעד מוגדר',
    })
  }

  return result
}

export function buildMinutesPlanPrintModel(rows = []) {
  const sortedRows = sortMinutesPlanRows(rows)
  const mappedRows = mapPlayerPrintRows(sortedRows)
  const layerSummary = buildMinutesLayerSummary(sortedRows)
  const minutesGroups = buildMinutesGroups(mappedRows)
  const estimatedPages = Math.max(
    2,
    Math.ceil(mappedRows.length / 18) + 1
  )

  return {
    columns: MINUTES_PLAN_PRINT_COLUMNS,
    rows: mappedRows,
    layerSummary,
    minutesGroups,
    squadRoleSummary: buildSquadRoleSummary(sortedRows),
    positionSummary: buildPositionSummary(sortedRows),
    primaryPositionSummary: buildPrimaryPositionSummary(sortedRows),
    printPages: mappedRows.length ? estimatedPages : 1,
  }
}
