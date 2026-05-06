// shared/games/insights/team/sections/homeAway/homeAway.brief.js

import {
  buildEmptyBriefResult,
  buildReadyBriefResult,
} from '../../common/index.js'

import { buildHomeAwayEvaluation } from './homeAway.evaluation.js'
import { buildHomeAwayItems } from './homeAway.items.js'
import { buildHomeAwayMetrics } from './homeAway.metrics.js'

import {
  getBetterSide,
  getHomeAwayTone,
  hasHomeAwaySystemicRisk,
  hasStrongHomeAwayProfile,
} from './homeAway.rules.js'

const BRIEF_ID = 'team_games_home_away_brief'
const SECTION_ID = 'homeAway'

export function buildTeamGamesHomeAwayBrief(insights = {}) {
  const metrics = buildHomeAwayMetrics(insights)
  const evaluationState = buildHomeAwayEvaluation(metrics, insights)

  const sourceLabel =
    insights?.calculation?.sourceLabel ||
    insights?.active?.sourceLabel ||
    'נתוני משחקים'

  if (!metrics.hasAnyData) {
    return buildEmptyBriefResult({
      id: BRIEF_ID,
      sectionId: SECTION_ID,
      title: 'תובנות בית / חוץ',
      subtitle: 'פילוח לפי מיקום משחק',
      sourceLabel,
      targetLabel: evaluationState.targetLabel,
      text: 'אין מספיק נתוני משחקים כדי לבנות תובנות בית / חוץ.',
      metrics: {
        home: metrics.home,
        away: metrics.away,
        gap: metrics.gap,
        absGap: metrics.absGap,
        overallRate: metrics.overallRate,
        evaluation: evaluationState.evaluation,
      },
      meta: {
        hasEnoughData: false,
        targetLevelId: evaluationState.targetLevelId,
        hasSpecificTargets: evaluationState.hasSpecificTargets,
      },
      debug: {
        section: SECTION_ID,
        reason: 'no_home_away_data',
        source: metrics.source ? 'resolved' : 'missing',
        targetProfileId: evaluationState.targetLevelId,
        hasTargetProfile: Boolean(evaluationState.targetLevelId),
      }
    })
  }

  const items = buildHomeAwayItems(metrics, evaluationState, insights.targetGap)
  const primary = items.find((item) => item.id === 'action_focus') || items[0]
  const tone = getHomeAwayTone(metrics, evaluationState)

  return buildReadyBriefResult({
    id: BRIEF_ID,
    sectionId: SECTION_ID,
    tone,
    title: 'תובנות בית / חוץ',
    subtitle: 'פילוח לפי מיקום משחק',
    sourceLabel,
    targetLabel: evaluationState.targetLabel,
    text: primary ? primary.text : '',
    items,
    metrics: {
      home: metrics.home,
      away: metrics.away,
      gap: metrics.gap,
      absGap: metrics.absGap,
      overallRate: metrics.overallRate,
      evaluation: evaluationState.evaluation,
      targets: evaluationState.targets,
    },
    meta: {
      hasHomeData: metrics.hasHomeData,
      hasAwayData: metrics.hasAwayData,
      hasEnoughData: evaluationState.hasEnoughData,
      betterSide: getBetterSide(metrics, evaluationState),
      targetLevelId: evaluationState.targetLevelId,
      targetLabel: evaluationState.targetLabel,
      hasSpecificTargets: evaluationState.hasSpecificTargets,
      hasSystemicRisk: hasHomeAwaySystemicRisk(evaluationState),
      hasStrongProfile: hasStrongHomeAwayProfile(evaluationState),
      targetGapRelation: insights.targetGap?.relation || 'unknown',
    },
    debug: {
      section: SECTION_ID,
      source: metrics.source ? 'resolved' : 'missing',
      targetProfileId: evaluationState.targetLevelId,
      hasTargetProfile: Boolean(evaluationState.targetLevelId),
      targetGap: {
        relation: insights.targetGap?.relation || 'unknown',
        targetProfileId: insights.targetGap?.targetProfileId || null,
        forecastProfileId: insights.targetGap?.forecastProfileId || null,
      },
      selectedText: primary?.id || null,
      evaluationStatuses: {
        overall: evaluationState.evaluation.overall?.status || null,
        home: evaluationState.evaluation.home?.status || null,
        away: evaluationState.evaluation.away?.status || null,
        gap: evaluationState.evaluation.gap?.status || null,
      },
    }
  })
}
