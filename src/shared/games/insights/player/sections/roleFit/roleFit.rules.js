// shared/games/insights/player/sections/roleFit/roleFit.rules.js

export function getRoleFitCoreIssue(metrics, evaluationState) {
  if (!metrics?.hasAnyData) return 'missing_data'
  if (!metrics?.hasRole) return 'missing_role'
  if (!metrics?.hasRoleTarget) return 'missing_role_target'

  const usage = evaluationState?.usage || {}
  const trust = evaluationState?.trust || {}

  if (usage.status === 'under_strong') return 'strong_under_role'
  if (usage.status === 'under') return 'under_role'
  if (usage.status === 'above') return 'above_role'

  if (
    trust.status === 'limited_trust' ||
    trust.status === 'soft_core' ||
    trust.status === 'soft_rotation'
  ) {
    return 'difficulty_trust_gap'
  }

  if (
    trust.status === 'trusted' ||
    trust.status === 'core_trust' ||
    trust.status === 'real_rotation' ||
    trust.status === 'above_fringe'
  ) {
    return 'trusted_role'
  }

  if (usage.status === 'fit') return 'role_fit'

  return 'watch'
}

export function getRoleFitTone(metrics, evaluationState) {
  const issue = getRoleFitCoreIssue(metrics, evaluationState)

  if (
    issue === 'missing_data' ||
    issue === 'missing_role' ||
    issue === 'missing_role_target'
  ) {
    return 'neutral'
  }

  if (issue === 'strong_under_role') return 'danger'

  if (
    issue === 'under_role' ||
    issue === 'difficulty_trust_gap'
  ) {
    return 'warning'
  }

  if (
    issue === 'trusted_role' ||
    issue === 'role_fit'
  ) {
    return 'success'
  }

  if (issue === 'above_role') {
    return metrics?.role?.id === 'rotation' || metrics?.role?.id === 'fringe'
      ? 'success'
      : 'warning'
  }

  return 'neutral'
}

export function getRoleFitActionLabel(metrics, evaluationState) {
  const issue = getRoleFitCoreIssue(metrics, evaluationState)

  if (issue === 'missing_data') return 'אין נתונים'
  if (issue === 'missing_role') return 'השלמת מעמד'
  if (issue === 'missing_role_target') return 'השלמת יעד'
  if (issue === 'strong_under_role') return 'פער משמעותי'
  if (issue === 'under_role') return 'מוקד בדיקה'
  if (issue === 'above_role') return 'חריגה מעניינת'
  if (issue === 'difficulty_trust_gap') return 'בדיקת אמון'
  if (issue === 'trusted_role') return 'אמון מקצועי'
  if (issue === 'role_fit') return 'תואם מעמד'

  return 'המשך מעקב'
}
