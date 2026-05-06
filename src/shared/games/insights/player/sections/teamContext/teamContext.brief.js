// shared/games/insights/player/sections/teamContext/teamContext.brief.js

import {
  buildEmptyBriefResult,
  buildReadyBriefResult,
} from '../../../team/common/index.js'

import { buildPlayerTeamContextEvaluation } from './teamContext.evaluation.js'
import { buildPlayerTeamContextItems } from './teamContext.items.js'
import { buildPlayerTeamContextMetrics } from './teamContext.metrics.js'

import {
  getTeamContextCoreIssue,
  getTeamContextTone,
} from './teamContext.rules.js'

const BRIEF_ID = 'player_games_team_context_brief'
const SECTION_ID = 'teamContext'

export function buildPlayerGamesTeamContextBrief(insights = {}) {
  const metrics = buildPlayerTeamContextMetrics(insights)
  const evaluationState = buildPlayerTeamContextEvaluation(metrics)

  const sourceLabel = 'נתוני קבוצה ומשחקי שחקן'
  const targetLabel = 'השוואת עם/בלי'

  if (!metrics.hasAnyData) {
    return buildEmptyBriefResult({
      id: BRIEF_ID,
      sectionId: SECTION_ID,
      title: 'השפעה קבוצתית',
      subtitle: 'נקודות עם/בלי השחקן',
      sourceLabel,
      targetLabel,
      text: 'אין מספיק נתונים כדי לבנות השוואת עם/בלי.',
      metrics,
      meta: {
        hasEnoughData: false,
      },
      debug: {
        section: SECTION_ID,
        reason: 'no_team_context_data',
      },
    })
  }

  const items = buildPlayerTeamContextItems(metrics, evaluationState)
  const primary = items.find((item) => item.id === 'action_focus') || items[0]
  const tone = getTeamContextTone(metrics, evaluationState)
  const coreIssue = getTeamContextCoreIssue(metrics, evaluationState)

  return buildReadyBriefResult({
    id: BRIEF_ID,
    sectionId: SECTION_ID,
    tone,
    title: 'השפעה קבוצתית',
    subtitle: 'נקודות עם/בלי השחקן',
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
        impact: evaluationState.impact?.status || null,
      },
    },
  })
}
