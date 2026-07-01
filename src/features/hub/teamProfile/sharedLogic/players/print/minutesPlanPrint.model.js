// src/features/hub/teamProfile/sharedLogic/players/print/minutesPlanPrint.model.js

import {
  SQUAD_ROLE_OPTIONS,
} from '../../../../../../shared/players/players.constants.js'

import {
  MINUTES_PLAN_PRINT_COLUMNS,
} from './teamPlayersPrint.constants.js'
import {
  mapPlayerPrintRows,
  nameCollator,
  squadRoleOrder,
} from './teamPlayersPrint.shared.js'

function buildSquadRoleSummary(rows = []) {
  const items = SQUAD_ROLE_OPTIONS.map(option => ({
    id: option.value,
    value: option.value,
    label: option.label,
    shortLabel: option.label.replace(/^שחקן\s*/, '').trim(),
    iconId: option.idIcon,
    iconColor: option.color || '#64748B',
    count: rows.filter(row => row.squadRole === option.value).length,
  }))

  const undefinedCount = rows.filter(row => {
    return !SQUAD_ROLE_OPTIONS.some(option => option.value === row.squadRole)
  }).length

  if (undefinedCount) {
    items.push({
      id: 'undefined',
      value: '',
      label: 'לא הוגדר מעמד',
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

export function buildMinutesPlanPrintModel(rows = []) {
  const sortedRows = sortMinutesPlanRows(rows)

  return {
    columns: MINUTES_PLAN_PRINT_COLUMNS,
    rows: mapPlayerPrintRows(sortedRows),
    squadRoleSummary: buildSquadRoleSummary(sortedRows),
  }
}
