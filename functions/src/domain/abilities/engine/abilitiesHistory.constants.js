// functions\src\domain\abilities\engine\abilitiesHistory.constants.js

// קובץ מקביל: src/shared/abilities/engine/abilitiesHistory.constants.js
// הערה: בכל שינוי בקובץ זה יש לבדוק ולעדכן גם את הקובץ המקביל בצד ה־src.

const WINDOW_DAYS = 56
const ABILITY_SCORE_MIN = 1
const ABILITY_SCORE_MAX = 5

const ABILITY_DOMAIN_WEIGHTS = {
  physical: 0.18,
  technical: 0.22,
  gameUnderstanding: 0.22,
  mental: 0.20,
  cognitive: 0.18,
}

const POTENTIAL_DOMAIN_WEIGHTS = {
  physical: 0.24,
  technical: 0.18,
  gameUnderstanding: 0.20,
  mental: 0.18,
  cognitive: 0.20,
}

const PHYSICAL_GROWTH_ADJUSTMENTS = {
  1: 0.5,
  2: 0.25,
  3: 0,
  4: -0.25,
  5: -0.5,
}

const FINAL_POTENTIAL_GROWTH_ADJUSTMENTS = {
  1: 0.2,
  2: 0.1,
  3: 0,
  4: -0.1,
  5: -0.2,
}

const DOMAIN_RELIABILITY = {
  low: 'low',
  medium: 'medium',
  high: 'high',
}

const OVERALL_RELIABILITY = {
  low: 'low',
  medium: 'medium',
  high: 'high',
}

module.exports = {
  WINDOW_DAYS,
  ABILITY_SCORE_MIN,
  ABILITY_SCORE_MAX,
  ABILITY_DOMAIN_WEIGHTS,
  POTENTIAL_DOMAIN_WEIGHTS,
  PHYSICAL_GROWTH_ADJUSTMENTS,
  FINAL_POTENTIAL_GROWTH_ADJUSTMENTS,
  DOMAIN_RELIABILITY,
  OVERALL_RELIABILITY,
}
