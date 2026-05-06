// shared/games/insights/player/sections/positionFit/positionFit.evaluation.js

import {
  evaluateHigherIsBetter,
  hasNumber,
  roundNumber,
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

function normalizeHigherEvaluation(evaluation, positiveLabel, negativeLabel) {
  if (!evaluation || evaluation.status === 'empty') {
    return buildEmptyEvaluation('missing_target')
  }

  if (evaluation.status === 'green') {
    return {
      ...evaluation,
      label: positiveLabel,
      isPositive: true,
      isNegative: false,
    }
  }

  if (evaluation.status === 'red') {
    return {
      ...evaluation,
      label: negativeLabel,
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

function evaluateDefensiveTarget(metrics = {}) {
  const target = Number(metrics.goalsAgainstPerGameTarget)
  const actual = Number(metrics.goalsAgainstPerGame)

  if (!hasNumber(target) || target <= 0 || !hasNumber(actual)) {
    return buildEmptyEvaluation('missing_defensive_target')
  }

  const gap = roundNumber(actual - target, 2)

  if (gap <= -0.2) {
    return {
      status: 'green',
      label: 'טוב מיעד הספיגה',
      tone: 'success',
      actual,
      target,
      gap,
      isGreen: true,
      isWatch: false,
      isRed: false,
      isPositive: true,
      isNegative: false,
    }
  }

  if (gap <= 0.15) {
    return {
      status: 'neutral',
      label: 'קרוב ליעד הספיגה',
      tone: 'neutral',
      actual,
      target,
      gap,
      isGreen: false,
      isWatch: true,
      isRed: false,
      isPositive: false,
      isNegative: false,
    }
  }

  if (gap <= 0.35) {
    return {
      status: 'warning',
      label: 'מעל יעד הספיגה',
      tone: 'warning',
      actual,
      target,
      gap,
      isGreen: false,
      isWatch: true,
      isRed: false,
      isPositive: false,
      isNegative: true,
    }
  }

  return {
    status: 'red',
    label: 'רחוק מיעד הספיגה',
    tone: 'danger',
    actual,
    target,
    gap,
    isGreen: false,
    isWatch: false,
    isRed: true,
    isPositive: false,
    isNegative: true,
  }
}

export function buildPlayerPositionFitEvaluation(metrics = {}) {
  if (!metrics.hasAnyData) {
    return {
      attack: buildEmptyEvaluation('missing_data'),
      defense: buildEmptyEvaluation('missing_data'),
      primary: buildEmptyEvaluation('missing_data'),
      hasEnoughData: false,
    }
  }

  const attack = normalizeHigherEvaluation(
    evaluateHigherIsBetter(
      metrics.contributionsPerGame,
      metrics.positionTarget?.contributionPerGame
    ),
    'תפוקה מתאימה לעמדה',
    'תפוקה נמוכה לעמדה'
  )

  const defense = evaluateDefensiveTarget(metrics)

  let primary = attack

  if (metrics.isDefensiveRole) {
    primary = defense.status !== 'empty' ? defense : attack
  }

  if (metrics.isMiddleRole) {
    primary = defense.status !== 'empty' && defense.isNegative
      ? defense
      : attack
  }

  if (metrics.isAttackRole) {
    primary = attack
  }

  return {
    attack,
    defense,
    primary,
    hasEnoughData: metrics.hasAnyData,
  }
}
