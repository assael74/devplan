// features/insightsHub/games/teamGames/team.facts.js

export const TEAM_GAMES_FACT_GROUPS = {
  GAMES: 'games',
  RESULTS: 'results',
  GOALS: 'goals',
  HOME_AWAY: 'homeAway',
  DIFFICULTY: 'difficulty',
  PLAYERS: 'players',
}

export const TEAM_GAMES_FACTS_CATALOG = [
  {
    id: 'team_games_total_games',
    group: TEAM_GAMES_FACT_GROUPS.GAMES,
    label: 'כמות משחקים כוללת',
    field: 'totalGames',
  },
  {
    id: 'team_games_played_games',
    group: TEAM_GAMES_FACT_GROUPS.GAMES,
    label: 'כמות משחקים ששוחקו',
    field: 'playedGamesCount',
  },
  {
    id: 'team_games_upcoming_games',
    group: TEAM_GAMES_FACT_GROUPS.GAMES,
    label: 'כמות משחקים עתידיים',
    field: 'upcomingGamesCount',
  },
  {
    id: 'team_games_next_game',
    group: TEAM_GAMES_FACT_GROUPS.GAMES,
    label: 'משחק הבא',
    field: 'nextGame',
  },

  {
    id: 'team_games_wins',
    group: TEAM_GAMES_FACT_GROUPS.RESULTS,
    label: 'כמות ניצחונות',
    field: 'wins',
  },
  {
    id: 'team_games_draws',
    group: TEAM_GAMES_FACT_GROUPS.RESULTS,
    label: 'כמות תיקו',
    field: 'draws',
  },
  {
    id: 'team_games_losses',
    group: TEAM_GAMES_FACT_GROUPS.RESULTS,
    label: 'כמות הפסדים',
    field: 'losses',
  },
  {
    id: 'team_games_points',
    group: TEAM_GAMES_FACT_GROUPS.RESULTS,
    label: 'נקודות שנצברו',
    field: 'points',
  },
  {
    id: 'team_games_max_points',
    group: TEAM_GAMES_FACT_GROUPS.RESULTS,
    label: 'נקודות אפשריות',
    field: 'maxPoints',
  },

  {
    id: 'team_games_goals_for',
    group: TEAM_GAMES_FACT_GROUPS.GOALS,
    label: 'שערי זכות',
    field: 'goalsFor',
  },
  {
    id: 'team_games_goals_against',
    group: TEAM_GAMES_FACT_GROUPS.GOALS,
    label: 'שערי חובה',
    field: 'goalsAgainst',
  },

  {
    id: 'team_games_home_games',
    group: TEAM_GAMES_FACT_GROUPS.HOME_AWAY,
    label: 'כמות משחקי בית',
    field: 'homeGamesCount',
  },
  {
    id: 'team_games_away_games',
    group: TEAM_GAMES_FACT_GROUPS.HOME_AWAY,
    label: 'כמות משחקי חוץ',
    field: 'awayGamesCount',
  },
  {
    id: 'team_games_home_points',
    group: TEAM_GAMES_FACT_GROUPS.HOME_AWAY,
    label: 'נקודות בית',
    field: 'homePoints',
  },
  {
    id: 'team_games_home_max_points',
    group: TEAM_GAMES_FACT_GROUPS.HOME_AWAY,
    label: 'נקודות בית אפשריות',
    field: 'homeMaxPoints',
  },
  {
    id: 'team_games_away_points',
    group: TEAM_GAMES_FACT_GROUPS.HOME_AWAY,
    label: 'נקודות חוץ',
    field: 'awayPoints',
  },
  {
    id: 'team_games_away_max_points',
    group: TEAM_GAMES_FACT_GROUPS.HOME_AWAY,
    label: 'נקודות חוץ אפשריות',
    field: 'awayMaxPoints',
  },
  {
    id: 'team_games_remaining_home_games',
    group: TEAM_GAMES_FACT_GROUPS.HOME_AWAY,
    label: 'כמות משחקי בית שנשארו',
    field: 'remainingHomeGamesCount',
  },
  {
    id: 'team_games_remaining_away_games',
    group: TEAM_GAMES_FACT_GROUPS.HOME_AWAY,
    label: 'כמות משחקי חוץ שנשארו',
    field: 'remainingAwayGamesCount',
  },

  {
    id: 'team_games_games_by_difficulty',
    group: TEAM_GAMES_FACT_GROUPS.DIFFICULTY,
    label: 'כמות משחקים לפי רמת קושי',
    field: 'gamesByDifficulty',
  },
  {
    id: 'team_games_points_by_difficulty',
    group: TEAM_GAMES_FACT_GROUPS.DIFFICULTY,
    label: 'נקודות לפי רמת קושי',
    field: 'pointsByDifficulty',
  },
  {
    id: 'team_games_max_points_by_difficulty',
    group: TEAM_GAMES_FACT_GROUPS.DIFFICULTY,
    label: 'נקודות אפשריות לפי רמת קושי',
    field: 'maxPointsByDifficulty',
  },
  {
    id: 'team_games_remaining_games_by_difficulty',
    group: TEAM_GAMES_FACT_GROUPS.DIFFICULTY,
    label: 'כמות משחקים שנשארו לפי רמת קושי',
    field: 'remainingGamesByDifficulty',
  },

  {
    id: 'team_games_goal_scorers_count',
    group: TEAM_GAMES_FACT_GROUPS.PLAYERS,
    label: 'כמות כובשי שערים',
    field: 'goalScorersCount',
  },
  {
    id: 'team_games_assist_players_count',
    group: TEAM_GAMES_FACT_GROUPS.PLAYERS,
    label: 'כמות מבשלי שערים',
    field: 'assistPlayersCount',
  },
  {
    id: 'team_games_starters_count',
    group: TEAM_GAMES_FACT_GROUPS.PLAYERS,
    label: 'כמות שחקנים שפתחו בהרכב',
    field: 'startersCount',
  },
  {
    id: 'team_games_used_players_count',
    group: TEAM_GAMES_FACT_GROUPS.PLAYERS,
    label: 'כמות שחקנים ששולבו במשחקים',
    field: 'usedPlayersCount',
  },
  {
    id: 'team_games_squad_size',
    group: TEAM_GAMES_FACT_GROUPS.PLAYERS,
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
