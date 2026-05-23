// src/shared/teams/scoring/adapters/matchInput.js

/*
|--------------------------------------------------------------------------
| Team Scoring Engine / Adapter. Match Input
|--------------------------------------------------------------------------
|
| אחריות:
| בניית input אחיד לציון משחק קבוצתי מתוך game row ו־team.
*/

export const buildTeamMatchScoreInput = ({
  row,
  game,
  team,
  sportingDirectorAssessment,
} = {}) => {
  const activeRow = row || game || {}

  return {
    team,
    game: activeRow,
    sportingDirectorAssessment,
  }
}
