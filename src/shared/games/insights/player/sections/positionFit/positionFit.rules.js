// shared/games/insights/player/sections/positionFit/positionFit.rules.js

export function getPositionFitCoreIssue(metrics, evaluationState) {
  if (!metrics?.hasAnyData) return 'missing_data'
  if (!metrics?.hasPosition) return 'missing_position'
  if (!metrics?.hasPositionTarget) return 'missing_position_target'

  if (metrics.isAttackRole) {
    if (evaluationState?.attack?.isRed) return 'attack_output_gap'
    if (evaluationState?.attack?.isGreen) return 'attack_fit'
    return 'attack_watch'
  }

  if (metrics.isDefensiveRole) {
    if (evaluationState?.defense?.isRed) return 'defensive_gap'
    if (evaluationState?.defense?.isPositive) return 'defensive_fit'
    if (metrics.goalContributions > 0) return 'defensive_attack_bonus'
    return 'defensive_watch'
  }

  if (metrics.isMiddleRole) {
    if (evaluationState?.defense?.isRed) return 'defensive_gap'
    if (evaluationState?.attack?.isGreen) return 'middle_attack_bonus'
    return 'middle_balance_watch'
  }

  return 'watch'
}

export function getPositionFitTone(metrics, evaluationState) {
  const issue = getPositionFitCoreIssue(metrics, evaluationState)

  if (
    issue === 'missing_data' ||
    issue === 'missing_position' ||
    issue === 'missing_position_target'
  ) {
    return 'neutral'
  }

  if (
    issue === 'attack_output_gap' ||
    issue === 'defensive_gap'
  ) {
    return 'warning'
  }

  if (
    issue === 'attack_fit' ||
    issue === 'defensive_fit' ||
    issue === 'defensive_attack_bonus' ||
    issue === 'middle_attack_bonus'
  ) {
    return 'success'
  }

  return 'neutral'
}

export function getPositionFitActionLabel(metrics, evaluationState) {
  const issue = getPositionFitCoreIssue(metrics, evaluationState)

  if (issue === 'missing_data') return 'אין נתונים'
  if (issue === 'missing_position') return 'השלמת עמדה'
  if (issue === 'missing_position_target') return 'השלמת יעד'
  if (issue === 'attack_output_gap') return 'פער תפוקה'
  if (issue === 'attack_fit') return 'תואם עמדה'
  if (issue === 'defensive_gap') return 'פער הגנתי'
  if (issue === 'defensive_fit') return 'יציב הגנתית'
  if (issue === 'defensive_attack_bonus') return 'בונוס התקפי'
  if (issue === 'middle_attack_bonus') return 'תרומה נוספת'
  if (issue === 'middle_balance_watch') return 'איזון תפקיד'

  return 'המשך מעקב'
}
