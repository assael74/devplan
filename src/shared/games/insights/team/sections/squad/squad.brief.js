// shared/games/insights/team/sections/squad/squad.brief.js

import {
  buildEmptyBriefResult,
  buildReadyBriefResult,
} from '../../common/index.js'

import {
  resolveScorersSource,
  resolveSquadSource,
} from './squad.sources.js'

import { buildSquadPerformanceContext } from './squad.performance.js'

import {
  buildScorersMetrics,
  buildSquadBaseMetrics,
} from './squad.metrics.js'

import {
  buildScorersEvaluation,
  buildSquadUsageEvaluation,
} from './squad.evaluation.js'

import { buildSquadItems } from './squad.items.js'
import { getSquadOverallTone } from './squad.rules.js'

const BRIEF_ID = 'team_games_squad_brief'
const SECTION_ID = 'squad'

export function buildTeamGamesSquadBrief(insights = {}) {
  const source = resolveSquadSource(insights)
  const scorersSource = resolveScorersSource(insights, source)
  const performance = buildSquadPerformanceContext(insights)

  const baseMetrics = buildSquadBaseMetrics(source)
  const scorersProfile = buildScorersMetrics(scorersSource)

  const squadUsageProfile = source?.squadUsageMetrics || {}

  const scorersEvaluation = buildScorersEvaluation(
    scorersProfile,
    performance
  )

  const squadUsageEvaluation = buildSquadUsageEvaluation(
    squadUsageProfile,
    performance
  )

  const metrics = {
    ...baseMetrics,
    scorersProfile,
    scorersEvaluation,
    squadUsageProfile,
    squadUsageEvaluation,
  }

  const sourceLabel =
    insights?.calculation?.sourceLabel ||
    insights?.active?.sourceLabel ||
    'נתוני משחקים'

  if (!source && !scorersProfile.hasScorersData) {
    return buildEmptyBriefResult({
      id: BRIEF_ID,
      sectionId: SECTION_ID,
      title: 'תובנות הסגל',
      subtitle: 'מעורבות · יציבות · שילוב',
      sourceLabel,
      targetLabel: performance.targetLabel,
      text: 'אין מספיק נתוני סגל כדי לבנות תובנות.',
      metrics: {},
      meta: {
        targetLevelId: performance.targetLevelId,
        targetLabel: performance.targetLabel,
      },
      debug: {
        section: SECTION_ID,
        reason: 'no_squad_data',
        squadSource: source ? 'resolved' : 'missing',
        scorersSource: scorersSource ? 'resolved' : 'missing',
        targetProfileId: performance.targetLevelId,
        hasTargetProfile: Boolean(performance.targetLevelId),
      },
    })
  }

  const items = buildSquadItems(metrics, performance, insights.targetGap)
  const tone = getSquadOverallTone(items)
  const primary = items.find((item) => item.tone === 'warning') || items[0]

  return buildReadyBriefResult({
    id: BRIEF_ID,
    sectionId: SECTION_ID,
    tone,
    title: 'תובנות הסגל',
    subtitle: 'מעורבות · יציבות · שילוב',
    sourceLabel,
    targetLabel: performance.targetLabel,
    text: primary ? primary.text : '',
    items,
    metrics,
    meta: {
      performance,
      targetLevelId: performance.targetLevelId,
      targetLabel: performance.targetLabel,
      targetGoalsFor: performance.targetGoalsFor,
      hasScorersTargets: scorersEvaluation.hasTargets,
      hasSquadUsageTargets: squadUsageEvaluation.hasTargets,
      targetGapRelation: insights.targetGap?.relation || 'unknown',
    },
    debug: {
      section: SECTION_ID,
      squadSource: source ? 'resolved' : 'missing',
      scorersSource: scorersSource ? 'resolved' : 'missing',
      targetProfileId: performance.targetLevelId,
      hasTargetProfile: Boolean(performance.targetLevelId),
      targetGap: {
        relation: insights.targetGap?.relation || 'unknown',
        targetProfileId: insights.targetGap?.targetProfileId || null,
        forecastProfileId: insights.targetGap?.forecastProfileId || null,
      },
      selectedText: primary?.id || null,
      itemTones: items.reduce((acc, item) => {
        acc[item.id] = item.tone
        return acc
      }, {}),
      evaluationSummary: {
        scorers: scorersEvaluation.summary,
        squadUsage: squadUsageEvaluation.summary,
      },
    },
  })
}
