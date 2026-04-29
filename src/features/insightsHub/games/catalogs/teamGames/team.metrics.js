// features/insightsHub/games/teamGames/team.metrics.js

export const TEAM_GAMES_METRIC_GROUPS = {
  PERFORMANCE: 'performance',
  RESULTS: 'results',
  GOALS: 'goals',
  HOME_AWAY: 'homeAway',
  DIFFICULTY: 'difficulty',
  PLAYERS: 'players',
  PROJECTION: 'projection',
}

export const TEAM_GAMES_METRICS_CATALOG = [
  {
    id: 'team_games_points_rate',
    group: TEAM_GAMES_METRIC_GROUPS.PERFORMANCE,
    label: 'אחוז צבירת נקודות כללי',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'team_games_points',
      'team_games_max_points',
      'team_games_played_games',
    ],
    dependsOnFields: [
      'points',
      'maxPoints',
      'playedGamesCount',
    ],
  },

  {
    id: 'team_games_win_rate',
    group: TEAM_GAMES_METRIC_GROUPS.RESULTS,
    label: 'אחוז ניצחונות',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'team_games_wins',
      'team_games_played_games',
    ],
    dependsOnFields: [
      'wins',
      'playedGamesCount',
    ],
  },
  {
    id: 'team_games_draw_rate',
    group: TEAM_GAMES_METRIC_GROUPS.RESULTS,
    label: 'אחוז תיקו',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'team_games_draws',
      'team_games_played_games',
    ],
    dependsOnFields: [
      'draws',
      'playedGamesCount',
    ],
  },
  {
    id: 'team_games_loss_rate',
    group: TEAM_GAMES_METRIC_GROUPS.RESULTS,
    label: 'אחוז הפסדים',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'team_games_losses',
      'team_games_played_games',
    ],
    dependsOnFields: [
      'losses',
      'playedGamesCount',
    ],
  },

  {
    id: 'team_games_goals_for_per_game',
    group: TEAM_GAMES_METRIC_GROUPS.GOALS,
    label: 'שערי זכות למשחק',
    valueType: 'number',
    unit: 'goals',
    requiredFacts: [
      'team_games_goals_for',
      'team_games_played_games',
    ],
    dependsOnFields: [
      'goalsFor',
      'playedGamesCount',
    ],
  },
  {
    id: 'team_games_goals_against_per_game',
    group: TEAM_GAMES_METRIC_GROUPS.GOALS,
    label: 'שערי חובה למשחק',
    valueType: 'number',
    unit: 'goals',
    requiredFacts: [
      'team_games_goals_against',
      'team_games_played_games',
    ],
    dependsOnFields: [
      'goalsAgainst',
      'playedGamesCount',
    ],
  },
  {
    id: 'team_games_goal_difference',
    group: TEAM_GAMES_METRIC_GROUPS.GOALS,
    label: 'הפרש שערים כולל',
    valueType: 'number',
    unit: 'goals',
    requiredFacts: [
      'team_games_goals_for',
      'team_games_goals_against',
    ],
    dependsOnFields: [
      'goalsFor',
      'goalsAgainst',
    ],
  },

  {
    id: 'team_games_home_points_rate',
    group: TEAM_GAMES_METRIC_GROUPS.HOME_AWAY,
    label: 'אחוז צבירת נקודות בבית',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'team_games_home_points',
      'team_games_home_max_points',
      'team_games_home_games',
    ],
    dependsOnFields: [
      'homePoints',
      'homeMaxPoints',
      'homeGamesCount',
    ],
  },
  {
    id: 'team_games_away_points_rate',
    group: TEAM_GAMES_METRIC_GROUPS.HOME_AWAY,
    label: 'אחוז צבירת נקודות בחוץ',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'team_games_away_points',
      'team_games_away_max_points',
      'team_games_away_games',
    ],
    dependsOnFields: [
      'awayPoints',
      'awayMaxPoints',
      'awayGamesCount',
    ],
  },
  {
    id: 'team_games_home_away_points_gap',
    group: TEAM_GAMES_METRIC_GROUPS.HOME_AWAY,
    label: 'פער צבירת נקודות בית / חוץ',
    valueType: 'gap',
    unit: 'percent',
    requiredFacts: [
      'team_games_home_points',
      'team_games_home_max_points',
      'team_games_away_points',
      'team_games_away_max_points',
    ],
    dependsOnFields: [
      'homePoints',
      'homeMaxPoints',
      'awayPoints',
      'awayMaxPoints',
    ],
  },

  {
    id: 'team_games_remaining_home_games_count',
    group: TEAM_GAMES_METRIC_GROUPS.PROJECTION,
    label: 'כמות משחקי בית שנותרו',
    valueType: 'number',
    unit: 'games',
    requiredFacts: [
      'team_games_remaining_home_games',
    ],
    dependsOnFields: [
      'remainingHomeGamesCount',
    ],
  },
  {
    id: 'team_games_remaining_away_games_count',
    group: TEAM_GAMES_METRIC_GROUPS.PROJECTION,
    label: 'כמות משחקי חוץ שנותרו',
    valueType: 'number',
    unit: 'games',
    requiredFacts: [
      'team_games_remaining_away_games',
    ],
    dependsOnFields: [
      'remainingAwayGamesCount',
    ],
  },
  {
    id: 'team_games_projected_home_points',
    group: TEAM_GAMES_METRIC_GROUPS.PROJECTION,
    label: 'צפי נקודות בית לפי קצב נוכחי',
    valueType: 'projection',
    unit: 'points',
    requiredFacts: [
      'team_games_home_points',
      'team_games_home_max_points',
      'team_games_home_games',
      'team_games_remaining_home_games',
    ],
    dependsOnFields: [
      'homePoints',
      'homeMaxPoints',
      'homeGamesCount',
      'remainingHomeGamesCount',
    ],
  },
  {
    id: 'team_games_projected_away_points',
    group: TEAM_GAMES_METRIC_GROUPS.PROJECTION,
    label: 'צפי נקודות חוץ לפי קצב נוכחי',
    valueType: 'projection',
    unit: 'points',
    requiredFacts: [
      'team_games_away_points',
      'team_games_away_max_points',
      'team_games_away_games',
      'team_games_remaining_away_games',
    ],
    dependsOnFields: [
      'awayPoints',
      'awayMaxPoints',
      'awayGamesCount',
      'remainingAwayGamesCount',
    ],
  },
  {
    id: 'team_games_projected_total_points',
    group: TEAM_GAMES_METRIC_GROUPS.PROJECTION,
    label: 'צפי נקודות כולל לפי קצב נוכחי',
    valueType: 'projection',
    unit: 'points',
    requiredFacts: [
      'team_games_points',
      'team_games_home_points',
      'team_games_home_max_points',
      'team_games_remaining_home_games',
      'team_games_away_points',
      'team_games_away_max_points',
      'team_games_remaining_away_games',
    ],
    dependsOnFields: [
      'points',
      'homePoints',
      'homeMaxPoints',
      'homeGamesCount',
      'remainingHomeGamesCount',
      'awayPoints',
      'awayMaxPoints',
      'awayGamesCount',
      'remainingAwayGamesCount',
    ],
  },

  {
    id: 'team_games_points_rate_by_difficulty',
    group: TEAM_GAMES_METRIC_GROUPS.DIFFICULTY,
    label: 'אחוז צבירת נקודות לפי קושי יריבה',
    valueType: 'breakdown',
    unit: 'percent',
    requiredFacts: [
      'team_games_points_by_difficulty',
      'team_games_max_points_by_difficulty',
      'team_games_games_by_difficulty',
    ],
    dependsOnFields: [
      'pointsByDifficulty',
      'maxPointsByDifficulty',
      'gamesByDifficulty',
    ],
  },
  {
    id: 'team_games_remaining_difficulty_profile',
    group: TEAM_GAMES_METRIC_GROUPS.DIFFICULTY,
    label: 'פרופיל קושי המשחקים שנותרו',
    valueType: 'breakdown',
    unit: 'games',
    requiredFacts: [
      'team_games_remaining_games_by_difficulty',
    ],
    dependsOnFields: [
      'remainingGamesByDifficulty',
    ],
  },
  {
    id: 'team_games_difficulty_adjusted_points_rate',
    group: TEAM_GAMES_METRIC_GROUPS.DIFFICULTY,
    label: 'אחוז צבירת נקודות מותאם קושי',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'team_games_points',
      'team_games_max_points',
      'team_games_games_by_difficulty',
      'team_games_points_by_difficulty',
      'team_games_max_points_by_difficulty',
    ],
    dependsOnFields: [
      'points',
      'maxPoints',
      'gamesByDifficulty',
      'pointsByDifficulty',
      'maxPointsByDifficulty',
    ],
  },

  {
    id: 'team_games_goal_scorers_rate',
    group: TEAM_GAMES_METRIC_GROUPS.PLAYERS,
    label: 'יחס כובשי שערים',
    valueType: 'ratio',
    unit: 'ratio',
    requiredFacts: [
      'team_games_goal_scorers_count',
      'team_games_used_players_count',
    ],
    dependsOnFields: [
      'goalScorersCount',
      'usedPlayersCount',
    ],
  },
  {
    id: 'team_games_assist_players_rate',
    group: TEAM_GAMES_METRIC_GROUPS.PLAYERS,
    label: 'יחס מבשלי שערים',
    valueType: 'ratio',
    unit: 'ratio',
    requiredFacts: [
      'team_games_assist_players_count',
      'team_games_used_players_count',
    ],
    dependsOnFields: [
      'assistPlayersCount',
      'usedPlayersCount',
    ],
  },
  {
    id: 'team_games_starters_usage_rate',
    group: TEAM_GAMES_METRIC_GROUPS.PLAYERS,
    label: 'יחס שחקנים שפתחו בהרכב',
    valueType: 'ratio',
    unit: 'ratio',
    requiredFacts: [
      'team_games_starters_count',
      'team_games_used_players_count',
    ],
    dependsOnFields: [
      'startersCount',
      'usedPlayersCount',
    ],
  },
  {
    id: 'team_games_used_players_rate',
    group: TEAM_GAMES_METRIC_GROUPS.PLAYERS,
    label: 'יחס שחקנים ששולבו',
    valueType: 'ratio',
    unit: 'ratio',
    requiredFacts: [
      'team_games_used_players_count',
      'team_games_squad_size',
    ],
    dependsOnFields: [
      'usedPlayersCount',
      'squadSize',
    ],
  },
]

export const getTeamGamesMetricById = (id) => {
  return TEAM_GAMES_METRICS_CATALOG.find((metric) => metric.id === id) || null
}

export const getTeamGamesMetricsByGroup = (group) => {
  return TEAM_GAMES_METRICS_CATALOG.filter((metric) => metric.group === group)
}
