// src/shared/players/targets/playerTargets.confidence.js

export const CONFIDENCE_LEVELS = {
  xFactor: {
    value: 'xFactor',
    label: 'שובר שוויון',
    shortLabel: '120%',
    multiplier: 1.2,
    color: 'warning',
  },
  banker: {
    value: 'banker',
    label: 'באנקר',
    shortLabel: '100%',
    multiplier: 1,
    color: 'success',
  },
  stable: {
    value: 'stable',
    label: 'יציב',
    shortLabel: '70%',
    multiplier: 0.7,
    color: 'primary',
  },
  question: {
    value: 'question',
    label: 'סימן שאלה',
    shortLabel: '40%',
    multiplier: 0.4,
    color: 'warning',
  },
  bet: {
    value: 'bet',
    label: 'הימור',
    shortLabel: '10%',
    multiplier: 0.1,
    color: 'danger',
  },
}

export const CONFIDENCE_LEVEL_OPTIONS = [
  CONFIDENCE_LEVELS.xFactor,
  CONFIDENCE_LEVELS.banker,
  CONFIDENCE_LEVELS.stable,
  CONFIDENCE_LEVELS.question,
  CONFIDENCE_LEVELS.bet,
]

export const DEFAULT_CONFIDENCE_MULTIPLIER = 1

const clean = value => value == null ? '' : String(value).trim()

export const resolveConfidenceLevel = confidenceLevel => {
  const id = clean(confidenceLevel)
  return CONFIDENCE_LEVELS[id] || null
}

export const getConfidenceMultiplier = confidenceLevel => {
  const level = resolveConfidenceLevel(confidenceLevel)
  const multiplier = Number(level?.multiplier)

  return Number.isFinite(multiplier) ? multiplier : DEFAULT_CONFIDENCE_MULTIPLIER
}

export const getConfidenceLabel = confidenceLevel => {
  return resolveConfidenceLevel(confidenceLevel)?.label || 'לא דורג'
}
