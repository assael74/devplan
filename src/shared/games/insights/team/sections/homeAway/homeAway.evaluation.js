// shared/games/insights/team/sections/homeAway/homeAway.evaluation.js

import {
  evaluateHigherIsBetter,
  hasNumber,
} from '../../common/index.js'

import { getTeamGamesHomeAwayTargetsByLevelId } from '../../targets/teamTargets.selectors.js'

const FALLBACK_HOME_AWAY_TARGETS = {
  overall: { greenMin: 50, redBelow: 40 },
  home: { greenMin: 55, redBelow: 40 },
  away: { greenMin: 45, redBelow: 30 },
  gap: { greenMax: 12, redMin: 18 },
}

function getLevelLabel(level) {
  return (
    level?.rankRangeLabel ||
    level?.rankLabel ||
    level?.shortLabel ||
    level?.label ||
    ''
  )
}

function resolveTargetProfile(insights = {}) {
  return insights.targetProfile || insights.benchmarkLevel || null
}

function evaluateGap(value, target) {
  if (!hasNumber(value) || !target) {
    return {
      status: 'empty',
      tone: 'neutral',
      isGreen: false,
      isRed: false,
      isWatch: false,
    }
  }

  const n = Math.abs(Number(value))

  if (hasNumber(target.greenMax) && n <= Number(target.greenMax)) {
    return {
      status: 'green',
      tone: 'success',
      isGreen: true,
      isRed: false,
      isWatch: false,
    }
  }

  if (hasNumber(target.redMin) && n >= Number(target.redMin)) {
    return {
      status: 'red',
      tone: 'warning',
      isGreen: false,
      isRed: true,
      isWatch: false,
    }
  }

  return {
    status: 'watch',
    tone: 'primary',
    isGreen: false,
    isRed: false,
    isWatch: true,
  }
}

export function buildHomeAwayEvaluation(metrics, insights = {}) {
  const targetProfile = resolveTargetProfile(insights)
  const targets =
    getTeamGamesHomeAwayTargetsByLevelId(targetProfile?.id) ||
    FALLBACK_HOME_AWAY_TARGETS

  const evaluation = {
    overall: evaluateHigherIsBetter(metrics.overallRate, targets.overall),
    home: evaluateHigherIsBetter(metrics.home.pointsRate, targets.home),
    away: evaluateHigherIsBetter(metrics.away.pointsRate, targets.away),
    gap: evaluateGap(metrics.absGap, targets.gap),
  }

  const hasEnoughData = metrics.home.games >= 2 && metrics.away.games >= 2

  return {
    targetProfile,
    targetLevel: targetProfile,
    targetLevelId: targetProfile?.id || null,
    targetLabel: getLevelLabel(targetProfile),
    targets,
    hasSpecificTargets: Boolean(targetProfile?.id),
    evaluation,
    hasEnoughData,
  }
}
