// shared/games/insights/team/sections/forecast/forecast.items.js

import {
  buildForecastActionFocusText,
  buildForecastAdvantageText,
  buildForecastStateText,
  buildForecastTargetGapText,
} from './forecast.texts.js'

import {
  getForecastActionLabel,
  hasForecastRisk,
} from './forecast.rules.js'

export function buildForecastItems(evaluationState, targetGap) {
  const comparisons = evaluationState.comparisons

  const forecastStateText = buildForecastStateText(comparisons)
  const advantageText = buildForecastAdvantageText(comparisons)
  const actionFocusText = buildForecastActionFocusText(comparisons)
  const targetGapText = buildForecastTargetGapText(targetGap)
  const hasActionRisk = hasForecastRisk(comparisons)

  return [
    actionFocusText
      ? {
          id: 'action_focus',
          type: 'focus',
          label: getForecastActionLabel(comparisons),
          tone: hasActionRisk ? 'warning' : 'success',
          text: actionFocusText,
        }
      : null,
    {
      id: 'forecast_state',
      type: 'state',
      label: 'מצב התחזית',
      tone: comparisons.points?.isRisk ? 'warning' : 'primary',
      text: forecastStateText,
    },
    targetGapText
      ? {
          id: 'target_gap',
          type: 'targetGap',
          label: 'פער מול יעד',
          tone: targetGap?.isBelowTarget
            ? 'warning'
            : targetGap?.isAboveTarget
              ? 'success'
              : 'primary',
          text: targetGapText,
        }
      : null,
    advantageText
      ? {
          id: 'advantage',
          type: 'advantage',
          label: 'יתרון',
          tone: 'success',
          text: advantageText,
        }
      : null,
  ].filter(Boolean)
}
