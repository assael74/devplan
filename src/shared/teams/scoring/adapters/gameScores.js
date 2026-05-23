// src/shared/teams/scoring/adapters/gameScores.js

/*
|--------------------------------------------------------------------------
| Team Scoring Engine / Adapter. Game Score
|--------------------------------------------------------------------------
|
| אחריות:
| בניית ציון משחק קבוצתי יחיד מתוך game row ו־team.
*/

import {
  buildTeamMatchScore,
} from '../scoring.match.js'

import {
  buildTeamMatchScoreInput,
} from './matchInput.js'

import {
  getGameObject,
} from '../scoring.utils.js'

const getGameId = (row = {}) => {
  const game = getGameObject(row)

  return (
    row?.gameId ||
    game?.id ||
    game?.gameId ||
    ''
  )
}

const getGameDate = (row = {}) => {
  const game = getGameObject(row)

  return (
    game?.gameDate ||
    game?.date ||
    row?.gameDate ||
    row?.date ||
    ''
  )
}

const getGameResult = (row = {}) => {
  const game = getGameObject(row)

  return {
    goalsFor: game?.goalsFor ?? row?.goalsFor ?? null,
    goalsAgainst: game?.goalsAgainst ?? row?.goalsAgainst ?? null,
    result: game?.result || row?.result || '',
  }
}

export const buildTeamGameScore = ({
  row,
  game,
  team,
  sportingDirectorAssessment,
} = {}) => {
  const activeRow = row || game || {}

  const scoreInput = buildTeamMatchScoreInput({
    row: activeRow,
    team,
    sportingDirectorAssessment,
  })

  const score = buildTeamMatchScore(scoreInput)

  return {
    gameId: getGameId(activeRow),
    gameDate: getGameDate(activeRow),
    game: activeRow,
    result: getGameResult(activeRow),
    score,
  }
}
