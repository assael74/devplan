// src/shared/teams/expectations/index.js

/*
|--------------------------------------------------------------------------
| Team Expectations / Public API
|--------------------------------------------------------------------------
|
| אחריות:
| שכבת תרגום של benchmark עונתי לציפייה למשחק או לרצף משחקים.
|
| מקור הבנצ׳מרקים המקצועיים:
| src/shared/teams/targets/teamTargetProfiles.js
|
| כאן לא קובעים בנצ׳מרקים חדשים.
| כאן מחשבים:
| - expectedPoints
| - expectedGoalsFor
| - expectedGoalsAgainst
|
| על בסיס:
| - target profile
| - home / away
| - difficulty
| - leagueNumGames
*/

export {
  TEAM_EXPECTATIONS_CONFIG,
} from './expectations.config.js'

export {
  TEAM_EXPECTATIONS_STATUS,
  TEAM_EXPECTATIONS_BLOCK_REASON,
  TEAM_EXPECTATIONS_MISSING,
  TEAM_EXPECTATIONS_FALLBACK,
} from './expectations.status.js'

export {
  buildTeamExpectationContext,
} from './expectations.context.js'

export {
  buildTeamGameExpectations,
} from './expectations.game.js'

export {
  buildTeamScopeExpectations,
} from './expectations.scope.js'
