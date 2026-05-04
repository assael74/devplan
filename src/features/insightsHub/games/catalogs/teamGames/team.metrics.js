// features/insightsHub/games/teamGames/team.metrics.js

export const TEAM_GAMES_METRIC_LEVELS = {
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
}

export const TEAM_GAMES_METRIC_SOURCES = {
  TEAM: 'team',
  TEAM_GAMES: 'teamGames',
  PERFORMANCE: 'performance',
}

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
    level: TEAM_GAMES_METRIC_LEVELS.LIGHT,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM,
    label: 'אחוז צבירת נקודות כללי',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'team_games_league_points',
      'team_games_league_max_points',
      'team_games_league_round',
    ],
    dependsOnFields: [
      'points',
      'leagueRound',
    ],
  },

  {
    id: 'team_games_goals_for_per_game',
    group: TEAM_GAMES_METRIC_GROUPS.GOALS,
    level: TEAM_GAMES_METRIC_LEVELS.LIGHT,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM,
    label: 'שערי זכות למשחק',
    valueType: 'number',
    unit: 'goals',
    requiredFacts: [
      'team_games_league_goals_for',
      'team_games_league_round',
    ],
    dependsOnFields: [
      'leagueGoalsFor',
      'leagueRound',
    ],
  },
  {
    id: 'team_games_goals_against_per_game',
    group: TEAM_GAMES_METRIC_GROUPS.GOALS,
    level: TEAM_GAMES_METRIC_LEVELS.LIGHT,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM,
    label: 'שערי חובה למשחק',
    valueType: 'number',
    unit: 'goals',
    requiredFacts: [
      'team_games_league_goals_against',
      'team_games_league_round',
    ],
    dependsOnFields: [
      'leagueGoalsAgainst',
      'leagueRound',
    ],
  },
  {
    id: 'team_games_goal_difference',
    group: TEAM_GAMES_METRIC_GROUPS.GOALS,
    level: TEAM_GAMES_METRIC_LEVELS.LIGHT,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM,
    label: 'הפרש שערים כולל',
    valueType: 'number',
    unit: 'goals',
    requiredFacts: [
      'team_games_league_goals_for',
      'team_games_league_goals_against',
    ],
    dependsOnFields: [
      'leagueGoalsFor',
      'leagueGoalsAgainst',
    ],
  },

  {
    id: 'team_games_projected_total_points',
    group: TEAM_GAMES_METRIC_GROUPS.PROJECTION,
    level: TEAM_GAMES_METRIC_LEVELS.LIGHT,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM,
    label: 'צפי נקודות כולל לפי קצב נוכחי',
    valueType: 'projection',
    unit: 'points',
    requiredFacts: [
      'team_games_league_points',
      'team_games_league_round',
      'team_games_league_num_games',
    ],
    dependsOnFields: [
      'points',
      'leagueRound',
      'leagueNumGames',
    ],
  },
  {
    id: 'team_games_projected_goals_for',
    group: TEAM_GAMES_METRIC_GROUPS.PROJECTION,
    level: TEAM_GAMES_METRIC_LEVELS.LIGHT,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM,
    label: 'צפי שערי זכות עד סוף העונה',
    valueType: 'projection',
    unit: 'goals',
    requiredFacts: [
      'team_games_league_goals_for',
      'team_games_league_round',
      'team_games_league_num_games',
    ],
    dependsOnFields: [
      'leagueGoalsFor',
      'leagueRound',
      'leagueNumGames',
    ],
  },
  {
    id: 'team_games_projected_goals_against',
    group: TEAM_GAMES_METRIC_GROUPS.PROJECTION,
    level: TEAM_GAMES_METRIC_LEVELS.LIGHT,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM,
    label: 'צפי שערי חובה עד סוף העונה',
    valueType: 'projection',
    unit: 'goals',
    requiredFacts: [
      'team_games_league_goals_against',
      'team_games_league_round',
      'team_games_league_num_games',
    ],
    dependsOnFields: [
      'leagueGoalsAgainst',
      'leagueRound',
      'leagueNumGames',
    ],
  },

  {
    id: 'team_games_win_rate',
    group: TEAM_GAMES_METRIC_GROUPS.RESULTS,
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
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
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
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
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
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
    id: 'team_games_home_points_rate',
    group: TEAM_GAMES_METRIC_GROUPS.HOME_AWAY,
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
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
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
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
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
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
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
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
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
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
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
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
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
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
    id: 'team_games_points_rate_by_difficulty',
    group: TEAM_GAMES_METRIC_GROUPS.DIFFICULTY,
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
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
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
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
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
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
    id: 'team_games_projected_points_by_remaining_difficulty',
    group: TEAM_GAMES_METRIC_GROUPS.PROJECTION,
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
    label: 'צפי נקודות לפי קושי המשחקים שנותרו',
    valueType: 'projection',
    unit: 'points',
    requiredFacts: [
      'team_games_points_by_difficulty',
      'team_games_max_points_by_difficulty',
      'team_games_games_by_difficulty',
      'team_games_remaining_games_by_difficulty',
    ],
    dependsOnFields: [
      'pointsByDifficulty',
      'maxPointsByDifficulty',
      'gamesByDifficulty',
      'remainingGamesByDifficulty',
    ],
  },
  {
    id: 'team_games_projected_final_position_by_home_away',
    group: TEAM_GAMES_METRIC_GROUPS.PROJECTION,
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
    label: 'צפי רמת טבלה לפי שקלול בית / חוץ',
    valueType: 'projection',
    unit: 'tableLevel',
    requiredFacts: [
      'team_games_home_points',
      'team_games_home_max_points',
      'team_games_remaining_home_games',
      'team_games_away_points',
      'team_games_away_max_points',
      'team_games_remaining_away_games',
    ],
    dependsOnFields: [
      'homePoints',
      'homeMaxPoints',
      'remainingHomeGamesCount',
      'awayPoints',
      'awayMaxPoints',
      'remainingAwayGamesCount',
    ],
  },
  {
    id: 'team_games_projected_final_position_by_difficulty',
    group: TEAM_GAMES_METRIC_GROUPS.PROJECTION,
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
    label: 'צפי רמת טבלה לפי קושי משחקים שנותרו',
    valueType: 'projection',
    unit: 'tableLevel',
    requiredFacts: [
      'team_games_points_by_difficulty',
      'team_games_max_points_by_difficulty',
      'team_games_games_by_difficulty',
      'team_games_remaining_games_by_difficulty',
    ],
    dependsOnFields: [
      'pointsByDifficulty',
      'maxPointsByDifficulty',
      'gamesByDifficulty',
      'remainingGamesByDifficulty',
    ],
  },

  {
    id: 'team_games_goal_scorers_rate',
    group: TEAM_GAMES_METRIC_GROUPS.PLAYERS,
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
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
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
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
    id: 'team_games_goal_contribution_players_rate',
    group: TEAM_GAMES_METRIC_GROUPS.PLAYERS,
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
    label: 'יחס שחקנים עם תרומת שער / בישול',
    valueType: 'ratio',
    unit: 'ratio',
    requiredFacts: [
      'team_games_goal_scorers_count',
      'team_games_assist_players_count',
      'team_games_used_players_count',
    ],
    dependsOnFields: [
      'goalScorersCount',
      'assistPlayersCount',
      'usedPlayersCount',
    ],
  },
  {
    id: 'team_games_starters_usage_rate',
    group: TEAM_GAMES_METRIC_GROUPS.PLAYERS,
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
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
    level: TEAM_GAMES_METRIC_LEVELS.MEDIUM,
    source: TEAM_GAMES_METRIC_SOURCES.TEAM_GAMES,
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

export const getTeamGamesMetricsByLevel = (level) => {
  return TEAM_GAMES_METRICS_CATALOG.filter((metric) => metric.level === level)
}

export const getTeamGamesMetricsBySource = (source) => {
  return TEAM_GAMES_METRICS_CATALOG.filter((metric) => metric.source === source)
}
