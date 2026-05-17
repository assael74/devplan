// src/features/hub/teamProfile/sharedLogic/players/insightsLogic/viewModel/cards/role.cards.js

import {
  emptyArray,
  getTargetCountRange,
  pct,
} from '../common/index.js'

import {
  buildTooltip,
} from '../tooltips/index.js'

const roleOrder = [
  {
    id: 'key',
    label: 'שחקני מפתח',
    icon: 'keyPlayer',
  },
  {
    id: 'core',
    label: 'מרכזיים',
    icon: 'corePlayer',
  },
  {
    id: 'rotation',
    label: 'רוטציה',
    icon: 'rotation',
  },
  {
    id: 'fringe',
    label: 'אחרונים בסגל',
    icon: 'fringe',
  },
]

const getRole = (roles = [], id) => {
  return roles.find((item) => item.id === id) || {}
}

const getRoleTargetText = ({
  role = {},
  active,
}) => {
  const target = role?.target || {}

  const range = getTargetCountRange({
    active,
    target,
  })

  const pctRange = Array.isArray(target.pctRange)
    ? target.pctRange
    : []

  if (pctRange.length >= 2) {
    return `${range.min}–${range.max} שחקנים · ${pctRange[0]}%–${pctRange[1]}%`
  }

  return `${range.min}–${range.max} שחקנים`
}

const getRoleRangeStatus = ({
  count,
  active,
  role = {},
}) => {
  const range = getTargetCountRange({
    active,
    target: role?.target || {},
  })

  if (count < range.min) return 'under'
  if (range.max && count > range.max) return 'over'

  return 'ok'
}

const getRoleStatusText = (status) => {
  if (status === 'under') return 'מתחת ליעד'
  if (status === 'over') return 'מעל היעד'
  if (status === 'ok') return 'בטווח היעד'

  return 'ללא הערכה'
}

export const buildRoleCards = ({
  structure = {},
} = {}) => {
  const squad = structure?.squad || {}
  const active = squad.active || 0
  const roles = structure?.roles || emptyArray

  return roleOrder.map((item) => {
    const role = getRole(roles, item.id)
    const count = role.count || 0
    const activePct = pct(count, active)

    const range = getTargetCountRange({
      active,
      target: role?.target || {},
    })

    const status = getRoleRangeStatus({
      count,
      active,
      role,
    })

    const players = Array.isArray(role.players)
      ? role.players
      : emptyArray

    return {
      id: item.id,
      label: item.label,
      value: `${count} · ${activePct}%`,
      valueRaw: count,
      count,
      pct: activePct,
      sub: `יעד: ${getRoleTargetText({ role, active })}`,
      icon: item.icon,
      color: 'neutral',
      rangeStatus: status,
      status,
      minTarget: range.min,
      maxTarget: range.max,
      target: role.target,
      players,
      tooltip: buildTooltip({
        //title: item.label,
        //actual: `${count} שחקנים · ${activePct}% מהסגל הפעיל`,
        //target: getRoleTargetText({
        //  role,
        //  active,
        //}),
        //status: getRoleStatusText(status),
        basis: 'חלוקת מעמד לפי שחקנים פעילים בסגל',
        listTitle: '',
        players,
      }),
    }
  })
}
