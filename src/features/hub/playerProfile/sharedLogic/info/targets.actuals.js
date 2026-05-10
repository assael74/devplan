// features/hub/playerProfile/sharedLogic/info/targets.actuals.js

import {
  formatValue,
  pickNumber,
} from './targets.formatters.js'

export const buildPlayerTargetsActuals = ({
  player = {},
  team = {},
}) => {
  const playerStats =
    player?.stats ||
    player?.metrics ||
    player?.seasonStats ||
    {}

  const teamStats =
    team?.stats ||
    team?.metrics ||
    {}

  const goals = pickNumber(
    player?.goals,
    playerStats?.goals,
    playerStats?.totalGoals
  )

  const assists = pickNumber(
    player?.assists,
    playerStats?.assists,
    playerStats?.totalAssists
  )

  const goalContributions = pickNumber(
    player?.goalContributions,
    playerStats?.goalContributions,
    playerStats?.goalsAssists,
    Number(goals || 0) + Number(assists || 0)
  )

  const minutesPct = pickNumber(
    player?.minutesPct,
    playerStats?.minutesPct,
    playerStats?.minutesSharePct
  )

  const points = pickNumber(
    team?.points,
    teamStats?.points
  )

  const goalsFor = pickNumber(
    team?.leagueGoalsFor,
    team?.goalsFor,
    teamStats?.goalsFor
  )

  const goalsAgainst = pickNumber(
    team?.leagueGoalsAgainst,
    team?.goalsAgainst,
    teamStats?.goalsAgainst
  )

  return {
    player: {
      goals,
      assists,
      goalContributions,
      minutesPct,
    },

    team: {
      points,
      goalsFor,
      goalsAgainst,
    },
  }
}

export const buildActualCards = ({
  actuals = {},
}) => {
  return {
    personal: [
      {
        id: 'goals',
        label: 'שערים',
        value: formatValue(actuals.player.goals),
      },
      {
        id: 'assists',
        label: 'בישולים',
        value: formatValue(actuals.player.assists),
      },
      {
        id: 'minutes',
        label: 'דקות',
        value: formatValue(actuals.player.minutesPct, '%'),
      },
    ],

    team: [
      {
        id: 'points',
        label: 'נקודות',
        value: formatValue(actuals.team.points),
      },
      {
        id: 'goalsFor',
        label: 'שערי זכות',
        value: formatValue(actuals.team.goalsFor),
      },
      {
        id: 'goalsAgainst',
        label: 'שערי חובה',
        value: formatValue(actuals.team.goalsAgainst),
      },
    ],
  }
}
