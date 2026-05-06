// shared/games/insights/team/sections/squad/squad.items.js

import {
  getAttackTone,
  getIntegrationTone,
  getLabelByTone,
  getLineupTone,
} from './squad.rules.js'

import {
  buildAttackDetails,
  buildAttackText,
  buildIntegrationDetails,
  buildIntegrationText,
  buildLineupDetails,
  buildLineupText,
} from './squad.texts.js'

import { formatPercent } from '../../common/index.js'
import { buildTargetGapContextText, getTargetGapContextTone } from '../../common/index.js'

function buildItemTargetContext({ targetGap, context, tone }) {
  if (tone !== 'warning') return null
  if (!targetGap?.isBelowTarget) return null

  const text = buildTargetGapContextText(targetGap, context)

  if (!text) return null

  return {
    id: 'target_context',
    type: 'context',
    label: 'הקשר יעד',
    tone: getTargetGapContextTone(targetGap),
    text,
  }
}

export function buildSquadItems(metrics, performance, targetGap) {
  const attackTone = getAttackTone(metrics, performance)
  const lineupTone = getLineupTone(metrics, performance)
  const integrationTone = getIntegrationTone(metrics, performance)

  return [
    {
      id: 'attacking_involvement',
      type: 'attacking',
      label: 'מעורבות התקפית',
      actionLabel: getLabelByTone(attackTone),
      tone: attackTone,
      value: metrics.scorersProfile?.hasScorersData
        ? `${metrics.scorersProfile.uniqueScorers} כובשים`
        : formatPercent(metrics.attackingInvolvementPct),
      text: buildAttackText(metrics, performance),
      details: [
        ...buildAttackDetails(metrics, performance),
        buildItemTargetContext({
          targetGap,
          context: 'squadAttack',
          tone: attackTone,
        }),
      ].filter(Boolean),
      metrics: {
        scorers: metrics.scorers,
        assisters: metrics.assisters,
        goalContributors: metrics.goalContributors,
        attackingInvolvementPct: metrics.attackingInvolvementPct,
        scorersProfile: metrics.scorersProfile,
        scorersEvaluation: metrics.scorersEvaluation,
      },
    },
    {
      id: 'lineup_stability',
      type: 'lineup',
      label: 'יציבות הרכב',
      actionLabel: getLabelByTone(lineupTone),
      tone: lineupTone,
      value: formatPercent(metrics.lineupStabilityPct),
      text: buildLineupText(metrics, performance),
      details: [
        ...buildLineupDetails(metrics, performance),
        buildItemTargetContext({
          targetGap,
          context: 'squadLineup',
          tone: lineupTone,
        }),
      ].filter(Boolean),
      metrics: {
        starters: metrics.starters,
        usedPlayers: metrics.usedPlayers,
        lineupStabilityPct: metrics.lineupStabilityPct,
      },
    },
    {
      id: 'player_integration',
      type: 'integration',
      label: 'שילוב שחקנים',
      actionLabel: getLabelByTone(integrationTone),
      tone: integrationTone,
      value: formatPercent(metrics.playerIntegrationPct),
      text: buildIntegrationText(metrics, performance),
      details: [
        ...buildIntegrationDetails(metrics, performance),
        buildItemTargetContext({
          targetGap,
          context: 'squadIntegration',
          tone: integrationTone,
        }),
      ].filter(Boolean),
      metrics: {
        squadSize: metrics.squadSize,
        usedPlayers: metrics.usedPlayers,
        notUsedPlayers: metrics.notUsedPlayers,
        playerIntegrationPct: metrics.playerIntegrationPct,
      },
    },
  ]
}
