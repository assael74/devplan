// shared/games/insights/player/playerInsights.build.js

import { buildGamesView } from '../../games.view.logic.js'

import {
  filterLeaguePlayedGames,
} from '../games.insights.shared.js'

import {
  buildPlayerParticipationInsights,
  buildPlayerScoringInsights,
  buildPlayerStartingVsBenchInsights,
  buildPlayerHomeOrAwayInsights,
  buildPlayerTypeInsights,
  buildPlayerRecentInsights,
} from '../games.insights.player.js'

export const buildPlayerGamesInsights = ({
  player,
  rows = [],
  normalizeRow,
}) => {
  const view = buildGamesView(rows, normalizeRow)
  const playerLeagueGames = filterLeaguePlayedGames(view.playedGames || [])

  const teamView = buildGamesView(player?.teamGames || [], normalizeRow)
  const teamLeagueGames = filterLeaguePlayedGames(teamView.playedGames || [])

  const participation = buildPlayerParticipationInsights({
    player,
    playedGames: playerLeagueGames,
    teamLeagueGames,
  })

  const scoring = buildPlayerScoringInsights(playerLeagueGames)
  const splits = buildPlayerStartingVsBenchInsights(playerLeagueGames)
  const homeOrAway = buildPlayerHomeOrAwayInsights(playerLeagueGames)
  const type = buildPlayerTypeInsights(playerLeagueGames)
  const recent = buildPlayerRecentInsights(playerLeagueGames)

  return {
    domain: 'playerGames',

    state: view.state,
    rows: view.rows,
    playedGames: view.playedGames,
    leaguePlayedGames: playerLeagueGames,
    teamLeagueGames,
    upcomingGames: view.upcomingGames,
    nextGame: view.nextGame,

    summary: {
      all: view.summary,
      played: view.summaryPlayed,
      participation,
      scoring,
      splits,
      grouped: {
        byHomeOrAway: homeOrAway.byHomeOrAway,
        byType: type.byType,
        byDifficulty: type.byDifficulty,
      },
      recent,
    },
  }
}
