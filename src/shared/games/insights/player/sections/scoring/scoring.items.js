// shared/games/insights/player/sections/scoring/scoring.items.js

import {
  buildScoringRecommendationText,
  buildScoringStateText,
} from './scoring.texts.js'

import {
  getScoringActionLabel,
  getScoringTone,
} from './scoring.rules.js'

export function buildPlayerScoringItems(metrics, evaluationState) {
  const recommendationText = buildScoringRecommendationText(metrics, evaluationState)
  const stateText = buildScoringStateText(metrics)
  const tone = getScoringTone(metrics, evaluationState)

  return [
    recommendationText
      ? {
          id: 'action_focus',
          type: 'focus',
          label: getScoringActionLabel(metrics, evaluationState),
          tone,
          text: recommendationText,
        }
      : null,
    stateText
      ? {
          id: 'scoring_state',
          type: 'state',
          label: 'תמונת תפוקה',
          tone: 'primary',
          text: stateText,
        }
      : null,
  ].filter(Boolean)
}
