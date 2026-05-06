// shared/games/insights/player/build/playerGamesInsights.build.js

import {
  buildPlayerGamesSnapshot,
  buildPlayerTeamContextSnapshot,
} from '../snapshots/index.js'

import {
  buildPlayerGamesDifficultyBrief,
  buildPlayerGamesPositionFitBrief,
  buildPlayerGamesRecentBrief,
  buildPlayerGamesRoleFitBrief,
  buildPlayerGamesScoringBrief,
  buildPlayerGamesTeamContextBrief,
  buildPlayerGamesUsageBrief,
} from '../sections/index.js'

export function buildPlayerGamesInsights({
  player,
  team,
  rows = [],
  normalizeRow,
}) {
  const games = buildPlayerGamesSnapshot({
    player,
    team,
    rows,
    normalizeRow,
  })

  const teamContext = buildPlayerTeamContextSnapshot({
    playerLeagueGames: games.leaguePlayedGames,
    teamLeagueGames: games.teamLeagueGames,
  })

  const baseInsights = {
    domain: 'playerGames',
    player,
    team: games.team,
    games,
    teamContext,
    targets: games.targets,
    reliability: games.reliability,
    leagueGameTime: games.leagueGameTime,
  }

  const usageBrief = buildPlayerGamesUsageBrief(baseInsights)
  const roleFitBrief = buildPlayerGamesRoleFitBrief(baseInsights)
  const scoringBrief = buildPlayerGamesScoringBrief(baseInsights)
  const positionFitBrief = buildPlayerGamesPositionFitBrief(baseInsights)
  const teamContextBrief = buildPlayerGamesTeamContextBrief(baseInsights)
  const difficultyBrief = buildPlayerGamesDifficultyBrief(baseInsights)
  const recentBrief = buildPlayerGamesRecentBrief(baseInsights)

  const briefs = {
    usage: usageBrief,
    roleFit: roleFitBrief,
    positionFit: positionFitBrief,
    scoring: scoringBrief,
    teamContext: teamContextBrief,
    difficulty: difficultyBrief,
    recent: recentBrief,
  }

  const briefsOrder = [
    'usage',
    'roleFit',
    'positionFit',
    'scoring',
    'teamContext',
    'difficulty',
    'recent',
  ]

  const briefsList = briefsOrder
    .map((key) => briefs[key])
    .filter(Boolean)

  const mediumReady = games.isReady === true
  const heavyReady = teamContext.meta.hasEnoughData === true

  return {
    ...baseInsights,

    readiness: {
      gamesReady: mediumReady,
      teamContextReady: heavyReady,

      // legacy keys
      mediumReady,
      heavyReady,
    },

    briefs,
    briefsOrder,
    briefsList,

    sections: briefs,

    summary: {
      medium: games,
      heavy: heavyReady ? teamContext : null,

      usage: games.usage,
      scoring: games.scoring,
      defense: games.defense,
      grouped: games.grouped,
      splits: games.splits,
      recent: games.recent,
      teamContext,
    },

    indicators: {
      reliability: games.reliability,
      teamContextReliability: teamContext.reliability,
    },

    blocking: {
      games: mediumReady ? [] : ['missingPlayerLeagueGames'],
      teamContext: heavyReady ? [] : ['notEnoughWithWithoutSample'],

      // legacy keys
      medium: mediumReady ? [] : ['missingPlayerLeagueGames'],
      heavy: heavyReady ? [] : ['notEnoughWithWithoutSample'],
    },
  }
}
