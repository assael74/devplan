// teamProfile/sharedLogic/players/insightsLogic/targets/targets.model.js

import {
  POSITION_LAYERS,
  LAYER_TITLES,
  SQUAD_ROLE_OPTIONS,
} from '../../../../../../../shared/players/players.constants.js'

import {
  getPlayerRoleTarget,
} from '../../../../../../../shared/players/targets/index.js'

import {
  clean,
  pct,
  toNum,
} from '../common/index.js'

export const ROLE_STRUCTURE_TARGETS = {
  key: {
    id: 'key',
    label: 'שחקני מפתח',
    pctRange: [10, 20],
    min: 2,
    max: 5,
  },
  core: {
    id: 'core',
    label: 'שחקנים מרכזיים',
    pctRange: [20, 35],
    min: 4,
    max: 8,
  },
  rotation: {
    id: 'rotation',
    label: 'שחקני רוטציה',
    pctRange: [30, 45],
    min: 6,
    max: 12,
  },
  fringe: {
    id: 'fringe',
    label: 'אחרונים בסגל',
    pctRange: [10, 25],
    min: 2,
    max: 7,
  },
  none: {
    id: 'none',
    label: 'לא הוגדר מעמד',
    pctRange: [0, 5],
    min: 0,
    max: 2,
  },
}

export const POSITION_STRUCTURE_TARGETS = {
  minPlayersPerExactPosition: 2,
  maxPlayersPerExactPosition: 4,
  maxKeyPlayersPerExactPosition: 1,
}

const getRoleLabel = (roleId) => {
  const found = SQUAD_ROLE_OPTIONS.find((item) => item.value === roleId)

  return found?.label || ROLE_STRUCTURE_TARGETS[roleId]?.label || 'לא הוגדר מעמד'
}

const buildExactPositionTargets = () => {
  const items = []

  Object.entries(POSITION_LAYERS || {}).forEach(([layerKey, list]) => {
    ;(Array.isArray(list) ? list : []).forEach((item) => {
      items.push({
        id: item.code,
        label: item.label || item.code,
        layerKey,
        layerLabel: LAYER_TITLES?.[layerKey] || layerKey,
        target: {
          min: POSITION_STRUCTURE_TARGETS.minPlayersPerExactPosition,
          max: POSITION_STRUCTURE_TARGETS.maxPlayersPerExactPosition,
          maxKey: POSITION_STRUCTURE_TARGETS.maxKeyPlayersPerExactPosition,
        },
      })
    })
  })

  return items
}

export const evaluateCountTarget = ({
  actual,
  min,
  max,
}) => {
  const value = toNum(actual)

  if (value < toNum(min)) {
    return {
      status: 'under',
      tone: 'warning',
      gap: value - toNum(min),
    }
  }

  if (max !== null && max !== undefined && value > toNum(max)) {
    return {
      status: 'over',
      tone: 'warning',
      gap: value - toNum(max),
    }
  }

  return {
    status: 'ok',
    tone: 'success',
    gap: 0,
  }
}

export const evaluatePctRangeTarget = ({
  actualPct,
  range,
}) => {
  const value = toNum(actualPct)
  const min = toNum(range?.[0])
  const max = toNum(range?.[1])

  if (value < min) {
    return {
      status: 'under',
      tone: 'warning',
      gap: value - min,
    }
  }

  if (value > max) {
    return {
      status: 'over',
      tone: 'warning',
      gap: value - max,
    }
  }

  return {
    status: 'ok',
    tone: 'success',
    gap: 0,
  }
}

export const evaluateRoleUsageTarget = ({
  roleId,
  minutesPct,
  startsPct,
}) => {
  const roleTarget = getPlayerRoleTarget(roleId)

  if (!roleTarget) {
    return {
      hasTarget: false,
      tone: 'neutral',
      status: 'missing',
      target: null,
    }
  }

  const minutes = evaluatePctRangeTarget({
    actualPct: minutesPct,
    range: roleTarget.minutesRange,
  })

  const starts = evaluatePctRangeTarget({
    actualPct: startsPct,
    range: roleTarget.startsRange,
  })

  const tone =
    minutes.status === 'ok' && starts.status === 'ok'
      ? 'success'
      : 'warning'

  return {
    hasTarget: true,
    tone,
    status: tone === 'success' ? 'ok' : 'gap',
    target: roleTarget,
    minutes,
    starts,
  }
}

export const buildTeamPlayersTargetsModel = ({
  rows = [],
} = {}) => {
  const total = rows.length

  const roleStructure = Object.keys(ROLE_STRUCTURE_TARGETS).map((roleId) => {
    const target = ROLE_STRUCTURE_TARGETS[roleId]
    const count = rows.filter((row) => {
      const value = clean(row?.squadRole) || 'none'
      return value === roleId
    }).length

    const actualPct = pct(count, total)

    const countEvaluation = evaluateCountTarget({
      actual: count,
      min: target.min,
      max: target.max,
    })

    const pctEvaluation = evaluatePctRangeTarget({
      actualPct,
      range: target.pctRange,
    })

    return {
      ...target,
      count,
      actualPct,
      label: getRoleLabel(roleId),
      countEvaluation,
      pctEvaluation,
      tone:
        countEvaluation.tone === 'success' &&
        pctEvaluation.tone === 'success'
          ? 'success'
          : 'warning',
    }
  })

  return {
    roleStructure,
    exactPositions: buildExactPositionTargets(),
    roleUsage: {
      source: 'PLAYER_ROLE_TARGETS',
    },
    positionStructure: POSITION_STRUCTURE_TARGETS,
  }
}
