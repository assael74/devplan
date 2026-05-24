// src/features/hub/playerProfile/sharedLogic/profileData/playerProfileData.model.js

import {
  buildPlayerProfileEntity,
} from './playerEntity.model.js'

import {
  buildPlayerGamesBase,
} from './gamesBase.model.js'

import {
  buildPlayerScoringModel,
} from './playerScoring.model.js'

import {
  buildPlayerProfileInsightModel,
} from './playerInsight.model.js'

export const buildPlayerProfileData = ({
  player,
  team,
  calculationMode = 'games',
  coachAssessments = {},
} = {}) => {
  if (!player) {
    return {
      entity: null,
      games: null,

      playerScoring: null,

      playerInsight: null,
      insightProfile: null,

      scoring: {
        player: null,
      },

      meta: {
        ready: false,
        reason: 'missing_player',
      },
    }
  }

  const entity = buildPlayerProfileEntity(player)

  const games = buildPlayerGamesBase({
    player,
    team,
  })

  const playerScoring = buildPlayerScoringModel({
    player,
    team,
    games: games.playedPlayerGames,
    calculationMode,
    coachAssessments,
  })

  const playerInsight = buildPlayerProfileInsightModel({
    player: entity,
    playerScoring,
    classificationMode: 'season',
  })

  return {
    entity,
    games,

    playerScoring,
    playerInsight,
    insightProfile: playerInsight,

    scoring: {
      player: playerScoring,
    },

    meta: {
      ready: true,
      source: 'playerProfile.profileData',
      calculationMode,

      counts: {
        allGames: games?.counts?.all || 0,
        leagueGames: games?.counts?.league || 0,
        playedLeagueGames: games?.counts?.playedLeague || 0,
        playerGames: games?.counts?.playerGames || 0,
        playedPlayerGames: games?.counts?.playedPlayerGames || 0,
        playerScores: playerScoring?.meta?.scoresCount || 0,
        playerInsightReady: playerInsight?.meta?.ready === true,
      },
    },
  }
}
