// features/insightsHub/games/teamGames/team.facts.js

export const TEAM_GAMES_FACT_LEVELS = {
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
}

export const TEAM_GAMES_FACT_SOURCES = {
  TEAM: 'team',
  TEAM_GAMES: 'teamGames',
  PERFORMANCE: 'performance',
}

export const TEAM_GAMES_FACT_GROUPS = {
  LEAGUE: 'league',
  GAMES: 'games',
  RESULTS: 'results',
  GOALS: 'goals',
  HOME_AWAY: 'homeAway',
  DIFFICULTY: 'difficulty',
  PLAYERS: 'players',
  PERFORMANCE: 'performance',
}

export const TEAM_GAMES_FACTS_CATALOG = [
  {
    id: 'team_games_league',
    group: TEAM_GAMES_FACT_GROUPS.LEAGUE,
    level: TEAM_GAMES_FACT_LEVELS.LIGHT,
    source: TEAM_GAMES_FACT_SOURCES.TEAM,
    label: 'ליגה',
    field: 'league',
  },
  {
    id: 'team_games_league_level',
    group: TEAM_GAMES_FACT_GROUPS.LEAGUE,
    level: TEAM_GAMES_FACT_LEVELS.LIGHT,
    source: TEAM_GAMES_FACT_SOURCES.TEAM,
    label: 'רמת ליגה',
    field: 'leagueLevel',
  },
  {
    id: 'team_games_league_position',
    group: TEAM_GAMES_FACT_GROUPS.LEAGUE,
    level: TEAM_GAMES_FACT_LEVELS.LIGHT,
    source: TEAM_GAMES_FACT_SOURCES.TEAM,
    label: 'מיקום בליגה',
    field: 'leaguePosition',
  },
  {
    id: 'team_games_league_round',
    group: TEAM_GAMES_FACT_GROUPS.LEAGUE,
    level: TEAM_GAMES_FACT_LEVELS.LIGHT,
    source: TEAM_GAMES_FACT_SOURCES.TEAM,
    label: 'מחזור נוכחי',
    field: 'leagueRound',
  },
  {
    id: 'team_games_league_num_games',
    group: TEAM_GAMES_FACT_GROUPS.LEAGUE,
    level: TEAM_GAMES_FACT_LEVELS.LIGHT,
    source: TEAM_GAMES_FACT_SOURCES.TEAM,
    label: 'כמות משחקים בליגה',
    field: 'leagueNumGames',
  },
  {
    id: 'team_games_league_remaining_games',
    group: TEAM_GAMES_FACT_GROUPS.LEAGUE,
    level: TEAM_GAMES_FACT_LEVELS.LIGHT,
    source: TEAM_GAMES_FACT_SOURCES.TEAM,
    label: 'כמות משחקים שנותרו',
    field: 'leagueRemainingGames',
    derived: true,
  },
  {
    id: 'team_games_league_points',
    group: TEAM_GAMES_FACT_GROUPS.RESULTS,
    level: TEAM_GAMES_FACT_LEVELS.LIGHT,
    source: TEAM_GAMES_FACT_SOURCES.TEAM,
    label: 'נקודות בליגה',
    field: 'points',
  },
  {
    id: 'team_games_league_max_points',
    group: TEAM_GAMES_FACT_GROUPS.RESULTS,
    level: TEAM_GAMES_FACT_LEVELS.LIGHT,
    source: TEAM_GAMES_FACT_SOURCES.TEAM,
    label: 'נקודות אפשריות עד עכשיו',
    field: 'leagueMaxPoints',
    derived: true,
  },
  {
    id: 'team_games_league_total_max_points',
    group: TEAM_GAMES_FACT_GROUPS.RESULTS,
    level: TEAM_GAMES_FACT_LEVELS.LIGHT,
    source: TEAM_GAMES_FACT_SOURCES.TEAM,
    label: 'נקודות אפשריות בעונה',
    field: 'leagueTotalMaxPoints',
    derived: true,
  },
  {
    id: 'team_games_league_goals_for',
    group: TEAM_GAMES_FACT_GROUPS.GOALS,
    level: TEAM_GAMES_FACT_LEVELS.LIGHT,
    source: TEAM_GAMES_FACT_SOURCES.TEAM,
    label: 'שערי זכות בליגה',
    field: 'leagueGoalsFor',
  },
  {
    id: 'team_games_league_goals_against',
    group: TEAM_GAMES_FACT_GROUPS.GOALS,
    level: TEAM_GAMES_FACT_LEVELS.LIGHT,
    source: TEAM_GAMES_FACT_SOURCES.TEAM,
    label: 'שערי חובה בליגה',
    field: 'leagueGoalsAgainst',
  },

  {
    id: 'team_games_total_games',
    group: TEAM_GAMES_FACT_GROUPS.GAMES,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'כמות משחקים כוללת',
    field: 'totalGames',
  },
  {
    id: 'team_games_played_games',
    group: TEAM_GAMES_FACT_GROUPS.GAMES,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'כמות משחקים ששוחקו',
    field: 'playedGamesCount',
  },
  {
    id: 'team_games_upcoming_games',
    group: TEAM_GAMES_FACT_GROUPS.GAMES,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'כמות משחקים עתידיים',
    field: 'upcomingGamesCount',
  },
  {
    id: 'team_games_next_game',
    group: TEAM_GAMES_FACT_GROUPS.GAMES,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'משחק הבא',
    field: 'nextGame',
  },

  {
    id: 'team_games_wins',
    group: TEAM_GAMES_FACT_GROUPS.RESULTS,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'כמות ניצחונות',
    field: 'wins',
  },
  {
    id: 'team_games_draws',
    group: TEAM_GAMES_FACT_GROUPS.RESULTS,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'כמות תיקו',
    field: 'draws',
  },
  {
    id: 'team_games_losses',
    group: TEAM_GAMES_FACT_GROUPS.RESULTS,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'כמות הפסדים',
    field: 'losses',
  },
  {
    id: 'team_games_points',
    group: TEAM_GAMES_FACT_GROUPS.RESULTS,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'נקודות ממשחקים',
    field: 'points',
  },
  {
    id: 'team_games_max_points',
    group: TEAM_GAMES_FACT_GROUPS.RESULTS,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'נקודות אפשריות ממשחקים',
    field: 'maxPoints',
  },

  {
    id: 'team_games_goals_for',
    group: TEAM_GAMES_FACT_GROUPS.GOALS,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'שערי זכות ממשחקים',
    field: 'goalsFor',
  },
  {
    id: 'team_games_goals_against',
    group: TEAM_GAMES_FACT_GROUPS.GOALS,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'שערי חובה ממשחקים',
    field: 'goalsAgainst',
  },

  {
    id: 'team_games_home_games',
    group: TEAM_GAMES_FACT_GROUPS.HOME_AWAY,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'כמות משחקי בית',
    field: 'homeGamesCount',
  },
  {
    id: 'team_games_away_games',
    group: TEAM_GAMES_FACT_GROUPS.HOME_AWAY,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'כמות משחקי חוץ',
    field: 'awayGamesCount',
  },
  {
    id: 'team_games_home_points',
    group: TEAM_GAMES_FACT_GROUPS.HOME_AWAY,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'נקודות בית',
    field: 'homePoints',
  },
  {
    id: 'team_games_home_max_points',
    group: TEAM_GAMES_FACT_GROUPS.HOME_AWAY,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'נקודות בית אפשריות',
    field: 'homeMaxPoints',
  },
  {
    id: 'team_games_away_points',
    group: TEAM_GAMES_FACT_GROUPS.HOME_AWAY,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'נקודות חוץ',
    field: 'awayPoints',
  },
  {
    id: 'team_games_away_max_points',
    group: TEAM_GAMES_FACT_GROUPS.HOME_AWAY,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'נקודות חוץ אפשריות',
    field: 'awayMaxPoints',
  },
  {
    id: 'team_games_remaining_home_games',
    group: TEAM_GAMES_FACT_GROUPS.HOME_AWAY,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'כמות משחקי בית שנשארו',
    field: 'remainingHomeGamesCount',
  },
  {
    id: 'team_games_remaining_away_games',
    group: TEAM_GAMES_FACT_GROUPS.HOME_AWAY,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'כמות משחקי חוץ שנשארו',
    field: 'remainingAwayGamesCount',
  },

  {
    id: 'team_games_games_by_difficulty',
    group: TEAM_GAMES_FACT_GROUPS.DIFFICULTY,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'כמות משחקים לפי רמת קושי',
    field: 'gamesByDifficulty',
  },
  {
    id: 'team_games_points_by_difficulty',
    group: TEAM_GAMES_FACT_GROUPS.DIFFICULTY,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'נקודות לפי רמת קושי',
    field: 'pointsByDifficulty',
  },
  {
    id: 'team_games_max_points_by_difficulty',
    group: TEAM_GAMES_FACT_GROUPS.DIFFICULTY,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'נקודות אפשריות לפי רמת קושי',
    field: 'maxPointsByDifficulty',
  },
  {
    id: 'team_games_remaining_games_by_difficulty',
    group: TEAM_GAMES_FACT_GROUPS.DIFFICULTY,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'כמות משחקים שנשארו לפי רמת קושי',
    field: 'remainingGamesByDifficulty',
  },

  {
    id: 'team_games_goal_scorers_count',
    group: TEAM_GAMES_FACT_GROUPS.PLAYERS,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'כמות כובשי שערים',
    field: 'goalScorersCount',
  },
  {
    id: 'team_games_assist_players_count',
    group: TEAM_GAMES_FACT_GROUPS.PLAYERS,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'כמות מבשלי שערים',
    field: 'assistPlayersCount',
  },
  {
    id: 'team_games_starters_count',
    group: TEAM_GAMES_FACT_GROUPS.PLAYERS,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'כמות שחקנים שפתחו בהרכב',
    field: 'startersCount',
  },
  {
    id: 'team_games_used_players_count',
    group: TEAM_GAMES_FACT_GROUPS.PLAYERS,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'כמות שחקנים ששולבו במשחקים',
    field: 'usedPlayersCount',
  },
  {
    id: 'team_games_squad_size',
    group: TEAM_GAMES_FACT_GROUPS.PLAYERS,
    level: TEAM_GAMES_FACT_LEVELS.MEDIUM,
    source: TEAM_GAMES_FACT_SOURCES.TEAM_GAMES,
    label: 'גודל סגל',
    field: 'squadSize',
  },
]

export const getTeamGamesFactById = (id) => {
  return TEAM_GAMES_FACTS_CATALOG.find((fact) => fact.id === id) || null
}

export const getTeamGamesFactsByGroup = (group) => {
  return TEAM_GAMES_FACTS_CATALOG.filter((fact) => fact.group === group)
}

export const getTeamGamesFactsByLevel = (level) => {
  return TEAM_GAMES_FACTS_CATALOG.filter((fact) => fact.level === level)
}

export const getTeamGamesFactsBySource = (source) => {
  return TEAM_GAMES_FACTS_CATALOG.filter((fact) => fact.source === source)
}
