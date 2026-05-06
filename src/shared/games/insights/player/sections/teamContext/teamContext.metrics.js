// shared/games/insights/player/sections/teamContext/teamContext.metrics.js

import {
  pickNumber,
} from '../../../team/common/index.js'

function getTeamContextSource(insights = {}) {
  return insights?.teamContext || insights?.summary?.teamContext || {}
}

export function buildPlayerTeamContextMetrics(insights = {}) {
  const source = getTeamContextSource(insights)

  const withPlayer = source?.withPlayer || {}
  const withoutPlayer = source?.withoutPlayer || {}
  const team = source?.team || {}
  const reliability = source?.reliability || {}

  const pointsRateGap = pickNumber(source, ['pointsRateGap'], 0)
  const pointsPerGameGap = pickNumber(source, ['pointsPerGameGap'], 0)
  const pointsShareOfTeam = pickNumber(source, ['pointsShareOfTeam'], 0)

  return {
    source,

    withPlayer: {
      games: pickNumber(withPlayer, ['games'], 0),
      points: pickNumber(withPlayer, ['points'], 0),
      maxPoints: pickNumber(withPlayer, ['maxPoints'], 0),
      pointsRate: pickNumber(withPlayer, ['pointsRate'], 0),
      pointsPerGame: pickNumber(withPlayer, ['pointsPerGame'], 0),
      wins: pickNumber(withPlayer, ['wins'], 0),
      draws: pickNumber(withPlayer, ['draws'], 0),
      losses: pickNumber(withPlayer, ['losses'], 0),
    },

    withoutPlayer: {
      games: pickNumber(withoutPlayer, ['games'], 0),
      points: pickNumber(withoutPlayer, ['points'], 0),
      maxPoints: pickNumber(withoutPlayer, ['maxPoints'], 0),
      pointsRate: pickNumber(withoutPlayer, ['pointsRate'], 0),
      pointsPerGame: pickNumber(withoutPlayer, ['pointsPerGame'], 0),
      wins: pickNumber(withoutPlayer, ['wins'], 0),
      draws: pickNumber(withoutPlayer, ['draws'], 0),
      losses: pickNumber(withoutPlayer, ['losses'], 0),
    },

    team: {
      games: pickNumber(team, ['games'], 0),
      points: pickNumber(team, ['points'], 0),
      maxPoints: pickNumber(team, ['maxPoints'], 0),
      pointsRate: pickNumber(team, ['pointsRate'], 0),
      pointsPerGame: pickNumber(team, ['pointsPerGame'], 0),
    },

    pointsRateGap,
    pointsPerGameGap,
    pointsShareOfTeam,

    reliability,

    hasWithData: pickNumber(withPlayer, ['games'], 0) > 0,
    hasWithoutData: pickNumber(withoutPlayer, ['games'], 0) > 0,
    hasEnoughData: reliability?.canUseStrongFlag === true,
    hasAnyData:
      pickNumber(withPlayer, ['games'], 0) > 0 ||
      pickNumber(withoutPlayer, ['games'], 0) > 0,
  }
}
