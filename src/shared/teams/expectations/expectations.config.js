// src/shared/teams/expectations/expectations.config.js

/*
|--------------------------------------------------------------------------
| Team Expectations / Config
|--------------------------------------------------------------------------
|
| אחריות:
| הגדרות טכניות בלבד לשכבת ציפיות משחק.
|
| חשוב:
| לא קובעים כאן בנצ׳מרקים מקצועיים.
| מקור האמת לבנצ׳מרקים:
| src/shared/teams/targets/teamTargetProfiles.js
*/

export const TEAM_EXPECTATIONS_CONFIG = {
  defaultLeagueGames: 30,
  defaultDifficulty: 'equal',
  defaultHomeAway: 'neutral',

  minExpectedPoints: 0,
  maxExpectedPoints: 3,

  minGoalExpectation: 0,
  maxGoalExpectation: 10,
}
