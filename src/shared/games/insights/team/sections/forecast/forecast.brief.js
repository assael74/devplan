// shared/games/insights/team/sections/forecast/forecast.brief.js

import {
  buildEmptyBriefResult,
  buildReadyBriefResult,
} from '../../common/index.js'

import { buildForecastEvaluation } from './forecast.evaluation.js'
import { buildForecastItems } from './forecast.items.js'
import { buildForecastMetrics } from './forecast.metrics.js'

import {
  getForecastOverallTone,
  hasForecastRisk,
} from './forecast.rules.js'

import { buildForecastActionFocusText } from './forecast.texts.js'

const BRIEF_ID = 'team_games_forecast_brief'
const SECTION_ID = 'forecast'

export function buildTeamGamesForecastBrief(insights = {}) {
  const metrics = buildForecastMetrics(insights)
  const evaluationState = buildForecastEvaluation(metrics, insights)

  const sourceLabel =
    metrics.calculation?.sourceLabel ||
    metrics.active?.sourceLabel ||
    'נתונים קיימים'

  if (!metrics.isReady) {
    return buildEmptyBriefResult({
      id: BRIEF_ID,
      sectionId: SECTION_ID,
      title: 'תובנות ראשוניות',
      subtitle: 'תחזית כללית',
      sourceLabel,
      targetLabel: evaluationState.targetLabel,
      text: 'אין מספיק נתונים כדי לבנות תובנה ראשונית לתחזית הקבוצה.',
      metrics: {},
      meta: {
        targetLevelId: evaluationState.targetLevelId,
        hasTargets: evaluationState.hasTargets,
      },
      debug: {
        section: SECTION_ID,
        reason: 'forecast_not_ready',
        source: metrics.calculation?.source || metrics.active?.source || null,
        targetProfileId: evaluationState.targetLevelId,
        hasTargetProfile: Boolean(evaluationState.targetLevelId),
      },
    })
  }

  const items = buildForecastItems(evaluationState, insights.targetGap)
  const comparisons = evaluationState.comparisons
  const actionFocusText = buildForecastActionFocusText(comparisons)
  const forecastStateItem = items.find((item) => item.id === 'forecast_state')

  return buildReadyBriefResult({
    id: BRIEF_ID,
    sectionId: SECTION_ID,
    tone: getForecastOverallTone(comparisons, insights.targetGap),
    title: 'תובנות ראשוניות',
    subtitle: 'תחזית כללית',
    sourceLabel,
    targetLabel: evaluationState.targetLabel,
    text: actionFocusText || forecastStateItem?.text || '',
    items,
    metrics: {
      projectedTotalPoints: metrics.projectedTotalPoints,
      projectedGoalsFor: metrics.projectedGoalsFor,
      projectedGoalsAgainst: metrics.projectedGoalsAgainst,
      pointsRate: metrics.pointsRate,
      goalDifference: metrics.goalDifference,
      targets: evaluationState.targets,
      targetGap: insights.targetGap,
      comparisons,
    },
    meta: {
      calculationMode: metrics.calculation?.mode,
      source: metrics.calculation?.source || metrics.active?.source,
      targetLevelId: evaluationState.targetLevelId,
      benchmarkLevelId: evaluationState.targetLevelId,
      targetGapRelation: insights.targetGap?.relation || 'unknown',
      isAboveTarget: insights.targetGap?.isAboveTarget === true,
      isOnTarget: insights.targetGap?.isOnTarget === true,
      isBelowTarget: insights.targetGap?.isBelowTarget === true,

      forecastLevelId:
        insights?.forecastProfile?.id ||
        insights?.forecastLevel?.id ||
        null,

      hasActionRisk: hasForecastRisk(comparisons),
      hasTargets: evaluationState.hasTargets,

      pointsAchievementPct: comparisons.points?.ratio ?? null,
      goalsForAchievementPct: comparisons.goalsFor?.ratio ?? null,
      goalsAgainstAchievementPct: comparisons.goalsAgainst?.ratio ?? null,
    },
    debug: {
      section: SECTION_ID,
      source: metrics.calculation?.source || metrics.active?.source || null,
      targetProfileId: evaluationState.targetLevelId,
      hasTargetProfile: Boolean(evaluationState.targetLevelId),
      targetGap: {
        relation: insights.targetGap?.relation || 'unknown',
        targetProfileId: insights.targetGap?.targetProfileId || null,
        forecastProfileId: insights.targetGap?.forecastProfileId || null,
      },
      forecastProfileId:
        insights?.forecastProfile?.id ||
        insights?.forecastLevel?.id ||
        null,
      selectedText:
        actionFocusText ? 'action_focus' : forecastStateItem?.id || null,
      comparisonStatuses: {
        points: comparisons.points?.status || null,
        goalsFor: comparisons.goalsFor?.status || null,
        goalsAgainst: comparisons.goalsAgainst?.status || null,
      },
    },
  })
}
