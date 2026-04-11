// C:\projects\devplan\src\shared\abilities\engine\abilitiesHistory.constants.js

// קובץ מקביל: functions/src/domain/abilities/engine/abilitiesHistory.constants.js
// הערה: בכל שינוי בקובץ זה יש לבדוק ולעדכן גם את הקובץ המקביל בצד Functions.

export const WINDOW_DAYS = 56 // 8 weeks
export const ABILITY_SCORE_MIN = 1
export const ABILITY_SCORE_MAX = 5

export const ABILITY_DOMAIN_WEIGHTS = {
  physical: 0.18,
  technical: 0.22,
  gameUnderstanding: 0.22,
  mental: 0.20,
  cognitive: 0.18,
}

export const POTENTIAL_DOMAIN_WEIGHTS = {
  physical: 0.24,
  technical: 0.18,
  gameUnderstanding: 0.20,
  mental: 0.18,
  cognitive: 0.20,
}

export const PHYSICAL_GROWTH_ADJUSTMENTS = {
  1: 0.5,
  2: 0.25,
  3: 0,
  4: -0.25,
  5: -0.5,
}

export const FINAL_POTENTIAL_GROWTH_ADJUSTMENTS = {
  1: 0.2,
  2: 0.1,
  3: 0,
  4: -0.1,
  5: -0.2,
}

export const DOMAIN_RELIABILITY = {
  low: 'low',
  medium: 'medium',
  high: 'high',
}

export const OVERALL_RELIABILITY = {
  low: 'low',
  medium: 'medium',
  high: 'high',
}
