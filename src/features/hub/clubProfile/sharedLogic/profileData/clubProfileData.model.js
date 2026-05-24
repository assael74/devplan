// src/features/hub/clubProfile/sharedLogic/profileData/clubProfileData.model.js

import {
  buildClubProfileScope,
} from './profileScope.model.js'

import {
  buildClubPlayersScoringModel,
} from './clubPlayersScoring.model.js'

import {
  buildClubTeamsScoringModel,
} from './clubTeamsScoring.model.js'

export const buildClubProfileData = ({
  club,
  teams,
  players,
  calculationMode = 'games',
  coachAssessments = {},
} = {}) => {
  if (!club) {
    return {
      entity: null,
      scope: null,
      teams: [],
      players: [],

      scoring: {
        teams: null,
        players: null,
      },

      meta: {
        ready: false,
        reason: 'missing_club',
      },
    }
  }

  const scope = buildClubProfileScope({
    club,
    teams,
    players,
  })

  const teamsScoring = buildClubTeamsScoringModel({
    teams: scope.teams,
  })

  const playersScoring = buildClubPlayersScoringModel({
    players: scope.players,
    teamsById: scope.teamsById,
    calculationMode,
    coachAssessments,
  })

  return {
    entity: club,
    club,

    scope,

    teams: scope.teams,
    players: scope.players,

    teamsById: scope.teamsById,
    playersById: scope.playersById,

    teamsScoring,
    playersScoring,

    scoring: {
      teams: teamsScoring,
      players: playersScoring,
    },

    meta: {
      ready: true,
      source: 'clubProfile.profileData',
      calculationMode,

      counts: {
        teams: scope?.meta?.counts?.teams || 0,
        players: scope?.meta?.counts?.players || 0,
        scoredTeams: teamsScoring?.meta?.scoredTeams || 0,
        scoredPlayers: playersScoring?.meta?.scoredPlayers || 0,
      },
    },
  }
}
