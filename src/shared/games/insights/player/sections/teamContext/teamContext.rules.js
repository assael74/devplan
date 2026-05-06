// shared/games/insights/player/sections/teamContext/teamContext.rules.js

export function getTeamContextCoreIssue(metrics, evaluationState) {
  if (!metrics?.hasAnyData) return 'missing_data'
  if (!metrics?.hasWithData) return 'missing_with_data'
  if (!metrics?.hasWithoutData) return 'missing_without_data'

  if (!metrics?.hasEnoughData && evaluationState?.impact?.isPositive) {
    return 'positive_sample_caution'
  }

  if (!metrics?.hasEnoughData && evaluationState?.impact?.isNegative) {
    return 'negative_sample_caution'
  }

  if (!metrics?.hasEnoughData) return 'sample_caution'

  if (evaluationState?.impact?.isPositive) return 'positive_impact'
  if (evaluationState?.impact?.isNegative) return 'negative_impact'

  return 'neutral_impact'
}

export function getTeamContextTone(metrics, evaluationState) {
  const issue = getTeamContextCoreIssue(metrics, evaluationState)

  if (
    issue === 'missing_data' ||
    issue === 'missing_with_data' ||
    issue === 'missing_without_data' ||
    issue === 'sample_caution'
  ) {
    return 'neutral'
  }

  if (issue === 'positive_sample_caution') return 'neutral'
  if (issue === 'negative_sample_caution') return 'neutral'

  if (issue === 'positive_impact') return 'success'
  if (issue === 'negative_impact') return 'warning'

  return 'neutral'
}

export function getTeamContextActionLabel(metrics, evaluationState) {
  const issue = getTeamContextCoreIssue(metrics, evaluationState)

  if (issue === 'missing_data') return 'אין נתונים'
  if (issue === 'missing_with_data') return 'חסר מדגם איתו'
  if (issue === 'missing_without_data') return 'חסר מדגם בלעדיו'
  if (issue === 'sample_caution') return 'כיוון בלבד'
  if (issue === 'positive_impact') return 'השפעה חיובית'
  if (issue === 'negative_impact') return 'מוקד בדיקה'
  if (issue === 'positive_sample_caution') return 'כיוון חיובי'
  if (issue === 'negative_sample_caution') return 'כיוון שלילי'

  return 'השפעה מתונה'
}
