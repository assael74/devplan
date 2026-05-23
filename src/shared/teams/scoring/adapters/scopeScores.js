// src/shared/teams/scoring/adapters/scopeScores.js

/*
|--------------------------------------------------------------------------
| Team Scoring Engine / Adapter. Scope Scores
|--------------------------------------------------------------------------
|
| אחריות:
| בניית ציוני קבוצה לכל משחקי ה־scope.
*/

import {
  buildTeamScoringScope,
} from '../scoring.scope.js'

import {
  buildTeamGameScore,
} from './gameScores.js'

const getSportingDirectorAssessment = ({
  row,
  assessments,
}) => {
  const gameId =
    row?.gameId ||
    row?.game?.id ||
    row?.game?.gameId ||
    row?.id ||
    ''

  return assessments?.[gameId]
}

export const buildScopedTeamScores = ({
  games,
  team,
  scope,
  sportingDirectorAssessments = {},
} = {}) => {
  const scoped = buildTeamScoringScope({
    games,
    scope,
  })

  const gameScores = scoped.games.map((row) => {
    return buildTeamGameScore({
      row,
      team,
      sportingDirectorAssessment: getSportingDirectorAssessment({
        row,
        assessments: sportingDirectorAssessments,
      }),
    })
  })

  return {
    scope: scoped.scope,

    allGamesCount: scoped.allGamesCount,
    filteredGamesCount: scoped.filteredGamesCount,
    scopedGamesCount: scoped.scopedGamesCount,

    gamesCount: gameScores.length,
    scoresCount: gameScores.length,

    games: gameScores,
    flatScores: gameScores,
  }
}
