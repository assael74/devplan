// teamProfile/sharedUi/insights/teamPlayers/cards/structure.cards.js

import {
  buildTooltip,
} from '../tooltips/index.js'

const emptyArray = []

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

const pct = (part, total) => {
  const a = Number(part) || 0
  const b = Number(total) || 0

  if (!b) return 0

  return Math.round((a / b) * 100)
}

const getTargetCountRange = ({
  active,
  target = {},
}) => {
  const minFromCount = Number(target.min)
  const maxFromCount = Number(target.max)

  const pctRange = Array.isArray(target.pctRange)
    ? target.pctRange
    : []

  const minFromPct = pctRange.length >= 2
    ? Math.round((Number(pctRange[0]) / 100) * active)
    : null

  const maxFromPct = pctRange.length >= 2
    ? Math.round((Number(pctRange[1]) / 100) * active)
    : null

  const min = Number.isFinite(minFromPct)
    ? Math.max(minFromCount || 0, minFromPct)
    : minFromCount || 0

  const max = Number.isFinite(maxFromPct)
    ? Math.min(maxFromCount || maxFromPct, maxFromPct)
    : maxFromCount || 0

  return {
    min,
    max,
  }
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

const getPositionCardStatus = (status) => {
  if (status === 'ok') return 'עומד ביעד'
  if (status === 'under') return 'מתחת למינימום'
  if (status === 'over') return 'מעל המקסימום'
  if (status === 'keyOverload') return 'יותר משחקן מפתח אחד בעמדה'

  return 'ללא הערכה'
}

const getPositionRangeStatus = (status) => {
  if (status === 'under') return 'under'
  if (status === 'over') return 'over'
  if (status === 'keyOverload') return 'keyOverload'
  if (status === 'ok') return 'ok'

  return 'neutral'
}

const getPositionTargetText = (item = {}) => {
  const min = item.minTarget ?? item?.target?.min ?? 2
  const max = item.maxTarget ?? item?.target?.max ?? 4
  const maxKey = item.maxKeyTarget ?? item?.target?.maxKey ?? 1

  return `${min}–${max} שחקנים · עד ${maxKey} שחקן מפתח`
}

const getPositionSubText = (item = {}) => {
  const min = item.minTarget ?? item?.target?.min ?? 2
  const max = item.maxTarget ?? item?.target?.max ?? 4
  const maxKey = item.maxKeyTarget ?? item?.target?.maxKey ?? 1

  return `יעד ${min}–${max} · מפתח עד ${maxKey}`
}

const getPositionModeLabel = (mode) => {
  return mode === 'coverage'
    ? 'כל העמדות'
    : 'עמדה ראשית'
}

export const buildStructureCards = ({
  structure = {},
} = {}) => {
  const squad = structure?.squad || {}
  const total = squad.total || 0
  const active = squad.active || 0
  const nonActive = squad.nonActive || 0

  return [
    {
      id: 'activePlayers',
      label: 'שחקנים פעילים',
      value: active,
      sub: `מתוך ${total} משויכים`,
      icon: 'players',
      color: 'neutral',
      tooltip: buildTooltip({
        title: 'שחקנים פעילים',
        actual: `${active} שחקנים פעילים`,
        target: 'סגל מקצועי פעיל ומוגדר',
        status: `${nonActive} לא פעילים · ${total} משויכים בסך הכול`,
        basis: 'הניתוח המקצועי מתבסס על שחקנים פעילים בלבד',
      }),
    },

    {
      id: 'inactivePlayers',
      label: 'לא פעילים',
      value: nonActive,
      sub: `${pct(nonActive, total)}% מהמשויכים`,
      icon: 'close',
      color: nonActive ? 'warning' : 'success',
      tooltip: buildTooltip({
        title: 'שחקנים לא פעילים',
        actual: `${nonActive} שחקנים`,
        target: 'סגל פעיל נקי ככל האפשר',
        status: nonActive ? 'קיימים שחקנים לא פעילים' : 'אין שחקנים לא פעילים',
        basis: 'active !== true',
      }),
    },

    {
      id: 'withoutRole',
      label: 'ללא מעמד',
      value: squad.withoutRole || 0,
      sub: `${pct(squad.withoutRole || 0, active)}% מהפעילים`,
      icon: 'noneType',
      color: squad.withoutRole ? 'warning' : 'success',
      tooltip: buildTooltip({
        title: 'שחקנים ללא מעמד',
        actual: `${squad.withoutRole || 0} שחקנים`,
        target: 'לכל שחקן פעיל צריך להיות מעמד מקצועי',
        status: squad.withoutRole ? 'דורש השלמת הגדרה' : 'כל הפעילים מוגדרים',
        basis: 'squadRole ריק או חסר',
      }),
    },

    {
      id: 'withoutPrimaryPosition',
      label: 'ללא עמדה ראשית',
      value: squad.withoutPrimaryPosition || 0,
      sub: `${pct(squad.withoutPrimaryPosition || 0, active)}% מהפעילים`,
      icon: 'position',
      color: squad.withoutPrimaryPosition ? 'warning' : 'success',
      tooltip: buildTooltip({
        title: 'שחקנים ללא עמדה ראשית',
        actual: `${squad.withoutPrimaryPosition || 0} שחקנים`,
        target: 'לכל שחקן פעיל צריכה להיות עמדה ראשית',
        status: squad.withoutPrimaryPosition
          ? 'דורש השלמת עמדה ראשית'
          : 'כל הפעילים עם עמדה ראשית',
        basis: 'primaryPosition קיים ונמצא בתוך positions',
      }),
    },
  ]
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

    const status = getRoleRangeStatus({
      count,
      active,
      role,
    })

    return {
      id: item.id,
      label: item.label,
      value: `${count} · ${activePct}%`,
      sub: `יעד: ${getRoleTargetText({ role, active })}`,
      icon: item.icon,
      color: 'neutral',
      rangeStatus: status,
      tooltip: buildTooltip({
        title: item.label,
        actual: `${count} שחקנים · ${activePct}% מהסגל הפעיל`,
        target: getRoleTargetText({
          role,
          active,
        }),
        status: getRoleStatusText(status),
        basis: 'חלוקת מעמד לפי שחקנים פעילים בסגל',
        listTitle: 'שחקנים במעמד',
        players: role.players,
      }),
    }
  })
}

