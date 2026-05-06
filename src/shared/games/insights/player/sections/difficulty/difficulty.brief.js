// shared/games/insights/player/sections/difficulty/difficulty.brief.js

import {
  buildEmptyBriefResult,
  buildReadyBriefResult,
} from '../../../team/common/index.js'

import { buildPlayerDifficultyEvaluation } from './difficulty.evaluation.js'
import { buildPlayerDifficultyItems } from './difficulty.items.js'
import { buildPlayerDifficultyMetrics } from './difficulty.metrics.js'

import {
  getPlayerDifficultyCoreIssue,
  getPlayerDifficultyTone,
} from './difficulty.rules.js'

const BRIEF_ID = 'player_games_difficulty_brief'
const SECTION_ID = 'difficulty'

export function buildPlayerGamesDifficultyBrief(insights = {}) {
  const metrics = buildPlayerDifficultyMetrics(insights)
  const evaluationState = buildPlayerDifficultyEvaluation(metrics)

  const sourceLabel = 'נתוני משחקי שחקן וקבוצה'
  const targetLabel = 'רמת יריבה'

  if (!metrics.hasAnyData) {
    return buildEmptyBriefResult({
      id: BRIEF_ID,
      sectionId: SECTION_ID,
      title: 'רמת יריבה',
      subtitle: 'דקות והשפעה לפי קושי',
      sourceLabel,
      targetLabel,
      text: 'אין מספיק נתונים כדי לבנות תובנה לפי רמת יריבה.',
      metrics,
      meta: {
        hasEnoughData: false,
      },
      debug: {
        section: SECTION_ID,
        reason: 'no_player_difficulty_data',
      },
    })
  }

  const items = buildPlayerDifficultyItems(metrics, evaluationState)
  const primary = items.find((item) => item.id === 'action_focus') || items[0]
  const tone = getPlayerDifficultyTone(metrics, evaluationState)
  const coreIssue = getPlayerDifficultyCoreIssue(metrics, evaluationState)

  return buildReadyBriefResult({
    id: BRIEF_ID,
    sectionId: SECTION_ID,
    tone,
    title: 'רמת יריבה',
    subtitle: 'דקות והשפעה לפי קושי',
    sourceLabel,
    targetLabel,
    text: primary ? primary.text : '',
    items,
    metrics,
    meta: {
      hasEnoughData: evaluationState.hasEnoughData,
      hasFullProfile: metrics.hasFullProfile,
      coreIssue,
    },
    debug: {
      section: SECTION_ID,
      selectedText: primary?.id || null,
      coreIssue,
    },
  })
}
