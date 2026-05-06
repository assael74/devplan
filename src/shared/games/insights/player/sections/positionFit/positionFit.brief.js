// shared/games/insights/player/sections/positionFit/positionFit.brief.js

import {
  buildEmptyBriefResult,
  buildReadyBriefResult,
} from '../../../team/common/index.js'

import { buildPlayerPositionFitEvaluation } from './positionFit.evaluation.js'
import { buildPlayerPositionFitItems } from './positionFit.items.js'
import { buildPlayerPositionFitMetrics } from './positionFit.metrics.js'

import {
  getPositionFitCoreIssue,
  getPositionFitTone,
} from './positionFit.rules.js'

const BRIEF_ID = 'player_games_position_fit_brief'
const SECTION_ID = 'positionFit'

export function buildPlayerGamesPositionFitBrief(insights = {}) {
  const metrics = buildPlayerPositionFitMetrics(insights)
  const evaluationState = buildPlayerPositionFitEvaluation(metrics)

  const sourceLabel =
    insights?.games?.sourceLabel ||
    insights?.sourceLabel ||
    'נתוני משחקי שחקן'

  const targetLabel = metrics.position?.layerLabel || 'עמדה לא הוגדרה'

  if (!metrics.hasAnyData) {
    return buildEmptyBriefResult({
      id: BRIEF_ID,
      sectionId: SECTION_ID,
      title: 'התאמה לעמדה',
      subtitle: 'תפוקה לפי תפקיד',
      sourceLabel,
      targetLabel,
      text: 'אין מספיק נתונים כדי לבדוק התאמה לעמדה.',
      metrics,
      meta: {
        hasEnoughData: false,
        hasPosition: metrics.hasPosition,
      },
      debug: {
        section: SECTION_ID,
        reason: 'no_position_fit_data',
      },
    })
  }

  const items = buildPlayerPositionFitItems(metrics, evaluationState)
  const primary = items.find((item) => item.id === 'action_focus') || items[0]
  const tone = getPositionFitTone(metrics, evaluationState)
  const coreIssue = getPositionFitCoreIssue(metrics, evaluationState)

  return buildReadyBriefResult({
    id: BRIEF_ID,
    sectionId: SECTION_ID,
    tone,
    title: 'התאמה לעמדה',
    subtitle: 'תפוקה לפי תפקיד',
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
        attack: evaluationState.attack?.status || null,
        defense: evaluationState.defense?.status || null,
        primary: evaluationState.primary?.status || null,
      },
    },
  })
}
