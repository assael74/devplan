// shared/games/insights/player/sections/scoring/scoring.evaluation.js

import {
  evaluateHigherIsBetter,
  hasNumber,
} from '../../../team/common/index.js'

function buildEmptyEvaluation(reason = 'missing_data') {
  return {
    status: 'empty',
    label: 'אין נתונים',
    tone: 'neutral',
    reason,

    isGreen: false,
    isWatch: false,
    isRed: false,
    isPositive: false,
    isNegative: false,
  }
}

function normalizeEvaluation(evaluation, fallbackLabel) {
  if (!evaluation || evaluation.status === 'empty') {
    return buildEmptyEvaluation('missing_target')
  }

  if (evaluation.status === 'green') {
    return {
      ...evaluation,
      label: fallbackLabel || 'מעל יעד',
      isPositive: true,
      isNegative: false,
    }
  }

  if (evaluation.status === 'red') {
    return {
      ...evaluation,
      label: 'מתחת יעד',
      isPositive: false,
      isNegative: true,
    }
  }

  return {
    ...evaluation,
    label: 'בטווח מעקב',
    isPositive: false,
    isNegative: false,
  }
}

function evaluateManualTargets(metrics = {}) {
  if (!metrics.hasManualAttackTargets) {
    return buildEmptyEvaluation('missing_manual_targets')
  }

  const target = metrics.goalContributionsTarget

  if (!hasNumber(target) || Number(target) <= 0) {
    return buildEmptyEvaluation('missing_goal_contribution_target')
  }

  const pct = Math.round((metrics.goalContributions / Number(target)) * 100)

  if (pct >= 100) {
    return {
      status: 'green',
      label: 'עומד ביעד אישי',
      tone: 'success',
      target,
      actual: metrics.goalContributions,
      pct,
      isGreen: true,
      isWatch: false,
      isRed: false,
      isPositive: true,
      isNegative: false,
    }
  }

  if (pct < 60) {
    return {
      status: 'red',
      label: 'רחוק מהיעד האישי',
      tone: 'danger',
      target,
      actual: metrics.goalContributions,
      pct,
      isGreen: false,
      isWatch: false,
      isRed: true,
      isPositive: false,
      isNegative: true,
    }
  }

  return {
    status: 'watch',
    label: 'בדרך ליעד',
    tone: 'warning',
    target,
    actual: metrics.goalContributions,
    pct,
    isGreen: false,
    isWatch: true,
    isRed: false,
    isPositive: false,
    isNegative: false,
  }
}

export function buildPlayerScoringEvaluation(metrics = {}) {
  if (!metrics.hasAnyData) {
    return {
      contribution: buildEmptyEvaluation('missing_scoring_data'),
      goals: buildEmptyEvaluation('missing_scoring_data'),
      assists: buildEmptyEvaluation('missing_scoring_data'),
      share: buildEmptyEvaluation('missing_scoring_data'),
      manualTarget: buildEmptyEvaluation('missing_scoring_data'),
      primary: buildEmptyEvaluation('missing_scoring_data'),
      hasEnoughData: false,
    }
  }

  const contribution = normalizeEvaluation(
    evaluateHigherIsBetter(
      metrics.contributionsPerGame,
      metrics.positionTarget?.contributionPerGame
    ),
    'תפוקה גבוהה'
  )

  const goals = normalizeEvaluation(
    evaluateHigherIsBetter(
      metrics.goalsPerGame,
      metrics.positionTarget?.goalsPerGame
    ),
    'קצב שערים גבוה'
  )

  const assists = normalizeEvaluation(
    evaluateHigherIsBetter(
      metrics.assistsPerGame,
      metrics.positionTarget?.assistsPerGame
    ),
    'קצב בישולים גבוה'
  )

  const share = normalizeEvaluation(
    evaluateHigherIsBetter(
      metrics.teamGoalsSharePct,
      metrics.positionTarget?.teamGoalsSharePct
    ),
    'משקל התקפי גבוה'
  )

  const manualTarget = evaluateManualTargets(metrics)

  const primary =
    manualTarget.status !== 'empty'
      ? manualTarget
      : contribution.status !== 'empty'
        ? contribution
        : share.status !== 'empty'
          ? share
          : goals.status !== 'empty'
            ? goals
            : assists

  return {
    contribution,
    goals,
    assists,
    share,
    manualTarget,
    primary,
    hasEnoughData: metrics.hasAnyData,
  }
}
