// shared/games/insights/player/snapshots/playerGames.snapshot.js

import { buildGamesView } from '../../../games.view.logic.js'

import {
  buildGroupedInsights,
  filterLeaguePlayedGames,
} from '../../games.insights.shared.js'

import {
  calcPercent,
  roundNumber,
  toNumber,
} from '../../team/common/index.js'

import {
  buildPlayerDerivedTargets,
} from '../targets/index.js'

import {
  calcPerLeagueGameTime,
  calcPlayerGameTimeSummary,
  getPlayerMinutesReliability,
  resolveLeagueGameTime,
} from '../common/index.js'

const safeArray = (value) => {
  return Array.isArray(value) ? value : []
}

const sumBy = (rows, key) => {
  return safeArray(rows).reduce((sum, row) => {
    return sum + toNumber(row?.[key], 0)
  }, 0)
}

const countBy = (rows, predicate) => {
  return safeArray(rows).reduce((sum, row) => {
    return predicate(row) ? sum + 1 : sum
  }, 0)
}

const resolveTeamRows = ({ team, player }) => {
  if (Array.isArray(team?.games) && team.games.length > 0) {
    return team.games
  }

  if (Array.isArray(player?.teamGames) && player.teamGames.length > 0) {
    return player.teamGames
  }

  if (Array.isArray(team?.teamGames) && team.teamGames.length > 0) {
    return team.teamGames
  }

  return []
}

const buildScoringSummary = ({
  rows,
  teamGoalsFor,
  minutesPlayed,
  leagueGameTime,
}) => {
  const goals = sumBy(rows, 'goals')
  const assists = sumBy(rows, 'assists')
  const goalContributions = goals + assists

  const goalContribGames = countBy(rows, (row) => {
    return toNumber(row?.goals, 0) > 0 || toNumber(row?.assists, 0) > 0
  })

  return {
    goals,
    assists,
    goalContributions,

    goalsPerGame: calcPerLeagueGameTime({
      value: goals,
      minutesPlayed,
      leagueGameTime,
    }),

    assistsPerGame: calcPerLeagueGameTime({
      value: assists,
      minutesPlayed,
      leagueGameTime,
    }),

    contributionsPerGame: calcPerLeagueGameTime({
      value: goalContributions,
      minutesPlayed,
      leagueGameTime,
    }),

    goalContribGames,
    goalContribGamesPct: calcPercent(goalContribGames, rows.length),

    teamGoalsFor: toNumber(teamGoalsFor, 0),
    teamGoalsSharePct: calcPercent(goalContributions, teamGoalsFor),
  }
}

const buildDefensiveSummary = ({
  rows,
  minutesPlayed,
  leagueGameTime,
}) => {
  const goalsAgainst = sumBy(rows, 'goalsAgainst')

  const cleanSheets = countBy(rows, (row) => {
    return toNumber(row?.goalsAgainst, 0) === 0
  })

  return {
    goalsAgainst,

    goalsAgainstPerGame: calcPerLeagueGameTime({
      value: goalsAgainst,
      minutesPlayed,
      leagueGameTime,
    }),

    cleanSheets,
    cleanSheetPct: calcPercent(cleanSheets, rows.length),
  }
}

const buildStartingSplit = ({
  rows,
  leagueGameTime,
}) => {
  const starters = safeArray(rows).filter((row) => row?.isStarting === true)
  const bench = safeArray(rows).filter((row) => row?.isStarting !== true)

  const buildSplit = (splitRows) => {
    const total = splitRows.length
    const minutes = sumBy(splitRows, 'timePlayed')
    const goals = sumBy(splitRows, 'goals')
    const assists = sumBy(splitRows, 'assists')
    const goalContributions = goals + assists

    return {
      total,
      minutes,
      avgMinutes: total > 0 ? roundNumber(minutes / total, 1) : 0,
      goals,
      assists,
      goalContributions,

      goalsPerGame: calcPerLeagueGameTime({
        value: goals,
        minutesPlayed: minutes,
        leagueGameTime,
      }),

      assistsPerGame: calcPerLeagueGameTime({
        value: assists,
        minutesPlayed: minutes,
        leagueGameTime,
      }),

      contributionsPerGame: calcPerLeagueGameTime({
        value: goalContributions,
        minutesPlayed: minutes,
        leagueGameTime,
      }),
    }
  }

  const start = buildSplit(starters)
  const benchResult = buildSplit(bench)

  return {
    start,
    bench: benchResult,
    comparison: {
      preferredRole:
        start.contributionsPerGame > benchResult.contributionsPerGame
          ? 'start'
          : benchResult.contributionsPerGame > start.contributionsPerGame
            ? 'bench'
            : 'equal',

      contributionsPerGameGap: roundNumber(
        Math.abs(start.contributionsPerGame - benchResult.contributionsPerGame),
        2
      ),

      avgMinutesGap: roundNumber(
        Math.abs(start.avgMinutes - benchResult.avgMinutes),
        1
      ),
    },
  }
}

