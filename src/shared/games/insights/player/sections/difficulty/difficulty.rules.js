// shared/games/insights/player/sections/difficulty/difficulty.rules.js

export function getPlayerDifficultyCoreIssue(metrics, evaluationState) {
  if (!metrics?.hasAnyData) return 'missing_data'

  if (!evaluationState?.hasEnoughData && evaluationState?.strongestNegative) {
    return 'difficulty_gap_caution'
  }

  if (!evaluationState?.hasEnoughData && evaluationState?.strongestPositive) {
    return 'difficulty_advantage_caution'
  }

  if (!evaluationState?.hasEnoughData) return 'sample_caution'

  if (evaluationState?.strongestNegative) return 'difficulty_gap'
  if (evaluationState?.strongestPositive) return 'difficulty_advantage'

  if (!metrics.hasFullProfile) return 'partial_profile'

  return 'stable_profile'
}

export function getPlayerDifficultyTone(metrics, evaluationState) {
  const issue = getPlayerDifficultyCoreIssue(metrics, evaluationState)

  if (
    issue === 'missing_data' ||
    issue === 'sample_caution' ||
    issue === 'partial_profile' ||
    issue === 'difficulty_gap_caution' ||
    issue === 'difficulty_advantage_caution'
  ) {
    return 'neutral'
  }

  if (issue === 'difficulty_gap') return 'warning'
  if (issue === 'difficulty_advantage') return 'success'

  return 'neutral'
}

export function getPlayerDifficultyActionLabel(metrics, evaluationState) {
  const issue = getPlayerDifficultyCoreIssue(metrics, evaluationState)

  if (issue === 'missing_data') return 'אין נתונים'
  if (issue === 'sample_caution') return 'כיוון בלבד'
  if (issue === 'partial_profile') return 'פרופיל חלקי'
  if (issue === 'difficulty_gap') return 'פער רמת יריבה'
  if (issue === 'difficulty_advantage') return 'יתרון רמת יריבה'
  if (issue === 'difficulty_gap_caution') return 'פער זהיר'
  if (issue === 'difficulty_advantage_caution') return 'יתרון זהיר'

  return 'יציבות לפי יריבה'
}
