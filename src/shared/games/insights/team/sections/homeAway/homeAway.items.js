// shared/games/insights/team/sections/homeAway/homeAway.items.js

import {
  buildHomeAwayAdvantageText,
  buildHomeAwayRecommendationText,
  buildHomeAwayRiskText,
  buildHomeAwayStateText,
} from './homeAway.texts.js'

import {
  getHomeAwayActionLabel,
  getHomeAwayTone,
} from './homeAway.rules.js'

export function buildHomeAwayItems(metrics, evaluationState, targetGap) {
  const recommendationText = buildHomeAwayRecommendationText(
    metrics,
    evaluationState
  )

  const stateText = buildHomeAwayStateText(metrics)

  const advantageText = buildHomeAwayAdvantageText(metrics, evaluationState)
  const riskText = buildHomeAwayRiskText(metrics, evaluationState)

  const actionTone = getHomeAwayTone(metrics, evaluationState)

  return [
    recommendationText
      ? {
          id: 'action_focus',
          type: 'focus',
          label: getHomeAwayActionLabel(metrics, evaluationState),
          tone: actionTone,
          text: recommendationText,
        }
      : null,
    {
      id: 'home_away_state',
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
  ].filter(Boolean)
}
