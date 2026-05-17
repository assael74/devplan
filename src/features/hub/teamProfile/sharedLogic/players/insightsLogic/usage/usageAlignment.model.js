// teamProfile/sharedLogic/players/insightsLogic/usage/usageAlignment.model.js

import {
  getPlayerRoleTarget,
} from '../../../../../../../shared/players/targets/index.js'

const emptyArray = []

const ROLE_ORDER = [
  'key',
  'core',
  'rotation',
  'fringe',
]

const STATUS_LABELS = {
  under: 'חסר',
  ok: 'תקין',
  over: 'יתר',
  noRole: 'ללא מעמד',
  noData: 'ללא נתונים',
}

const toNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const pct = (value, total) => {
  const n = toNumber(value)
  const t = toNumber(total)

  if (!t) return 0

  return Math.round((n / t) * 100)
}

const getRowStats = (row = {}) => {
  return row?.playerGamesStats || {}
}

const getRoleId = (row = {}) => {
  return row?.squadRole || ''
}

const getRoleLabel = (roleId) => {
  return (
    getPlayerRoleTarget(roleId)?.label ||
    STATUS_LABELS.noRole
  )
}

const getExpectedRange = (roleId) => {
  const target = getPlayerRoleTarget(roleId)

  if (!target?.minutesRange) return null

  return {
    min: toNumber(target.minutesRange[0]),
    max: toNumber(target.minutesRange[1]),
  }
}

const getUsageStatus = ({
  roleId,
  minutesPct,
  hasGamesData,
}) => {
  if (!hasGamesData) return 'noData'

  const range = getExpectedRange(roleId)

  if (!range) return 'noRole'

  if (minutesPct < range.min) return 'under'
  if (minutesPct > range.max) return 'over'

  return 'ok'
}

const getGapFromRange = ({
  status,
  minutesPct,
  range,
}) => {
  if (!range) return 0

  if (status === 'under') {
    return minutesPct - range.min
  }

  if (status === 'over') {
    return minutesPct - range.max
  }

  return 0
}

const getActualUsageRole = (minutesPct) => {
  if (minutesPct >= 70) return 'starter'
  if (minutesPct >= 50) return 'highRotation'
  if (minutesPct >= 25) return 'rotation'
  if (minutesPct > 0) return 'fringe'

  return 'noUsage'
}

const buildUsagePlayer = (row = {}) => {
  const stats = getRowStats(row)
  const roleId = getRoleId(row)
  const range = getExpectedRange(roleId)

  const minutesPct = toNumber(stats.minutesPct)
  const hasGamesData = stats.hasGamesData === true

  const usageStatus = getUsageStatus({
    roleId,
    minutesPct,
    hasGamesData,
  })

  return {
    playerId: row.playerId || row.id || '',
    playerFullName: row.playerFullName || '—',

    active: row.active !== false,

    roleId,
    roleLabel: getRoleLabel(roleId),

    minutes: toNumber(stats.minutes),
    availableMinutes: toNumber(stats.availableMinutes),
    minutesPct,

    teamPlayedGames: toNumber(stats.teamPlayedGames),
    squadGames: toNumber(stats.squadGames),
    playerPlayedGames: toNumber(stats.playerPlayedGames),
    startedGames: toNumber(stats.startedGames),

    startsPct: pct(
      stats.startedGames,
      stats.teamPlayedGames
    ),

    expectedRange: range,

    usageStatus,
    usageStatusLabel: STATUS_LABELS[usageStatus] || usageStatus,

    actualUsageRole: getActualUsageRole(minutesPct),

    gapFromRange: getGapFromRange({
      status: usageStatus,
      minutesPct,
      range,
    }),

    hasGamesData,

    goals: toNumber(stats.goals),
    assists: toNumber(stats.assists),
    involvement: toNumber(stats.involvement),
  }
}

const createRoleBucket = (roleId) => {
  const target = getPlayerRoleTarget(roleId)
  const range = getExpectedRange(roleId)

  return {
    roleId,
    label: target?.label || roleId,
    expectedRange: range,

    total: 0,
    checked: 0,

    ok: 0,
    under: 0,
    over: 0,
    noData: 0,

    deviationCount: 0,
    deviationRate: 0,

    players: {
      ok: [],
      under: [],
      over: [],
      noData: [],
    },
  }
}

const addPlayerToBucket = ({
  bucket,
  player,
}) => {
  bucket.total += 1

  if (player.usageStatus !== 'noData') {
    bucket.checked += 1
  }

  if (player.usageStatus === 'under') {
    bucket.under += 1
    bucket.deviationCount += 1
    bucket.players.under.push(player)
    return
  }

  if (player.usageStatus === 'over') {
    bucket.over += 1
    bucket.deviationCount += 1
    bucket.players.over.push(player)
    return
  }

  if (player.usageStatus === 'ok') {
    bucket.ok += 1
    bucket.players.ok.push(player)
    return
  }

  bucket.noData += 1
  bucket.players.noData.push(player)
}

