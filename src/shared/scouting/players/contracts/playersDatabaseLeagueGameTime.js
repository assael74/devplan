export const PLAYERS_DATABASE_LEAGUE_GAME_TIME_BY_AGE_GROUP = {
  u19: 90,
  u17: 90,
  u16: 80,
  u15: 80,
  u14: 80,
}

export const resolvePlayersDatabaseLeagueGameTime = ageGroupId =>
  PLAYERS_DATABASE_LEAGUE_GAME_TIME_BY_AGE_GROUP[String(ageGroupId || '').trim()] || 90
