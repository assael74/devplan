// shared/games/insights/player/sections/scoring/scoring.rules.js

export function getScoringCoreIssue(metrics, evaluationState) {
  if (!metrics?.hasAnyData) return 'missing_data'
  if (!metrics?.hasPosition) return 'missing_position'
  if (!metrics?.hasPositionTarget) return 'missing_position_target'

  if (evaluationState?.manualTarget?.isRed) return 'manual_target_gap'
  if (evaluationState?.manualTarget?.isGreen) return 'manual_target_fit'

  if (evaluationState?.contribution?.isRed) return 'low_contribution'
  if (evaluationState?.contribution?.isGreen) return 'high_contribution'

  if (evaluationState?.share?.isRed) return 'low_team_share'
  if (evaluationState?.share?.isGreen) return 'high_team_share'

  if (metrics.hasScoringData) return 'active_scoring'

  return 'low_output_watch'
}

export function getScoringTone(metrics, evaluationState) {
  const issue = getScoringCoreIssue(metrics, evaluationState)

  if (
    issue === 'missing_data' ||
    issue === 'missing_position' ||
    issue === 'missing_position_target'
  ) {
    return 'neutral'
  }

  if (
    issue === 'manual_target_gap' ||
    issue === 'low_contribution' ||
    issue === 'low_team_share'
  ) {
    return 'warning'
  }

  if (
    issue === 'manual_target_fit' ||
    issue === 'high_contribution' ||
    issue === 'high_team_share' ||
    issue === 'active_scoring'
  ) {
    return 'success'
  }

  return 'neutral'
}

export function getScoringActionLabel(metrics, evaluationState) {
  const issue = getScoringCoreIssue(metrics, evaluationState)

  if (issue === 'missing_data') return 'אין נתונים'
  if (issue === 'missing_position') return 'השלמת עמדה'
  if (issue === 'missing_position_target') return 'השלמת יעד'
  if (issue === 'manual_target_gap') return 'פער יעד אישי'
  if (issue === 'manual_target_fit') return 'עומד ביעד'
  if (issue === 'low_contribution') return 'מוקד תפוקה'
  if (issue === 'high_contribution') return 'יתרון התקפי'
  if (issue === 'low_team_share') return 'משקל נמוך'
  if (issue === 'high_team_share') return 'משקל גבוה'
  if (issue === 'active_scoring') return 'תרומה קיימת'

  return 'המשך מעקב'
}
