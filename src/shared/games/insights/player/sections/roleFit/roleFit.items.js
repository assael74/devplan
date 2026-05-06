// shared/games/insights/player/sections/roleFit/roleFit.items.js

import {
  buildRoleFitRecommendationText,
  buildRoleFitStateText,
} from './roleFit.texts.js'

import {
  getRoleFitActionLabel,
  getRoleFitTone,
} from './roleFit.rules.js'

export function buildPlayerRoleFitItems(metrics, evaluationState) {
  const recommendationText = buildRoleFitRecommendationText(metrics, evaluationState)
  const stateText = buildRoleFitStateText(metrics)
  const tone = getRoleFitTone(metrics, evaluationState)

  return [
    recommendationText
      ? {
          id: 'action_focus',
          type: 'focus',
          label: getRoleFitActionLabel(metrics, evaluationState),
          tone,
          text: recommendationText,
        }
      : null,
    stateText
      ? {
          id: 'role_fit_state',
          type: 'state',
          label: 'תמונת מעמד',
          tone: 'primary',
          text: stateText,
        }
      : null,
  ].filter(Boolean)
}
