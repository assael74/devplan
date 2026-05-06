// shared/games/insights/team/sections/difficulty/difficulty.rules.js

export function getDifficultyCoreIssue(metrics, evaluationState) {
  if (!metrics.hasAnyData) return null
  if (!evaluationState.hasEnoughData) return 'sample'
  if (!evaluationState.strongestNegative) return 'stable'

  if (evaluationState.strongestNegative.id === 'easy') {
    return 'easy_drop'
  }

  if (evaluationState.strongestNegative.id === 'equal') {
    return 'equal_gap'
  }

  if (evaluationState.strongestNegative.id === 'hard') {
    return 'hard_gap'
  }

  return 'profile_gap'
}

export function getDifficultyTone(metrics, evaluationState) {
  const issue = getDifficultyCoreIssue(metrics, evaluationState)

  if (!metrics.hasAnyData || issue === 'sample') {
    return 'neutral'
  }

  if (
    issue === 'easy_drop' ||
    issue === 'equal_gap' ||
    issue === 'hard_gap' ||
    issue === 'profile_gap'
  ) {
    return 'warning'
  }

  if (evaluationState.strongestPositive) {
    return 'success'
  }

  return 'neutral'
}

export function getDifficultyActionLabel(metrics, evaluationState) {
  const issue = getDifficultyCoreIssue(metrics, evaluationState)

  if (!metrics.hasAnyData || issue === 'sample') {
    return 'המשך בדיקה'
  }

  if (
    issue === 'easy_drop' ||
    issue === 'equal_gap' ||
    issue === 'hard_gap' ||
    issue === 'profile_gap'
  ) {
    return 'מוקד פעולה'
  }

  if (evaluationState.strongestPositive) {
    return 'המשך פעולה'
  }

  return 'המשך בדיקה'
}
