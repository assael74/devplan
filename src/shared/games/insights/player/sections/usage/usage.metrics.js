// shared/games/insights/player/sections/usage/usage.metrics.js

import {
  pickNumber,
  toNumber,
} from '../../../team/common/index.js'

function getUsageSource(insights = {}) {
  return insights?.games?.usage || insights?.summary?.usage || insights?.usage || null
}

export function buildPlayerUsageMetrics(insights = {}) {
  const source = getUsageSource(insights)
  const targets = insights?.targets || insights?.games?.targets || {}
  const role = targets?.role || {}
  const roleTarget = targets?.roleTarget || {}

  const minutesPlayed = pickNumber(source, ['minutesPlayed'], 0)
  const minutesPossible = pickNumber(source, ['minutesPossible'], 0)
  const minutesPct = pickNumber(source, ['minutesPct'], 0)

  const gamesIncluded = pickNumber(source, ['gamesIncluded'], 0)
  const teamGamesTotal = pickNumber(source, ['teamGamesTotal'], 0)
  const gamesPct = pickNumber(source, ['gamesPct'], 0)

  const starts = pickNumber(source, ['starts'], 0)
  const startsPctFromPlayed = pickNumber(source, ['startsPctFromPlayed'], 0)
  const startsPctFromTeamGames = pickNumber(source, ['startsPctFromTeamGames'], 0)

  const minutesRange = Array.isArray(roleTarget?.minutesRange)
    ? roleTarget.minutesRange
    : null

  const startsRange = Array.isArray(roleTarget?.startsRange)
    ? roleTarget.startsRange
    : null

  return {
    source,

    role,
    roleTarget,

    minutesPlayed,
    minutesPossible,
    minutesPct,

    gamesIncluded,
    teamGamesTotal,
    gamesPct,

    starts,
    startsPctFromPlayed,
    startsPctFromTeamGames,

    minutesTargetMin: toNumber(minutesRange?.[0], null),
    minutesTargetMax: toNumber(minutesRange?.[1], null),

    startsTargetMin: toNumber(startsRange?.[0], null),
    startsTargetMax: toNumber(startsRange?.[1], null),

    hasRole: Boolean(role?.id),
    hasRoleTarget: Boolean(roleTarget?.id),
    hasAnyData: teamGamesTotal > 0 || gamesIncluded > 0 || minutesPlayed > 0,
    hasMinutesData: minutesPossible > 0,
    hasStartsData: gamesIncluded > 0,
  }
}
