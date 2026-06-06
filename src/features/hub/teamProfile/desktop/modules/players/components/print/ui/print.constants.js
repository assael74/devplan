// teamProfile/desktop/modules/players/components/print/ui/print.constants.js

export const TEAM_PLAYERS_PRINT_MODES = {
  SQUAD: 'squad',
  PERFORMANCE: 'performance',
}

export const SQUAD_PRINT_COLUMNS = [
  { key: 'index', label: '#', width: '4%' },
  { key: 'player', label: 'שחקן', width: '19%' },
  { key: 'positions', label: 'עמדות', width: '14%' },
  { key: 'role', label: 'מעמד בסגל', width: '12%' },
  { key: 'level', label: 'פוט׳', width: '16%' },
  { key: 'project', label: 'פרויקט', width: '8%' },
  { key: 'targets', label: 'יעדים', width: '24%' },
]

export const PERFORMANCE_PRINT_COLUMNS = [
  { key: 'index', label: '#', width: '4%' },
  { key: 'player', label: 'שחקן', width: '15%' },
  { key: 'positions', label: 'עמדות', width: '8%' },
  { key: 'targets', label: 'יעדים', width: '20%' },
  { key: 'performance', label: 'מודל ביצוע', width: '28%' },
  { key: 'stats', label: 'ביצוע בפועל', width: '25%' },
]

export const TARGET_PRINT_METRICS = [
  { key: 'goals', label: 'שערים', icon: 'goal', metricKey: 'goals' },
  { key: 'assists', label: 'בישולים', icon: 'assists', metricKey: 'assists' },
  { key: 'defense', label: 'ספיגה', icon: 'defense', metricKey: 'defense' },
]
