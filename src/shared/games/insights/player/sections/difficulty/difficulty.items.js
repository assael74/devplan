// shared/games/insights/player/sections/difficulty/difficulty.items.js

import {
  buildPlayerDifficultyRecommendationText,
  buildPlayerDifficultyStateText,
} from './difficulty.texts.js'

import {
  getPlayerDifficultyActionLabel,
  getPlayerDifficultyTone,
} from './difficulty.rules.js'

export function buildPlayerDifficultyItems(metrics, evaluationState) {
  const recommendationText = buildPlayerDifficultyRecommendationText(metrics, evaluationState)
  const stateText = buildPlayerDifficultyStateText(metrics, evaluationState)
  const tone = getPlayerDifficultyTone(metrics, evaluationState)

  return [
    recommendationText
      ? {
          id: 'action_focus',
          type: 'focus',
          label: getPlayerDifficultyActionLabel(metrics, evaluationState),
          tone,
          text: recommendationText,
        }
      : null,
    stateText
      ? {
          id: 'difficulty_state',
          type: 'state',
          label: 'תמונת רמת יריבה',
          tone: 'primary',
          text: stateText,
        }
      : null,
  ].filter(Boolean)
}
