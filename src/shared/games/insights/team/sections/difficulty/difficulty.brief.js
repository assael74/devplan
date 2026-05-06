// shared/games/insights/team/sections/difficulty/difficulty.brief.js

import {
  buildEmptyBriefResult,
  buildReadyBriefResult,
} from '../../common/index.js'

import { buildDifficultyEvaluation } from './difficulty.evaluation.js'
import { buildDifficultyItems } from './difficulty.items.js'
import { buildDifficultyMetrics } from './difficulty.metrics.js'

import {
  getDifficultyCoreIssue,
  getDifficultyTone,
} from './difficulty.rules.js'

const BRIEF_ID = 'team_games_difficulty_brief'
const SECTION_ID = 'difficulty'

export function buildTeamGamesDifficultyBrief(insights = {}) {
  const metrics = buildDifficultyMetrics(insights)
  const evaluationState = buildDifficultyEvaluation(metrics, insights)

  const sourceLabel =
    insights?.calculation?.sourceLabel ||
    insights?.active?.sourceLabel ||
    'נתוני משחקים'

  if (!metrics.hasAnyData) {
    return buildEmptyBriefResult({
      id: BRIEF_ID,
      sectionId: SECTION_ID,
      title: 'תובנות רמת יריבה',
      subtitle: 'פילוח לפי רמת קושי',
      sourceLabel,
      targetLabel: evaluationState.targetLabel,
      text: 'אין מספיק נתוני משחקים כדי לבנות תובנות לפי רמת יריבה.',
      metrics: {
        easy: evaluationState.easy,
        equal: evaluationState.equal,
        hard: evaluationState.hard,
        gap: metrics.gap,
        targets: evaluationState.targets,
      },
      meta: {
        hasEnoughData: false,
        targetLevelId: evaluationState.targetLevelId,
        hasSpecificTargets: evaluationState.hasSpecificTargets,
      },
      debug: {
        section: SECTION_ID,
        reason: 'no_difficulty_data',
        source: metrics.source ? 'resolved' : 'missing',
        targetProfileId: evaluationState.targetLevelId,
        hasTargetProfile: Boolean(evaluationState.targetLevelId),
      },
    })
  }

  const items = buildDifficultyItems(metrics, evaluationState, insights.targetGap)
  const primary = items.find((item) => item.id === 'action_focus') || items[0]
  const tone = getDifficultyTone(metrics, evaluationState)
  const coreIssue = getDifficultyCoreIssue(metrics, evaluationState)

  return buildReadyBriefResult({
    id: BRIEF_ID,
    sectionId: SECTION_ID,
    tone,
    title: 'תובנות רמת יריבה',
    subtitle: 'פילוח לפי רמת קושי',
    sourceLabel,
    targetLabel: evaluationState.targetLabel,
    text: primary ? primary.text : '',
    items,
    metrics: {
      easy: evaluationState.easy,
      equal: evaluationState.equal,
      hard: evaluationState.hard,
      buckets: evaluationState.buckets,
      gap: metrics.gap,
      absGap: metrics.absGap,
      targets: evaluationState.targets,
    },
    meta: {
      hasEasyData: metrics.hasEasyData,
      hasEqualData: metrics.hasEqualData,
      hasHardData: metrics.hasHardData,
      hasEnoughData: evaluationState.hasEnoughData,
      hasFullProfile: evaluationState.hasFullProfile,
      targetGapRelation: insights.targetGap?.relation || 'unknown',
      bestSide: metrics.best ? metrics.best.id : null,
      weakSide: metrics.worst ? metrics.worst.id : null,
      strongestPositiveSide: evaluationState.strongestPositive
        ? evaluationState.strongestPositive.id
        : null,
      strongestNegativeSide: evaluationState.strongestNegative
        ? evaluationState.strongestNegative.id
        : null,
      coreIssue,
      targetLevelId: evaluationState.targetLevelId,
      targetLabel: evaluationState.targetLabel,
      hasSpecificTargets: evaluationState.hasSpecificTargets,
    },
    debug: {
      section: SECTION_ID,
      source: metrics.source ? 'resolved' : 'missing',
      targetProfileId: evaluationState.targetLevelId,
      hasTargetProfile: Boolean(evaluationState.targetLevelId),
      selectedText: primary?.id || null,
      targetGap: {
        relation: insights.targetGap?.relation || 'unknown',
        targetProfileId: insights.targetGap?.targetProfileId || null,
        forecastProfileId: insights.targetGap?.forecastProfileId || null,
      },
      coreIssue,
      reliability: {
        easy: evaluationState.easy?.evaluation?.reliability?.id || null,
        equal: evaluationState.equal?.evaluation?.reliability?.id || null,
        hard: evaluationState.hard?.evaluation?.reliability?.id || null,
      },
      evaluationStatuses: {
        easy: evaluationState.easy?.evaluation?.status || null,
        equal: evaluationState.equal?.evaluation?.status || null,
        hard: evaluationState.hard?.evaluation?.status || null,
      },
    },
  })
}
