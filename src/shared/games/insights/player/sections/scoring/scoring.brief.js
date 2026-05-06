// shared/games/insights/player/sections/scoring/scoring.brief.js

import {
  buildEmptyBriefResult,
  buildReadyBriefResult,
} from '../../../team/common/index.js'

import { buildPlayerScoringEvaluation } from './scoring.evaluation.js'
import { buildPlayerScoringItems } from './scoring.items.js'
import { buildPlayerScoringMetrics } from './scoring.metrics.js'

import {
  getScoringCoreIssue,
  getScoringTone,
} from './scoring.rules.js'

const BRIEF_ID = 'player_games_scoring_brief'
const SECTION_ID = 'scoring'

export function buildPlayerGamesScoringBrief(insights = {}) {
  const metrics = buildPlayerScoringMetrics(insights)
  const evaluationState = buildPlayerScoringEvaluation(metrics)

  const sourceLabel =
    insights?.games?.sourceLabel ||
    insights?.sourceLabel ||
    'נתוני משחקי שחקן'

  const targetLabel = metrics.position?.layerLabel || 'עמדה לא הוגדרה'

  if (!metrics.hasAnyData) {
    return buildEmptyBriefResult({
      id: BRIEF_ID,
      sectionId: SECTION_ID,
      title: 'תובנות תפוקה',
      subtitle: 'שערים, בישולים ומעורבות',
      sourceLabel,
      targetLabel,
      text: 'אין מספיק נתונים כדי לבנות תובנת תפוקה לשחקן.',
      metrics,
      meta: {
        hasEnoughData: false,
        hasPosition: metrics.hasPosition,
      },
      debug: {
        section: SECTION_ID,
        reason: 'no_scoring_data',
      },
    })
  }

  const items = buildPlayerScoringItems(metrics, evaluationState)
  const primary = items.find((item) => item.id === 'action_focus') || items[0]
  const tone = getScoringTone(metrics, evaluationState)
  const coreIssue = getScoringCoreIssue(metrics, evaluationState)

  return buildReadyBriefResult({
    id: BRIEF_ID,
    sectionId: SECTION_ID,
    tone,
    title: 'תובנות תפוקה',
    subtitle: 'שערים, בישולים ומעורבות',
    sourceLabel,
    targetLabel,
    text: primary ? primary.text : '',
    items,
    metrics,
    meta: {
      hasEnoughData: evaluationState.hasEnoughData,
      hasPosition: metrics.hasPosition,
      hasPositionTarget: metrics.hasPositionTarget,
      coreIssue,
    },
    debug: {
      section: SECTION_ID,
      selectedText: primary?.id || null,
      coreIssue,
      evaluation: {
        contribution: evaluationState.contribution?.status || null,
        goals: evaluationState.goals?.status || null,
        assists: evaluationState.assists?.status || null,
        share: evaluationState.share?.status || null,
        manualTarget: evaluationState.manualTarget?.status || null,
      },
    },
  })
}
