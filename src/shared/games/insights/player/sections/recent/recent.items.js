// shared/games/insights/player/sections/recent/recent.items.js

import {
  buildRecentRecommendationText,
  buildRecentStateText,
} from './recent.texts.js'

import {
  getRecentActionLabel,
  getRecentTone,
} from './recent.rules.js'

export function buildPlayerRecentItems(metrics, evaluationState) {
  const recommendationText = buildRecentRecommendationText(metrics, evaluationState)
  const stateText = buildRecentStateText(metrics)
  const tone = getRecentTone(metrics, evaluationState)

  return [
    recommendationText
      ? {
          id: 'action_focus',
          type: 'focus',
          label: getRecentActionLabel(metrics, evaluationState),
          tone,
          text: recommendationText,
        }
      : null,
    stateText
      ? {
          id: 'recent_state',
          type: 'state',
          label: 'תמונת מגמה',
          tone: 'primary',
          text: stateText,
        }
      : null,
  ].filter(Boolean)
}
