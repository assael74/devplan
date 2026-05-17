// teamProfile/sharedLogic/players/insightsLogic/alignment/alignment.model.js

import {
  formatRange,
  buildPlayerRef,
  clean,
} from '../common/index.js'

import {
  evaluateRoleUsageTarget,
} from '../targets/index.js'

const buildRoleUsageAlignment = ({
  rows = [],
}) => {
  return rows.map((row) => {
    const roleId = clean(row?.squadRole)
    const stats = row?.playerGamesStats || {}

    const startsPct =
      stats.squadGames > 0
        ? Math.round((stats.startedGames / stats.squadGames) * 100)
        : 0

    const evaluation = evaluateRoleUsageTarget({
      roleId,
      minutesPct: stats.minutesPct,
      startsPct,
    })

    const target = evaluation?.target || null

    return {
      ...buildPlayerRef(row),

      targetLabel: target?.label || 'לא הוגדר יעד מעמד',
      minutesTarget: formatRange(target?.minutesRange),
      startsTarget: formatRange(target?.startsRange),

      evaluation,
      tone: evaluation.tone,
      status: evaluation.status,
    }
  })
}

const buildUnderUsedByRole = ({
  roleUsage = [],
}) => {
  return roleUsage.filter((item) => {
    if (item.squadRole === 'key') return item.minutesPct < 70
    if (item.squadRole === 'core') return item.minutesPct < 50
    if (item.squadRole === 'rotation') return item.minutesPct < 25

    return false
  })
}

const buildOverUsedByRole = ({
  roleUsage = [],
}) => {
  return roleUsage.filter((item) => {
    if (item.squadRole === 'fringe') return item.minutesPct > 25
    if (item.squadRole === 'rotation') return item.minutesPct > 50
    if (item.squadRole === 'core') return item.minutesPct > 70

    return false
  })
}

const buildProjectOpportunity = ({
  rows = [],
}) => {
  const projectRows = rows.filter((row) => {
    return row?.projectChipMeta?.id === 'project'
  })

  const players = projectRows.map((row) => buildPlayerRef(row))

  const lowOpportunity = players.filter((player) => {
    return player.minutesPct < 25 || player.playerPlayedGames === 0
  })

  return {
    total: players.length,
    players,
    lowOpportunity,
    tone: lowOpportunity.length ? 'warning' : 'success',
  }
}

const buildPositionIssues = ({
  positions = [],
}) => {
  const thin = positions.filter((item) => item.status === 'under')
  const overloaded = positions.filter((item) => item.status === 'over')
  const keyOverload = positions.filter((item) => item.status === 'keyOverload')
  const ok = positions.filter((item) => item.status === 'ok')

  const hasIssues =
    thin.length ||
    overloaded.length ||
    keyOverload.length

  return {
    targetLabel: '2–4 שחקנים בעמדה · עד שחקן מפתח אחד',
    ok,
    thin,
    overloaded,
    keyOverload,
    tone: hasIssues ? 'warning' : 'success',
  }
}

const buildPositionStructureAlignment = ({
  structure,
}) => {
  const primary = buildPositionIssues({
    positions: structure?.positions?.primary || structure?.positions?.exact || [],
  })

  const coverage = buildPositionIssues({
    positions: structure?.positions?.coverage || [],
  })

  return {
    primary,
    coverage,

    // תאימות זמנית לשם הישן
    ...primary,
  }
}

export const buildAlignmentModel = ({
  rows = [],
  structure,
} = {}) => {
  const roleUsage = buildRoleUsageAlignment({
    rows,
  })

  return {
    roleUsage,

    underUsedByRole: buildUnderUsedByRole({
      roleUsage,
    }),

    overUsedByRole: buildOverUsedByRole({
      roleUsage,
    }),

    projectOpportunity: buildProjectOpportunity({
      rows,
    }),

    positionStructure: buildPositionStructureAlignment({
      structure,
    }),
  }
}
