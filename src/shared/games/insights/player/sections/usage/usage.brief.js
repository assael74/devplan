// shared/games/insights/player/sections/usage/usage.brief.js

import {
  buildEmptyBriefResult,
  buildReadyBriefResult,
} from '../../../team/common/index.js'

import { buildPlayerUsageEvaluation } from './usage.evaluation.js'
import { buildPlayerUsageItems } from './usage.items.js'
import { buildPlayerUsageMetrics } from './usage.metrics.js'

import {
  getUsageCoreIssue,
  getUsageTone,
} from './usage.rules.js'

const BRIEF_ID = 'player_games_usage_brief'
const SECTION_ID = 'usage'

export function buildPlayerGamesUsageBrief(insights = {}) {
  const metrics = buildPlayerUsageMetrics(insights)
  const evaluationState = buildPlayerUsageEvaluation(metrics)

  const sourceLabel =
    insights?.games?.sourceLabel ||
    insights?.sourceLabel ||
    'נתוני משחקי שחקן'

  const targetLabel = metrics.role?.label || 'מעמד לא הוגדר'

  if (!metrics.hasAnyData) {
    return buildEmptyBriefResult({
      id: BRIEF_ID,
      sectionId: SECTION_ID,
      title: 'תובנות שימוש',
      subtitle: 'דקות, משחקים והרכב',
      sourceLabel,
      targetLabel,
      text: 'אין מספיק נתוני משחקים כדי לבנות תובנת שימוש לשחקן.',
      metrics,
      meta: {
        hasEnoughData: false,
        hasRole: metrics.hasRole,
        hasRoleTarget: metrics.hasRoleTarget,
      },
      debug: {
        section: SECTION_ID,
        reason: 'no_usage_data',
      },
    })
  }

  const items = buildPlayerUsageItems(metrics, evaluationState)
  const primary = items.find((item) => item.id === 'action_focus') || items[0]
  const tone = getUsageTone(metrics, evaluationState)
  const coreIssue = getUsageCoreIssue(metrics, evaluationState)

  return buildReadyBriefResult({
    id: BRIEF_ID,
    sectionId: SECTION_ID,
    tone,
    title: 'תובנות שימוש',
    subtitle: 'דקות, משחקים והרכב',
    sourceLabel,
    targetLabel,
    text: primary ? primary.text : '',
    items,
    metrics,
    meta: {
      hasEnoughData: evaluationState.hasEnoughData,
      hasRole: metrics.hasRole,
      hasRoleTarget: metrics.hasRoleTarget,
      coreIssue,
    },
    debug: {
      section: SECTION_ID,
      selectedText: primary?.id || null,
      coreIssue,
      evaluation: {
        minutes: evaluationState.minutes?.status || null,
        starts: evaluationState.starts?.status || null,
      },
    },
  })
}
