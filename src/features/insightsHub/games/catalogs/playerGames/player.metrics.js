// features/insightsHub/games/playerGames/player.metrics.js

// features/insightsHub/games/playerGames/player.metrics.js

export const PLAYER_GAMES_METRIC_GROUPS = {
  PARTICIPATION: 'participation',
  MINUTES: 'minutes',
  LINEUP: 'lineup',
  TEAM_RESULTS_WITH_PLAYER: 'teamResultsWithPlayer',
  HOME_AWAY: 'homeAway',
  DIFFICULTY: 'difficulty',
}

export const PLAYER_GAMES_METRICS_CATALOG = [
  {
    id: 'player_games_availability_rate',
    group: PLAYER_GAMES_METRIC_GROUPS.PARTICIPATION,
    label: 'אחוז שיתוף במשחקי הקבוצה',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'player_games_team_played_games',
      'player_games_played_games',
    ],
    dependsOnFields: [
      'teamPlayedGamesCount',
      'playerPlayedGamesCount',
    ],
  },
  {
    id: 'player_games_minutes_rate',
    group: PLAYER_GAMES_METRIC_GROUPS.MINUTES,
    label: 'אחוז דקות משחק מתוך האפשרי',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'player_games_minutes_played',
      'player_games_minutes_possible',
    ],
    dependsOnFields: [
      'minutesPlayed',
      'minutesPossible',
    ],
  },
  {
    id: 'player_games_start_rate',
    group: PLAYER_GAMES_METRIC_GROUPS.LINEUP,
    label: 'אחוז פתיחה בהרכב',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'player_games_starts_count',
      'player_games_team_played_games',
    ],
    dependsOnFields: [
      'startsCount',
      'teamPlayedGamesCount',
    ],
  },
  {
    id: 'player_games_lineup_status_distribution',
    group: PLAYER_GAMES_METRIC_GROUPS.LINEUP,
    label: 'התפלגות מעמד במשחקים',
    valueType: 'breakdown',
    unit: 'games',
    requiredFacts: [
      'player_games_starts_count',
      'player_games_bench_appearances_count',
      'player_games_unused_squad_count',
      'player_games_not_played_games',
    ],
    dependsOnFields: [
      'startsCount',
      'benchAppearancesCount',
      'unusedSquadCount',
      'playerNotPlayedGamesCount',
    ],
  },

  {
    id: 'player_games_team_points_rate_with_player',
    group: PLAYER_GAMES_METRIC_GROUPS.TEAM_RESULTS_WITH_PLAYER,
    label: 'אחוז הצלחה בצבירת נקודות עם השחקן',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'player_games_team_points_with_player',
      'player_games_team_max_points_with_player',
    ],
    dependsOnFields: [
      'teamPointsWithPlayer',
      'teamMaxPointsWithPlayer',
    ],
  },

  {
    id: 'player_games_team_points_rate_with_player_home',
    group: PLAYER_GAMES_METRIC_GROUPS.HOME_AWAY,
    label: 'אחוז הצלחה בצבירת נקודות עם השחקן בבית',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'player_games_team_home_points_with_player',
      'player_games_team_home_max_points_with_player',
    ],
    dependsOnFields: [
      'teamHomePointsWithPlayer',
      'teamHomeMaxPointsWithPlayer',
    ],
  },
  {
    id: 'player_games_team_points_rate_with_player_away',
    group: PLAYER_GAMES_METRIC_GROUPS.HOME_AWAY,
    label: 'אחוז הצלחה בצבירת נקודות עם השחקן בחוץ',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'player_games_team_away_points_with_player',
      'player_games_team_away_max_points_with_player',
    ],
    dependsOnFields: [
      'teamAwayPointsWithPlayer',
      'teamAwayMaxPointsWithPlayer',
    ],
  },

  {
    id: 'player_games_team_points_rate_with_player_by_difficulty',
    group: PLAYER_GAMES_METRIC_GROUPS.DIFFICULTY,
    label: 'אחוז הצלחה בצבירת נקודות עם השחקן לפי קושי יריבה',
    valueType: 'breakdown',
    unit: 'percent',
    requiredFacts: [
      'player_games_team_points_with_player_by_difficulty',
      'player_games_team_max_points_with_player_by_difficulty',
    ],
    dependsOnFields: [
      'teamPointsWithPlayerByDifficulty',
      'teamMaxPointsWithPlayerByDifficulty',
    ],
  },
]

export const getPlayerGamesMetricById = (id) => {
  return PLAYER_GAMES_METRICS_CATALOG.find((metric) => metric.id === id) || null
}

export const getPlayerGamesMetricsByGroup = (group) => {
  return PLAYER_GAMES_METRICS_CATALOG.filter((metric) => metric.group === group)
}