const buildRecentSummary = ({
  rows,
  leagueGameTime,
  size = 5,
}) => {
  const recentRows = safeArray(rows).slice(0, size)

  const minutes = sumBy(recentRows, 'timePlayed')
  const goals = sumBy(recentRows, 'goals')
  const assists = sumBy(recentRows, 'assists')
  const goalContributions = goals + assists

  return {
    rows: recentRows,
    sampleSize: recentRows.length,
    minutes,
    goals,
    assists,
    goalContributions,

    goalsPerGame: calcPerLeagueGameTime({
      value: goals,
      minutesPlayed: minutes,
      leagueGameTime,
    }),

    assistsPerGame: calcPerLeagueGameTime({
      value: assists,
      minutesPlayed: minutes,
      leagueGameTime,
    }),

    contributionsPerGame: calcPerLeagueGameTime({
      value: goalContributions,
      minutesPlayed: minutes,
      leagueGameTime,
    }),
  }
}

export function buildPlayerGamesSnapshot({
  player,
  team,
  rows = [],
  normalizeRow,
}) {
  const normalize = typeof normalizeRow === 'function' ? normalizeRow : (row) => row
  const view = buildGamesView(rows, normalizeRow)
  const playerLeagueGames = filterLeaguePlayedGames(view.playedGames || [])

  const teamRows = resolveTeamRows({
    team,
    player,
  })
  const teamView = buildGamesView(teamRows, normalize)
  const teamLeagueGames = filterLeaguePlayedGames(teamView.playedGames || [])

  const activeTeam = team || player?.team || {}

  const leagueGameTime = resolveLeagueGameTime({
    team: activeTeam,
    player,
  })

  const minutesPlayed = sumBy(playerLeagueGames, 'timePlayed')
  const starts = countBy(playerLeagueGames, (row) => row?.isStarting === true)

  const usage = calcPlayerGameTimeSummary({
    playerGamesCount: playerLeagueGames.length,
    teamGamesCount: teamLeagueGames.length,
    minutesPlayed,
    starts,
    leagueGameTime,
  })

  const teamGoalsFor =
    toNumber(activeTeam?.leagueGoalsFor, 0) ||
    sumBy(teamLeagueGames, 'goalsFor')

  const scoring = buildScoringSummary({
    rows: playerLeagueGames,
    teamGoalsFor,
    minutesPlayed,
    leagueGameTime,
  })

  const defense = buildDefensiveSummary({
    rows: playerLeagueGames,
    minutesPlayed,
    leagueGameTime,
  })

  const grouped = buildGroupedInsights(playerLeagueGames)
  const splits = buildStartingSplit({
    rows: playerLeagueGames,
    leagueGameTime,
  })

  const recent = buildRecentSummary({
    rows: playerLeagueGames,
    leagueGameTime,
  })

  const targets = buildPlayerDerivedTargets({
    player,
    team: activeTeam,
  })

  const reliability = getPlayerMinutesReliability(minutesPlayed)

  return {
    source: 'playerGames',
    sourceLabel: 'נתוני משחקי שחקן',
    level: 'medium',
    calculationKind: 'playerGamesOnly',

    state: view.state,

    player,
    team: activeTeam,

    rows: view.rows,
    playedRows: view.playedGames,
    playedGames: playerLeagueGames,
    leaguePlayedGames: playerLeagueGames,

    teamRows: teamView.rows,
    teamPlayedRows: teamView.playedGames,
    teamLeagueGames,

    upcomingGames: view.upcomingGames,
    nextGame: view.nextGame,

    isReady: playerLeagueGames.length > 0,

    leagueGameTime,

    usage,
    scoring,
    defense,
    grouped: {
      byHomeOrAway: grouped.byHomeOrAway,
      byType: grouped.byType,
      byDifficulty: grouped.byDifficulty,
    },
    splits,
    recent,
    targets,
    reliability,

    totals: {
      gamesIncluded: usage.gamesIncluded,
      teamGamesTotal: usage.teamGamesTotal,
      minutesPlayed: usage.minutesPlayed,
      minutesPossible: usage.minutesPossible,
      minutesPct: usage.minutesPct,
      starts: usage.starts,
      startsPctFromPlayed: usage.startsPctFromPlayed,
      startsPctFromTeamGames: usage.startsPctFromTeamGames,
      goals: scoring.goals,
      assists: scoring.assists,
      goalContributions: scoring.goalContributions,
      goalsAgainst: defense.goalsAgainst,
    },
  }
}
