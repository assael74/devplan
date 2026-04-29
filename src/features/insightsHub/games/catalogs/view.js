// features/insightsHub/games/catalogs/view.js

export const TEAM_GAMES_VIEW_CONTEXTS = [
  {
    id: 'current',
    idIcon: 'current',
    idColor: 'success',
    label: 'מה היה עד עכשיו',
    groups: [
      {
        id: 'results',
        label: 'תוצאות',
        factGroups: ['games', 'results'],
        metricGroups: ['performance', 'results'],
        benchmarkIds: [
          'team_games_benchmark_points_rate_by_table_level',
        ],
        excludeFacts: [
          'team_games_upcoming_games',
          'team_games_next_game',
        ],
      },
      {
        id: 'goals',
        label: 'שערים',
        factGroups: ['goals'],
        metricGroups: ['goals'],
        benchmarkIds: [
          'team_games_benchmark_goal_difference_by_table_level',
          'team_games_benchmark_goals_for_by_table_level',
          'team_games_benchmark_goals_against_by_table_level',
        ],
      },
      {
        id: 'homeAway',
        label: 'בית / חוץ',
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
        factGroups: ['difficulty'],
        metricGroups: ['difficulty'],
        excludeFacts: [
          'team_games_remaining_games_by_difficulty',
        ],
        excludeMetrics: [
          'team_games_remaining_difficulty_profile',
        ],
      },
      {
        id: 'players',
        label: 'שחקנים',
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
        id: 'remainingGames',
        label: 'נקודות צפויות',
        factIds: [
          'team_games_upcoming_games',
          'team_games_next_game',
        ],
        metricIds: [
          'team_games_projected_total_points',
        ],
        benchmarkIds: [
          'team_games_benchmark_final_points_by_table_level',
        ],
      },
      {
        id: 'homeAwayProjection',
        label: 'בית / חוץ',
        factIds: [
          'team_games_remaining_home_games',
          'team_games_remaining_away_games',
        ],
        metricIds: [
          'team_games_remaining_home_games_count',
          'team_games_remaining_away_games_count',
          'team_games_projected_home_points',
          'team_games_projected_away_points',
        ],
      },
      {
        id: 'difficultyProjection',
        label: 'קושי יריבה',
        factIds: [
          'team_games_remaining_games_by_difficulty',
        ],
        metricIds: [
          'team_games_remaining_difficulty_profile',
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
