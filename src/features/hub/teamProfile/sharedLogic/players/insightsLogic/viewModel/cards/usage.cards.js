// teamProfile/sharedLogic/players/viewModel/cards/usage.cards.js

import {
  buildTooltip,
} from '../tooltips/index.js'

const emptyArray = []

const getBasicTone = (count) => {
  return count > 0 ? 'warning' : 'success'
}

const getUsageRoleTone = (role = {}) => {
  if (!role.checked) return 'neutral'
  if (!role.deviationCount) return 'success'

  const rate = Number(role.deviationRate || 0)

  if (role.checked >= 3 && rate >= 50) {
    return 'danger'
  }

  return 'warning'
}

const formatPct = (value) => {
  const n = Number(value)

  if (!Number.isFinite(n)) return '0%'

  return `${Math.round(n)}%`
}

const formatRange = (range = {}) => {
  const min = Number(range.min)
  const max = Number(range.max)

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return 'לא הוגדר טווח'
  }

  if (max >= 100) {
    return `${min}%+`
  }

  return `${min}%–${max}%`
}

const getRoleValue = (role = {}) => {
  const deviationCount = Number(role.deviationCount || 0)

  if (!deviationCount) {
    return 'תקין'
  }

  return `${deviationCount} חריגות`
}

const getRoleSub = (role = {}) => {
  return [
    `${role.total || 0} שחקנים`,
    `${role.ok || 0} בטווח`,
    `${role.under || 0} חסר`,
    `${role.over || 0} יתר`,
  ].join(' · ')
}

const getRoleHelper = (role = {}) => {
  return `טווח מצופה: ${formatRange(role.expectedRange)}`
}

const getRolePlayers = (role = {}) => {
  return [
    ...(role?.players?.under || emptyArray),
    ...(role?.players?.over || emptyArray),
  ]
}

export const buildUsageCards = ({
  usage = {},
} = {}) => {
  const byRole = usage?.byRole || emptyArray

  return byRole.map((role) => {
    const deviationCount = Number(role.deviationCount || 0)

    return {
      id: `usageRole_${role.roleId}`,
      label: role.label,
      value: getRoleValue(role),
      sub: getRoleSub(role),
      helper: getRoleHelper(role),
      icon: 'playTimeRate',
      color: getUsageRoleTone(role),
      tooltip: buildTooltip({
        title: role.label,
        actual: `${deviationCount} חריגות מתוך ${role.checked || 0} נבדקו`,
        target: getRoleHelper(role),
        status: deviationCount
          ? 'קיימות חריגות שימוש במעמד'
          : 'השימוש תואם את המעמד',
        basis: 'minutesPct מול טווח דקות מצופה לפי מעמד',
        players: getRolePlayers(role),
      }),
    }
  })
}

export const buildUsageSummaryChips = ({
  usage = {},
} = {}) => {
  const summary = usage?.summary || {}

  return [
    {
      id: 'deviations',
      label: 'חריגות',
      value: `${summary.deviatedPlayers || 0} · ${formatPct(summary.deviationRate)}`,
      icon: 'warning',
      color: getBasicTone(summary.deviatedPlayers),
      inline: true,
    },
    {
      id: 'underUsed',
      label: 'חסר',
      value: summary.underCount || 0,
      icon: 'warning',
      color: getBasicTone(summary.underCount),
      inline: true,
    },
    {
      id: 'overUsed',
      label: 'יתר',
      value: summary.overCount || 0,
      icon: 'playTimeRate',
      color: getBasicTone(summary.overCount),
      inline: true,
    },
  ]
}
