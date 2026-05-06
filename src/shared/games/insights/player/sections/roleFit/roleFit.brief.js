// shared/games/insights/player/sections/roleFit/roleFit.brief.js

import {
  buildEmptyBriefResult,
  buildReadyBriefResult,
} from '../../../team/common/index.js'

import { buildPlayerRoleFitEvaluation } from './roleFit.evaluation.js'
import { buildPlayerRoleFitItems } from './roleFit.items.js'
import { buildPlayerRoleFitMetrics } from './roleFit.metrics.js'

import {
  getRoleFitCoreIssue,
  getRoleFitTone,
} from './roleFit.rules.js'

const BRIEF_ID = 'player_games_role_fit_brief'
const SECTION_ID = 'roleFit'

export function buildPlayerGamesRoleFitBrief(insights = {}) {
  const metrics = buildPlayerRoleFitMetrics(insights)
  const evaluationState = buildPlayerRoleFitEvaluation(metrics)

  const sourceLabel =
    insights?.games?.sourceLabel ||
    insights?.sourceLabel ||
    'נתוני משחקי שחקן'

  const targetLabel = metrics.role?.label || 'מעמד לא הוגדר'

  if (!metrics.hasAnyData) {
    return buildEmptyBriefResult({
      id: BRIEF_ID,
      sectionId: SECTION_ID,
      title: 'התאמה למעמד',
      subtitle: 'שימוש בפועל מול תכנון סגל',
      sourceLabel,
      targetLabel,
      text: 'אין מספיק נתוני משחקים כדי לבדוק התאמה למעמד.',
      metrics,
      meta: {
        hasEnoughData: false,
        hasRole: metrics.hasRole,
        hasRoleTarget: metrics.hasRoleTarget,
      },
      debug: {
        section: SECTION_ID,
        reason: 'no_role_fit_data',
      },
    })
  }

  const items = buildPlayerRoleFitItems(metrics, evaluationState)
  const primary = items.find((item) => item.id === 'action_focus') || items[0]
  const tone = getRoleFitTone(metrics, evaluationState)
  const coreIssue = getRoleFitCoreIssue(metrics, evaluationState)

  return buildReadyBriefResult({
    id: BRIEF_ID,
    sectionId: SECTION_ID,
    tone,
    title: 'התאמה למעמד',
    subtitle: 'שימוש בפועל מול תכנון סגל',
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
        usage: evaluationState.usage?.status || null,
        trust: evaluationState.trust?.status || null,
      },
    },
  })
}
