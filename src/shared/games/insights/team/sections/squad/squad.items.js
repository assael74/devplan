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
