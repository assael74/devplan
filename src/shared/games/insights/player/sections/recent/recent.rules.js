// shared/games/insights/player/sections/recent/recent.rules.js

export function getRecentCoreIssue(metrics, evaluationState) {
  if (!metrics?.hasAnyData) return 'missing_data'
  if (!metrics?.hasEnoughData) return 'sample_caution'

  if (evaluationState?.trend?.status === 'positive_form') {
    return 'positive_form'
  }

  if (evaluationState?.trend?.status === 'quiet_form') {
    return 'quiet_form'
  }

  return 'stable_form'
}

export function getRecentTone(metrics, evaluationState) {
  const issue = getRecentCoreIssue(metrics, evaluationState)

  if (issue === 'positive_form') return 'success'
  if (issue === 'quiet_form') return 'warning'

  return 'neutral'
}

export function getRecentActionLabel(metrics, evaluationState) {
  const issue = getRecentCoreIssue(metrics, evaluationState)

  if (issue === 'missing_data') return 'אין נתונים'
  if (issue === 'sample_caution') return 'כיוון בלבד'
  if (issue === 'positive_form') return 'מומנטום'
  if (issue === 'quiet_form') return 'מעקב תפוקה'

  return 'מגמה יציבה'
}
