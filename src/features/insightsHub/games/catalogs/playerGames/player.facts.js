// features/insightsHub/games/playerGames/player.facts.js

export const PLAYER_GAMES_FACT_GROUPS = {
  GAMES: 'games',
  MINUTES: 'minutes',
  LINEUP: 'lineup',
  OUTPUT: 'output',
  HOME_AWAY: 'homeAway',
  DIFFICULTY: 'difficulty',
}

export const PLAYER_GAMES_FACTS_CATALOG = [
  {
    id: 'player_games_team_total_games',
    group: PLAYER_GAMES_FACT_GROUPS.GAMES,
    label: 'כמות משחקי קבוצה כוללת',
    field: 'teamTotalGames',
  },
  {
    id: 'player_games_team_played_games',
    group: PLAYER_GAMES_FACT_GROUPS.GAMES,
    label: 'כמות משחקי קבוצה ששוחקו',
    field: 'teamPlayedGamesCount',
  },
  {
    id: 'player_games_played_games',
    group: PLAYER_GAMES_FACT_GROUPS.GAMES,
    label: 'כמות משחקים שבהם השחקן שותף',
    field: 'playerPlayedGamesCount',
  },
  {
    id: 'player_games_not_played_games',
    group: PLAYER_GAMES_FACT_GROUPS.GAMES,
    label: 'כמות משחקים שבהם השחקן לא שותף',
    field: 'playerNotPlayedGamesCount',
  },

  {
    id: 'player_games_minutes_played',
    group: PLAYER_GAMES_FACT_GROUPS.MINUTES,
    label: 'דקות משחק של השחקן',
    field: 'minutesPlayed',
  },
  {
    id: 'player_games_minutes_possible',
    group: PLAYER_GAMES_FACT_GROUPS.MINUTES,
    label: 'דקות משחק אפשריות',
    field: 'minutesPossible',
  },

  {
    id: 'player_games_starts_count',
    group: PLAYER_GAMES_FACT_GROUPS.LINEUP,
    label: 'כמות פעמים שפתח בהרכב',
    field: 'startsCount',
  },
  {
    id: 'player_games_bench_appearances_count',
    group: PLAYER_GAMES_FACT_GROUPS.LINEUP,
    label: 'כמות פעמים שעלה מהספסל',
    field: 'benchAppearancesCount',
  },
  {
    id: 'player_games_unused_squad_count',
    group: PLAYER_GAMES_FACT_GROUPS.LINEUP,
    label: 'כמות פעמים שהיה בסגל ולא שותף',
    field: 'unusedSquadCount',
  },

  {
    id: 'player_games_goals',
    group: PLAYER_GAMES_FACT_GROUPS.OUTPUT,
    label: 'כמות שערים',
    field: 'goals',
  },
  {
    id: 'player_games_assists',
    group: PLAYER_GAMES_FACT_GROUPS.OUTPUT,
    label: 'כמות בישולים',
    field: 'assists',
  },
  {
    id: 'player_games_goal_games_count',
    group: PLAYER_GAMES_FACT_GROUPS.OUTPUT,
    label: 'כמות משחקים שבהם כבש',
    field: 'goalGamesCount',
  },
  {
    id: 'player_games_assist_games_count',
    group: PLAYER_GAMES_FACT_GROUPS.OUTPUT,
    label: 'כמות משחקים שבהם בישל',
    field: 'assistGamesCount',
  },

  {
    id: 'player_games_home_played_games',
    group: PLAYER_GAMES_FACT_GROUPS.HOME_AWAY,
    label: 'כמות משחקי בית שבהם שותף',
    field: 'homePlayedGamesCount',
  },
  {
    id: 'player_games_away_played_games',
    group: PLAYER_GAMES_FACT_GROUPS.HOME_AWAY,
    label: 'כמות משחקי חוץ שבהם שותף',
    field: 'awayPlayedGamesCount',
  },

  {
    id: 'player_games_played_games_by_difficulty',
    group: PLAYER_GAMES_FACT_GROUPS.DIFFICULTY,
    label: 'כמות משחקים שבהם שותף לפי רמת קושי',
    field: 'playedGamesByDifficulty',
  },
]

export const getPlayerGamesFactById = (id) => {
  return PLAYER_GAMES_FACTS_CATALOG.find((fact) => fact.id === id) || null
}

export const getPlayerGamesFactsByGroup = (group) => {
  return PLAYER_GAMES_FACTS_CATALOG.filter((fact) => fact.group === group)
}
