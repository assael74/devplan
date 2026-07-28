// src/features/reports/performance/performance.constants.js

export const TEAM_PLAYERS_PRINT_MODES = {
  SEASON_PLAN: 'seasonPlan',
  MINUTES_PLAN: 'minutesPlan',
  PERFORMANCE: 'performance',
}

export const PERFORMANCE_PRINT_COLUMNS = [
  { key: 'index', label: '#', width: '4%' },
  { key: 'player', label: 'שחקן', width: '18%' },
  { key: 'position', label: 'עמדה', width: '10%' },
  { key: 'targets', label: 'יעדים', width: '21%' },
  { key: 'performance', label: 'פרופיל ביצוע', width: '27%' },
  { key: 'stats', label: 'ביצוע בפועל', width: '20%' },
]

export const TARGET_PRINT_METRICS = [
  { key: 'goals', icon: 'goal', metricKey: 'goals' },
  { key: 'assists', icon: 'assists', metricKey: 'assists' },
  { key: 'defense', icon: 'defense', metricKey: 'defense' },
]
