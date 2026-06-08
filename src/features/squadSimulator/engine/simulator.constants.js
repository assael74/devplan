// src/features/squadSimulator/engine/simulator.constants.js

export const SQUAD_TARGET_SIMULATOR_SOURCE = 'squadTargetSimulator'

export const TARGET_PROFILE_ALIASES = {
  top: 'top',
  'טופ': 'top',
  'צמרת': 'top',

  midTop: 'midTop',
  midHigh: 'midTop',
  'מיד-טופ': 'midTop',
  'אמצע עליון': 'midTop',
  'חצי עליון': 'midTop',

  midLow: 'midLow',
  'מיד-מתחת': 'midLow',
  'אמצע תחתון': 'midLow',
  'מרכז-תחתון': 'midLow',

  bottom: 'bottom',
  'תחתית': 'bottom',
}

export const SQUAD_ROLE_ALIASES = {
  key: 'key',
  starter: 'key',
  'מפתח': 'key',
  'שחקן מפתח': 'key',

  core: 'core',
  main: 'core',
  central: 'core',
  'מרכזי': 'core',
  'שחקן מרכזי': 'core',

  rotation: 'rotation',
  rotate: 'rotation',
  'רוטציה': 'rotation',

  fringe: 'fringe',
  depth: 'fringe',
  last: 'fringe',
  'אחרון בסגל': 'fringe',
}

export const SQUAD_TARGET_GOAL_TIER_ORDER = [
  'scorer',
  'doubleDigitScorer',
  'supportScorer',
  'occasionalScorer',
  'none',
]

export const SQUAD_TARGET_GOAL_TIER_EXCEL_LABELS = {
  scorer: '15+',
  doubleDigitScorer: '10-14',
  supportScorer: '5-9',
  occasionalScorer: '1-4',
  none: '0',
}

export const SQUAD_TARGET_STATUS_LABELS = {
  above: 'חריגה',
  below: 'חסר',
  ok: 'תקין',
  missing: 'חסר נתונים',
}
