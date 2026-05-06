// shared/games/insights/player/sections/usage/usage.items.js

import {
  buildUsageRecommendationText,
  buildUsageReliabilityText,
  buildUsageStateText,
} from './usage.texts.js'

import {
  getUsageActionLabel,
  getUsageTone,
} from './usage.rules.js'

export function buildPlayerUsageItems(metrics, evaluationState) {
  const recommendationText = buildUsageRecommendationText(metrics, evaluationState)
  const stateText = buildUsageStateText(metrics, evaluationState)
  const reliabilityText = buildUsageReliabilityText(metrics)

  const tone = getUsageTone(metrics, evaluationState)

  return [
    recommendationText
      ? {
          id: 'action_focus',
          type: 'focus',
          label: getUsageActionLabel(metrics, evaluationState),
          tone,
          text: recommendationText,
        }
      : null,
    stateText
      ? {
          id: 'usage_state',
          type: 'state',
          label: 'תמונת שימוש',
          tone: 'primary',
          text: stateText,
        }
      : null,
    reliabilityText
      ? {
          id: 'reliability',
          type: 'reliability',
          label: 'אמינות המדד',
          tone: 'neutral',
          text: reliabilityText,
        }
      : null,
  ].filter(Boolean)
}
