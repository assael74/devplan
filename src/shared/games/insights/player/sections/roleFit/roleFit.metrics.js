// shared/games/insights/player/sections/roleFit/roleFit.metrics.js

import {
  pickNumber,
} from '../../../team/common/index.js'

function getDifficultyRows(insights = {}) {
  return (
    insights?.games?.grouped?.byDifficulty ||
    insights?.summary?.grouped?.byDifficulty ||
    []
  )
}

function getUsageSource(insights = {}) {
  return insights?.games?.usage || insights?.summary?.usage || insights?.usage || null
}

function normalizeBucket(bucket = {}) {
  return {
    id: bucket.id || '',
    label: bucket.label || bucket.id || '',
    games: pickNumber(bucket, ['total', 'games', 'playedGames'], 0),
    pointsRate: pickNumber(bucket, ['pointsRate', 'pointsPct'], 0),
  }
}

function findBucket(rows, id) {
  return normalizeBucket(rows.find((item) => item.id === id) || { id })
}

export function buildPlayerRoleFitMetrics(insights = {}) {
  const usage = getUsageSource(insights)
  const targets = insights?.targets || insights?.games?.targets || {}

  const role = targets?.role || {}
  const roleTarget = targets?.roleTarget || {}

  const difficultyRows = getDifficultyRows(insights)

  const easy = findBucket(difficultyRows, 'easy')
  const equal = findBucket(difficultyRows, 'equal')
  const hard = findBucket(difficultyRows, 'hard')

  return {
    usage,
    role,
    roleTarget,

    minutesPct: pickNumber(usage, ['minutesPct'], 0),
    startsPctFromTeamGames: pickNumber(usage, ['startsPctFromTeamGames'], 0),
    gamesPct: pickNumber(usage, ['gamesPct'], 0),

    easy,
    equal,
    hard,

    hasEasyMinutes: easy.games > 0,
    hasEqualMinutes: equal.games > 0,
    hasHardMinutes: hard.games > 0,

    trustDifficulty: roleTarget?.trustDifficulty || null,

    hasRole: Boolean(role?.id),
    hasRoleTarget: Boolean(roleTarget?.id),
    hasAnyData: Boolean(usage) && pickNumber(usage, ['teamGamesTotal'], 0) > 0,
  }
}
