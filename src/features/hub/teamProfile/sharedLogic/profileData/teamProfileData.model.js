// src/features/hub/teamProfile/sharedLogic/profileData/teamProfileData.model.js

import {
  buildTeamProfileEntity,
} from './teamEntity.model.js'

import {
  buildTeamGamesBase,
} from './gamesBase.model.js'

import {
  buildTeamPlayersBase,
} from './playersBase.model.js'

import {
  buildTeamPlayerScoringModel,
} from './playerScoring.model.js'

import {
  buildTeamScoringModel,
} from './teamScoring.model.js'

export const buildTeamProfileData = ({
  team,
  calculationMode = 'games',
  coachAssessments = {},
} = {}) => {
  if (!team) {
    return {
      entity: null,
      games: null,
      players: null,

      teamScoring: null,
      playerScoring: null,

      scoring: {
        team: null,
        players: null,
      },

      meta: {
        ready: false,
        reason: 'missing_team',
      },
    }
  }

  const entity = buildTeamProfileEntity(team)
  const games = buildTeamGamesBase(team)

  const players = buildTeamPlayersBase({
    team,
    games: games.playedLeagueGames,
  })

  const teamScoring = buildTeamScoringModel({
    team,
    games: games.playedLeagueGames,
    calculationMode,
  })

  const playerScoring = buildTeamPlayerScoringModel({
    team,
    games: games.playedLeagueGames,
    calculationMode,
    coachAssessments,
  })

  return {
    entity,
    games,
    players,

    teamScoring,
    playerScoring,

    scoring: {
      team: teamScoring,
      players: playerScoring,
    },

    meta: {
      ready: true,
      source: 'teamProfile.profileData',
      calculationMode,

      counts: {
        allGames: games?.counts?.all || 0,
        leagueGames: games?.counts?.league || 0,
        playedLeagueGames: games?.counts?.playedLeague || 0,
        players: players?.counts?.players || 0,
        teamScores: teamScoring?.meta?.scoresCount || 0,
        playerScores: playerScoring?.meta?.scoresCount || 0,
      },
    },
  }
}
