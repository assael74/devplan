// shared/games/insights/player/sections/recent/recent.brief.js

import {
  buildEmptyBriefResult,
  buildReadyBriefResult,
} from '../../../team/common/index.js'

import { buildPlayerRecentEvaluation } from './recent.evaluation.js'
import { buildPlayerRecentItems } from './recent.items.js'
import { buildPlayerRecentMetrics } from './recent.metrics.js'

import {
  getRecentCoreIssue,
  getRecentTone,
} from './recent.rules.js'

const BRIEF_ID = 'player_games_recent_brief'
const SECTION_ID = 'recent'

export function buildPlayerGamesRecentBrief(insights = {}) {
  const metrics = buildPlayerRecentMetrics(insights)
  const evaluationState = buildPlayerRecentEvaluation(metrics)

  const sourceLabel = 'נתוני משחקי שחקן'
  const targetLabel = '5 משחקים אחרונים'

  if (!metrics.hasAnyData) {
    return buildEmptyBriefResult({
      id: BRIEF_ID,
      sectionId: SECTION_ID,
      title: 'מגמה אחרונה',
      subtitle: '5 משחקים אחרונים',
      sourceLabel,
      targetLabel,
      text: 'אין מספיק משחקים אחרונים כדי לזהות מגמה.',
      metrics,
      meta: {
        hasEnoughData: false,
      },
      debug: {
        section: SECTION_ID,
        reason: 'no_recent_data',
      },
    })
  }

  const items = buildPlayerRecentItems(metrics, evaluationState)
  const primary = items.find((item) => item.id === 'action_focus') || items[0]
  const tone = getRecentTone(metrics, evaluationState)
  const coreIssue = getRecentCoreIssue(metrics, evaluationState)

  return buildReadyBriefResult({
    id: BRIEF_ID,
    sectionId: SECTION_ID,
    tone,
    title: 'מגמה אחרונה',
    subtitle: '5 משחקים אחרונים',
    sourceLabel,
    targetLabel,
    text: primary ? primary.text : '',
    items,
    metrics,
    meta: {
      hasEnoughData: evaluationState.hasEnoughData,
      coreIssue,
    },
    debug: {
      section: SECTION_ID,
      selectedText: primary?.id || null,
      coreIssue,
      evaluation: {
        trend: evaluationState.trend?.status || null,
      },
    },
  })
}
