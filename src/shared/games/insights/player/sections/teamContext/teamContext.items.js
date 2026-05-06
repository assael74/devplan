// shared/games/insights/player/sections/teamContext/teamContext.items.js

import {
  buildTeamContextRecommendationText,
  buildTeamContextReliabilityText,
  buildTeamContextStateText,
} from './teamContext.texts.js'

import {
  getTeamContextActionLabel,
  getTeamContextTone,
} from './teamContext.rules.js'

export function buildPlayerTeamContextItems(metrics, evaluationState) {
  const recommendationText = buildTeamContextRecommendationText(metrics, evaluationState)
  const stateText = buildTeamContextStateText(metrics)
  const reliabilityText = buildTeamContextReliabilityText(metrics)
  const tone = getTeamContextTone(metrics, evaluationState)

  return [
    recommendationText
      ? {
          id: 'action_focus',
          type: 'focus',
          label: getTeamContextActionLabel(metrics, evaluationState),
          tone,
          text: recommendationText,
        }
      : null,
    stateText
      ? {
          id: 'team_context_state',
          type: 'state',
          label: 'תמונת השפעה',
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
