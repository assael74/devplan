// features/insightsHub/games/catalogs/view.js

export const TEAM_GAMES_VIEW_CONTEXTS = [
  {
    id: 'current',
    idIcon: 'current',
    idColor: 'success',
    label: 'מה היה עד עכשיו',
    groups: [
      {
        id: 'league',
        label: 'ליגה',
        level: 'light',
        source: 'team',
        factGroups: ['league'],
        metricGroups: [],
      },
      {
        id: 'results',
        label: 'תוצאות',
        level: 'light',
        source: 'team',
        factIds: [
          'team_games_league_points',
          'team_games_league_max_points',
        ],
        metricIds: [
          'team_games_points_rate',
        ],
        benchmarkIds: [
          'team_games_benchmark_points_rate_by_table_level',
        ],
      },
      {
        id: 'goals',
        label: 'שערים',
        level: 'light',
        source: 'team',
        factIds: [
          'team_games_league_goals_for',
          'team_games_league_goals_against',
        ],
        metricIds: [
          'team_games_goals_for_per_game',
          'team_games_goals_against_per_game',
          'team_games_goal_difference',
        ],
        benchmarkIds: [
          'team_games_benchmark_goal_difference_by_table_level',
          'team_games_benchmark_goals_for_by_table_level',
          'team_games_benchmark_goals_against_by_table_level',
        ],
      },

      {
        id: 'homeAway',
        label: 'בית / חוץ',
        level: 'medium',
        source: 'teamGames',
        requiresSync: true,
        factGroups: ['homeAway'],
        metricGroups: ['homeAway'],
        excludeFacts: [
          'team_games_remaining_home_games',
          'team_games_remaining_away_games',
        ],
      },
      {
        id: 'difficulty',
        label: 'קושי יריבה',
        level: 'medium',
        source: 'teamGames',
        requiresSync: true,
        factGroups: ['difficulty'],
        metricGroups: ['difficulty'],
        excludeFacts: [
          'team_games_remaining_games_by_difficulty',
        ],
        excludeMetrics: [
          'team_games_remaining_difficulty_profile',
          'team_games_projected_points_by_remaining_difficulty',
          'team_games_projected_final_position_by_difficulty',
        ],
      },
      {
        id: 'players',
        label: 'שחקנים',
        level: 'medium',
        source: 'teamGames',
        requiresSync: true,
        factGroups: ['players'],
        metricGroups: ['players'],
      },
    ],
  },
  {
    id: 'projection',
    label: 'מה צפוי',
    idIcon: 'projection',
    idColor: 'warning',
    groups: [
      {
        id: 'leagueProjection',
        label: 'תחזית ליגה',
        level: 'light',
        source: 'team',
        factIds: [
          'team_games_league_round',
          'team_games_league_num_games',
          'team_games_league_remaining_games',
        ],
        metricIds: [
          'team_games_projected_total_points',
          'team_games_projected_goals_for',
          'team_games_projected_goals_against',
        ],
        benchmarkIds: [
          'team_games_benchmark_final_points_by_table_level',
          'team_games_benchmark_goals_for_by_table_level',
          'team_games_benchmark_goals_against_by_table_level',
        ],
      },
      {
        id: 'gamesProjection',
        label: 'משחקים שנותרו',
        level: 'medium',
        source: 'teamGames',
        requiresSync: true,
        factIds: [
          'team_games_upcoming_games',
          'team_games_next_game',
        ],
        metricIds: [],
      },
      {
        id: 'homeAwayProjection',
        label: 'בית / חוץ',
        level: 'medium',
        source: 'teamGames',
        requiresSync: true,
        factIds: [
          'team_games_remaining_home_games',
          'team_games_remaining_away_games',
        ],
        metricIds: [
          'team_games_remaining_home_games_count',
          'team_games_remaining_away_games_count',
          'team_games_projected_home_points',
          'team_games_projected_away_points',
          'team_games_projected_final_position_by_home_away',
        ],
        benchmarkIds: [
          'team_games_benchmark_final_points_by_table_level',
        ],
      },
      {
        id: 'difficultyProjection',
        label: 'קושי יריבה',
        level: 'medium',
        source: 'teamGames',
        requiresSync: true,
        factIds: [
          'team_games_remaining_games_by_difficulty',
        ],
        metricIds: [
          'team_games_remaining_difficulty_profile',
          'team_games_projected_points_by_remaining_difficulty',
          'team_games_projected_final_position_by_difficulty',
        ],
        benchmarkIds: [
          'team_games_benchmark_final_points_by_table_level',
        ],
      },
    ],
  },
]

export const PLAYER_GAMES_VIEW_CONTEXTS = [
  {
    id: 'current',
    label: 'מה היה עד עכשיו',
    groups: [
      {
        id: 'participation',
        label: 'שיתוף',
        factGroups: ['games'],
        metricGroups: ['participation'],
      },
      {
        id: 'minutes',
        label: 'דקות',
        factGroups: ['minutes'],
        metricGroups: ['minutes'],
      },
      {
        id: 'lineup',
        label: 'הרכב',
        factGroups: ['lineup'],
        metricGroups: ['lineup'],
      },
      {
        id: 'output',
        label: 'תפוקה',
        factGroups: ['output'],
        metricGroups: [],
      },
      {
        id: 'teamResultsWithPlayer',
        label: 'תוצאות עם השחקן',
        factGroups: [],
        metricGroups: ['teamResultsWithPlayer'],
      },
      {
        id: 'homeAway',
        label: 'בית / חוץ',
        factGroups: ['homeAway'],
        metricGroups: ['homeAway'],
      },
      {
        id: 'difficulty',
        label: 'קושי יריבה',
        factGroups: ['difficulty'],
        metricGroups: ['difficulty'],
      },
    ],
  },
  {
    id: 'projection',
    label: 'מה צפוי',
    groups: [
      {
        id: 'playerProjectionPlaceholder',
        label: 'תחזית שחקן',
        factGroups: [],
        metricGroups: [],
      },
    ],
  },
]
