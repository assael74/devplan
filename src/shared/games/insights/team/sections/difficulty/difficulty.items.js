// shared/games/insights/team/sections/difficulty/difficulty.items.js

import {
  buildDifficultyAdvantageText,
  buildDifficultyRecommendationText,
  buildDifficultyReliabilityText,
  buildDifficultyRiskText,
  buildDifficultyStateText,
} from './difficulty.texts.js'

import {
  getDifficultyActionLabel,
  getDifficultyTone,
} from './difficulty.rules.js'

export function buildDifficultyItems(metrics, evaluationState, targetGap) {
  const recommendationText = buildDifficultyRecommendationText(
    metrics,
    evaluationState
  )

  const stateText = buildDifficultyStateText(metrics, evaluationState)
  const advantageText = buildDifficultyAdvantageText(evaluationState)
  const riskText = buildDifficultyRiskText(metrics, evaluationState)
  const reliabilityText = buildDifficultyReliabilityText(evaluationState)
  const actionTone = getDifficultyTone(metrics, evaluationState)

  return [
    recommendationText
      ? {
          id: 'action_focus',
          type: 'focus',
          label: getDifficultyActionLabel(metrics, evaluationState),
          tone: actionTone,
          text: recommendationText,
        }
      : null,
    {
      id: 'difficulty_state',
      type: 'state',
      label: 'תמונת מצב',
      tone: 'primary',
      text: stateText,
    },
    advantageText
      ? {
          id: 'advantage',
          type: 'advantage',
          label: 'יתרון',
          tone: 'success',
          text: advantageText,
        }
      : null,
    riskText
      ? {
          id: 'risk',
          type: 'risk',
          label: 'פער מרכזי',
          tone: 'warning',
          text: riskText,
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
