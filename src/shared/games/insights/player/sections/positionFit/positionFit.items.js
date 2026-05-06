// shared/games/insights/player/sections/positionFit/positionFit.items.js

import {
  buildPositionFitRecommendationText,
  buildPositionFitStateText,
} from './positionFit.texts.js'

import {
  getPositionFitActionLabel,
  getPositionFitTone,
} from './positionFit.rules.js'

export function buildPlayerPositionFitItems(metrics, evaluationState) {
  const recommendationText = buildPositionFitRecommendationText(metrics, evaluationState)
  const stateText = buildPositionFitStateText(metrics)
  const tone = getPositionFitTone(metrics, evaluationState)

  return [
    recommendationText
      ? {
          id: 'action_focus',
          type: 'focus',
          label: getPositionFitActionLabel(metrics, evaluationState),
          tone,
          text: recommendationText,
        }
      : null,
    stateText
      ? {
          id: 'position_fit_state',
          type: 'state',
          label: 'תמונת עמדה',
          tone: 'primary',
          text: stateText,
        }
      : null,
  ].filter(Boolean)
}
