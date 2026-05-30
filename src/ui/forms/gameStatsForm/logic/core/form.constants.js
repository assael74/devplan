// src/ui/forms/gameStatsForm/logic/core/form.constants.js

export const EXCLUDED_FORM_PARM_IDS = new Set([
  'isStarting',
  'timePlayed',
  'timeVideoStats',
  'goals',
  'assists',
  'position',
])

export const GAME_STATS_FORM_STEPS = [
  { id: 'players', label: 'שחקנים' },
  { id: 'params', label: 'פרמטרים' },
  { id: 'entry', label: 'מילוי' },
  { id: 'summary', label: 'סיכום' },
]

export const GAME_STATS_STATUS_OPTIONS = [
  { value: 'draft', label: 'טיוטה' },
  { value: 'partial', label: 'חלקי' },
  { value: 'committed', label: 'מלא' },
]

export const GAME_STATS_PRESETS = [
  {
    id: 'basic',
    label: 'בסיסי',
    types: ['general'],
    includeDefaults: true,
  },
  {
    id: 'attack',
    label: 'התקפה',
    types: ['general', 'offensive'],
    includeDefaults: true,
  },
  {
    id: 'defense',
    label: 'הגנה',
    types: ['general', 'defensive'],
    includeDefaults: true,
  },
  {
    id: 'full',
    label: 'מלא',
    types: ['general', 'offensive', 'defensive'],
    includeDefaults: true,
  },
  {
    id: 'custom',
    label: 'מותאם',
    types: [],
    includeDefaults: false,
  },
]
