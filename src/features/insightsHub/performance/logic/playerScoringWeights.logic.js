// features/insightsHub/performance/logic/playerScoringWeights.logic.js

import {
  PLAYER_SCORING_WEIGHTS,
  PLAYER_SCORING_POSITION_WEIGHTS,
} from '../../../../shared/players/scoring/scoring.config.js'

import {
  emptyText,
  pctValue,
  roundText,
} from './performanceModel.format.js'

const baseRating = 6

const scoringLabels = {
  personal: 'תרומה אישית',
  teamImpact: 'השפעה קבוצתית',
  targetPace: 'קצב עמידה ביעד',
  coach: 'חוות דעת מאמן',
}

const positionLabels = {
  goalkeeper: 'שוער',
  defense: 'הגנה',
  dmMid: 'קישור אחורי / מגן',
  midfield: 'קישור',
  atMidfield: 'קישור התקפי',
  attack: 'התקפה',
}

const demoDeltas = {
  personal: 0.8,
  teamImpact: 0.3,
  targetPace: 0.4,
  coach: 0.4,
}

const calcWeightedValue = ({ value, weight }) => {
  const n = Number(value)
  const w = Number(weight)

  if (!Number.isFinite(n) || !Number.isFinite(w)) return emptyText

  return roundText(n * w)
}

const buildComponentRows = () => {
  return Object.entries(PLAYER_SCORING_WEIGHTS).map(([id, value]) => ({
    id: `component-${id}`,
    group: 'רכיבי הציון',
    label: scoringLabels[id] || id,
    weight: pctValue(value),
    attack: emptyText,
    defense: emptyText,
  }))
}

const buildPositionRows = () => {
  return Object.entries(PLAYER_SCORING_POSITION_WEIGHTS).map(([id, value]) => ({
    id: `position-${id}`,
    group: 'התאמת עמדה',
    label: positionLabels[id] || id,
    weight: emptyText,
    attack: pctValue(value.attack),
    defense: pctValue(value.defense),
  }))
}

const calcDemoTotal = () => {
  return Object.entries(PLAYER_SCORING_WEIGHTS).reduce((sum, [id, weight]) => {
    return sum + ((demoDeltas[id] || 0) * weight)
  }, 0)
}

const buildDemoRows = () => {
  const rows = Object.entries(PLAYER_SCORING_WEIGHTS).map(([id, weight]) => {
    const value = demoDeltas[id] || 0

    return {
      id: `demo-${id}`,
      group: 'דוגמת חישוב',
      label: scoringLabels[id] || id,
      weight: pctValue(weight),
      attack: roundText(value),
      defense: calcWeightedValue({ value, weight }),
    }
  })

  const total = calcDemoTotal()

  return [
    {
      id: 'demo-base',
      group: 'דוגמת חישוב',
      label: 'ציון בסיס',
      weight: emptyText,
      attack: baseRating.toFixed(2),
      defense: emptyText,
    },
    ...rows,
    {
      id: 'demo-total-delta',
      group: 'דוגמת חישוב',
      label: 'תוספת כוללת',
      weight: emptyText,
      attack: emptyText,
      defense: roundText(total),
    },
    {
      id: 'demo-final-rating',
      group: 'דוגמת חישוב',
      label: 'ציון סופי',
      weight: emptyText,
      attack: emptyText,
      defense: (baseRating + total).toFixed(2),
    },
  ]
}

export const buildPlayerScoringWeightsBlock = (block = {}) => {
  return {
    title: block.title || 'משקלי ציון שחקן',
    subtitle: block.subtitle || '',
    columns: [
      { id: 'group', label: 'סוג' },
      { id: 'label', label: 'רכיב / עמדה' },
      { id: 'weight', label: 'משקל' },
      { id: 'attack', label: 'ערך / התקפה' },
      { id: 'defense', label: 'תרומה / הגנה' },
    ],
    rows: [
      ...buildComponentRows(),
      ...buildPositionRows(),
      ...buildDemoRows(),
    ],
  }
}
