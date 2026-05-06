// shared/games/insights/player/sections/usage/usage.rules.js

export function getUsageCoreIssue(metrics, evaluationState) {
  if (!metrics?.hasAnyData) return 'missing_data'
  if (!metrics?.hasRole) return 'missing_role'
  if (!metrics?.hasRoleTarget) return 'missing_role_target'

  const minutes = evaluationState?.minutes || {}

  if (minutes.isUnderTarget) return 'under_usage'
  if (minutes.isOverTarget) return 'over_usage'
  if (minutes.isInsideTarget) return 'role_fit'

  return 'watch'
}

export function getUsageTone(metrics, evaluationState) {
  const issue = getUsageCoreIssue(metrics, evaluationState)

  if (
    issue === 'missing_data' ||
    issue === 'missing_role' ||
    issue === 'missing_role_target'
  ) {
    return 'neutral'
  }

  if (issue === 'under_usage') {
    return evaluationState?.minutes?.isRed ? 'danger' : 'warning'
  }

  if (issue === 'over_usage') {
    return evaluationState?.minutes?.isGreen ? 'success' : 'warning'
  }

  if (issue === 'role_fit') return 'success'

  return 'neutral'
}

export function getUsageActionLabel(metrics, evaluationState) {
  const issue = getUsageCoreIssue(metrics, evaluationState)

  if (issue === 'missing_data') return 'אין נתונים'
  if (issue === 'missing_role') return 'השלמת הגדרה'
  if (issue === 'missing_role_target') return 'השלמת יעד'
  if (issue === 'under_usage') return 'מוקד בדיקה'
  if (issue === 'over_usage') return 'חריגה מעניינת'
  if (issue === 'role_fit') return 'תואם תכנון'

  return 'המשך מעקב'
}
