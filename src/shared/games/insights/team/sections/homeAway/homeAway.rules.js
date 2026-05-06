// shared/games/insights/team/sections/homeAway/homeAway.rules.js

export function getBetterSide(metrics, evaluationState) {
  const greenGap = Number(evaluationState?.targets?.gap?.greenMax ?? 8)

  if (metrics.absGap <= greenGap) return 'balanced'
  if (metrics.gap > 0) return 'home'

  return 'away'
}

export function hasHomeAwaySystemicRisk(evaluationState) {
  return (
    evaluationState?.evaluation?.home?.isRed &&
    evaluationState?.evaluation?.away?.isRed
  )
}

export function hasStrongHomeAwayProfile(evaluationState) {
  return (
    evaluationState?.evaluation?.home?.isGreen &&
    evaluationState?.evaluation?.away?.isGreen &&
    evaluationState?.evaluation?.gap?.isGreen
  )
}

export function getHomeAwayTone(metrics, evaluationState) {
  if (!metrics.hasAnyData) return 'neutral'
  if (!evaluationState.hasEnoughData) return 'neutral'

  const evaluation = evaluationState.evaluation

  if (evaluation.home.isRed || evaluation.away.isRed || evaluation.gap.isRed) {
    return 'warning'
  }

  if (hasStrongHomeAwayProfile(evaluationState)) {
    return 'success'
  }

  return 'primary'
}

export function getHomeAwayActionLabel(metrics, evaluationState) {
  if (!evaluationState.hasEnoughData) return 'המשך בדיקה'

  const evaluation = evaluationState.evaluation

  if (
    hasHomeAwaySystemicRisk(evaluationState) ||
    evaluation.home.isRed ||
    evaluation.away.isRed ||
    evaluation.gap.isRed
  ) {
    return 'מוקד פעולה'
  }

  if (hasStrongHomeAwayProfile(evaluationState)) {
    return 'דגל ירוק'
  }

  return 'המשך פעולה'
}