const finalizeBucket = (bucket) => {
  return {
    ...bucket,
    deviationRate: pct(
      bucket.deviationCount,
      bucket.checked
    ),
  }
}

const sortActionPlayers = (players = emptyArray) => {
  return [...players].sort((a, b) => {
    const gapA = Math.abs(toNumber(a.gapFromRange))
    const gapB = Math.abs(toNumber(b.gapFromRange))

    return gapB - gapA
  })
}

const buildTakeaway = ({
  checkedPlayers,
  deviatedPlayers,
  deviationRate,
  byRole,
}) => {
  if (!checkedPlayers) {
    return {
      tone: 'neutral',
      title: 'אין מספיק נתוני שימוש',
      text: 'לא נמצאו מספיק נתוני דקות כדי לבדוק התאמה בין מעמד השחקנים לשימוש בפועל.',
    }
  }

  const worstRole = [...byRole]
    .filter((item) => item.checked > 0)
    .sort((a, b) => b.deviationRate - a.deviationRate)[0]

  if (deviationRate >= 35) {
    return {
      tone: 'warning',
      title: 'פער מבני בין תכנון לשימוש',
      text: `נמצאו ${deviatedPlayers} חריגות שימוש מתוך ${checkedPlayers} שחקנים שנבדקו. עיקר הפער נמצא בשכבת ${worstRole?.label || 'המעמד'}.`,
    }
  }

  if (deviatedPlayers > 0) {
    return {
      tone: 'primary',
      title: 'פערים נקודתיים בשימוש',
      text: `רוב השחקנים נמצאים בטווח המצופה, אך ${deviatedPlayers} שחקנים דורשים בדיקה פרטנית.`,
    }
  }

  return {
    tone: 'success',
    title: 'השימוש תואם את מבנה הסגל',
    text: 'השחקנים שנבדקו מקבלים דקות בהתאם למעמד שהוגדר להם.',
  }
}

export const buildUsageAlignment = ({
  rows = emptyArray,
} = {}) => {
  const players = rows
    .filter((row) => row?.active !== false)
    .map(buildUsagePlayer)

  const roleBucketsMap = ROLE_ORDER.reduce((acc, roleId) => {
    acc[roleId] = createRoleBucket(roleId)
    return acc
  }, {})

  const noRoleBucket = {
    roleId: 'none',
    label: STATUS_LABELS.noRole,
    expectedRange: null,

    total: 0,
    checked: 0,

    ok: 0,
    under: 0,
    over: 0,
    noData: 0,

    deviationCount: 0,
    deviationRate: 0,

    players: {
      ok: [],
      under: [],
      over: [],
      noData: [],
    },
  }

  players.forEach((player) => {
    const bucket =
      roleBucketsMap[player.roleId] ||
      noRoleBucket

    addPlayerToBucket({
      bucket,
      player,
    })
  })

  const byRole = [
    ...ROLE_ORDER.map((roleId) =>
      finalizeBucket(roleBucketsMap[roleId])
    ),
    finalizeBucket(noRoleBucket),
  ].filter((item) => item.total > 0)

  const checkedPlayers = players.filter((player) => {
    return (
      player.usageStatus !== 'noData' &&
      player.usageStatus !== 'noRole'
    )
  }).length

  const underUsed = players.filter((player) => {
    return player.usageStatus === 'under'
  })

  const overUsed = players.filter((player) => {
    return player.usageStatus === 'over'
  })

  const okPlayers = players.filter((player) => {
    return player.usageStatus === 'ok'
  })

  const noDataPlayers = players.filter((player) => {
    return player.usageStatus === 'noData'
  })

  const noRolePlayers = players.filter((player) => {
    return player.usageStatus === 'noRole'
  })

  const actualLineup = players.filter((player) => {
    return (
      player.minutesPct >= 70 ||
      player.startsPct >= 50
    )
  })

  const squadButNotPlayed = players.filter((player) => {
    return (
      player.squadGames > 0 &&
      player.playerPlayedGames === 0
    )
  })

  const deviatedPlayers =
    underUsed.length + overUsed.length

  const deviationRate = pct(
    deviatedPlayers,
    checkedPlayers
  )

  const actionPlayers = sortActionPlayers([
    ...underUsed,
    ...overUsed,
  ])

  return {
    summary: {
      totalPlayers: players.length,
      checkedPlayers,
      deviatedPlayers,
      deviationRate,

      okCount: okPlayers.length,
      underCount: underUsed.length,
      overCount: overUsed.length,

      noDataCount: noDataPlayers.length,
      noRoleCount: noRolePlayers.length,
    },

    byRole,

    players,

    actionPlayers,

    actualLineup,
    underUsed,
    overUsed,
    squadButNotPlayed,

    takeaway: buildTakeaway({
      checkedPlayers,
      deviatedPlayers,
      deviationRate,
      byRole,
    }),
  }
}
