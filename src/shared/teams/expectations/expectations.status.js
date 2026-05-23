// src/shared/teams/expectations/expectations.status.js

/*
|--------------------------------------------------------------------------
| Team Expectations / Status
|--------------------------------------------------------------------------
|
| אחריות:
| סטטוסים, סיבות חסימה, חוסרים ו־fallbacks של שכבת ציפיות משחק.
*/

export const TEAM_EXPECTATIONS_STATUS = {
  READY: 'ready',
  PARTIAL: 'partial',
  BLOCKED: 'blocked',
}

export const TEAM_EXPECTATIONS_BLOCK_REASON = {
  MISSING_TEAM: 'missing_team',
  MISSING_GAME: 'missing_game',
  MISSING_TARGETS: 'missing_targets',
  MISSING_TARGET_POINTS: 'missing_target_points',
  MISSING_LEAGUE_GAMES: 'missing_league_games',
}

export const TEAM_EXPECTATIONS_MISSING = {
  HOME_AWAY: 'home_away',
  DIFFICULTY: 'difficulty',
  GOALS_FOR_TARGET: 'goals_for_target',
  GOALS_AGAINST_TARGET: 'goals_against_target',
}

export const TEAM_EXPECTATIONS_FALLBACK = {
  LEAGUE_GAMES_DEFAULT: 'league_games_default',
  HOME_AWAY_NEUTRAL: 'home_away_neutral',
  DIFFICULTY_EQUAL: 'difficulty_equal',
  HOME_AWAY_RATE_SEASON: 'home_away_rate_season',
  DIFFICULTY_RATE_SEASON: 'difficulty_rate_season',
  GOALS_FOR_SEASON_AVG: 'goals_for_season_avg',
  GOALS_AGAINST_SEASON_AVG: 'goals_against_season_avg',
}