// תאימות לאחור אם ה־hook עדיין מייבא buildRoleChips
export const buildRoleChips = buildRoleCards

export const buildPositionCards = ({
  structure = {},
  mode = 'primary',
} = {}) => {
  const positions =
    mode === 'coverage'
      ? structure?.positions?.coverage || emptyArray
      : structure?.positions?.primary || structure?.positions?.exact || emptyArray

  return positions.map((item) => ({
    id: item.id,
    label: item.label,
    value: item.count,
    sub: getPositionSubText(item),
    icon: item.id,
    layerKey: item.layerKey,
    layerLabel: item.layerLabel,
    color: 'neutral',
    rangeStatus: getPositionRangeStatus(item.status),
    tooltip: buildTooltip({
      title: item.label,
      actual: `${item.count} שחקנים · ${item.keyCount || 0} שחקני מפתח`,
      target: getPositionTargetText(item),
      status: getPositionCardStatus(item.status),
      basis: `${getPositionModeLabel(mode)} + בדיקת ריכוז שחקני מפתח`,
      listTitle: mode === 'coverage'
        ? 'שחקנים שמכסים את העמדה'
        : 'שחקנים שזו עמדתם הראשית',
      players: item.players,
    }),
  }))
}

export const buildProjectCards = ({
  structure = {},
} = {}) => {
  const project = structure?.project || {}
  const total = project.total || 0

  return [
    {
      id: 'project',
      label: 'פרויקט',
      value: project.totalProject || 0,
      sub: `${pct(project.totalProject || 0, total)}% מהסגל`,
      icon: 'project',
      color: 'success',
      tooltip: buildTooltip({
        title: 'שחקני פרויקט',
        actual: `${project.totalProject || 0} שחקנים`,
        status: `${pct(project.totalProject || 0, total)}% מהסגל הפעיל`,
        basis: 'type project או projectStatus approved',
        listTitle: 'שחקני פרויקט',
        players: project.projectPlayers,
      }),
    },

    {
      id: 'candidate',
      label: 'מועמדים',
      value: project.totalCandidate || 0,
      sub: `${pct(project.totalCandidate || 0, total)}% מהסגל`,
      icon: 'candidate',
      color: 'primary',
      tooltip: buildTooltip({
        title: 'מועמדים לפרויקט',
        actual: `${project.totalCandidate || 0} שחקנים`,
        status: `${pct(project.totalCandidate || 0, total)}% מהסגל הפעיל`,
        basis: 'כל סטטוס מועמדות שאינו אישור או סירוב',
        listTitle: 'מועמדים',
        players: project.candidatePlayers,
      }),
    },

    {
      id: 'declined',
      label: 'סירוב',
      value: project.totalDeclined || 0,
      sub: `${pct(project.totalDeclined || 0, total)}% מהסגל`,
      icon: 'declined',
      color: 'danger',
      tooltip: buildTooltip({
        title: 'סירוב לפרויקט',
        actual: `${project.totalDeclined || 0} שחקנים`,
        status: `${pct(project.totalDeclined || 0, total)}% מהסגל הפעיל`,
        basis: 'projectStatus declined / rejected',
        listTitle: 'שחקנים שסירבו',
        players: project.declinedPlayers,
      }),
    },

    {
      id: 'general',
      label: 'כללי',
      value: project.totalGeneral || 0,
      sub: `${pct(project.totalGeneral || 0, total)}% מהסגל`,
      icon: 'noneType',
      color: 'neutral',
      tooltip: buildTooltip({
        title: 'שחקנים כלליים',
        actual: `${project.totalGeneral || 0} שחקנים`,
        status: `${pct(project.totalGeneral || 0, total)}% מהסגל הפעיל`,
        basis: 'לא פרויקט, לא מועמד ולא סירוב',
        listTitle: 'שחקנים כלליים',
        players: project.generalPlayers,
      }),
    },
  ]
}
