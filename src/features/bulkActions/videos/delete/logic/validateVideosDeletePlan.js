// src/features/bulkActions/videos/delete/logic/validateVideosDeletePlan.js

export function validateVideosDeletePlan(plan = {}) {
  const blockers = []
  const warnings = []

  if (!Array.isArray(plan?.videos) || plan.videos.length === 0) {
    blockers.push('לא נמצאו קטעי וידאו למחיקה')
  }

  if (!Array.isArray(plan?.videoIds) || plan.videoIds.length === 0) {
    blockers.push('חסרים מזהי וידאו למחיקה')
  }

  if (plan?.summary?.assigned > 0) {
    warnings.push(
      `המחיקה כוללת ${plan.summary.assigned} קטעי וידאו משויכים`
    )
  }

  if (plan?.summary?.tagged > 0) {
    warnings.push(
      `המחיקה כוללת ${plan.summary.tagged} קטעי וידאו מאופיינים`
    )
  }

  if (plan?.summary?.partial > 0) {
    warnings.push(
      `המחיקה כוללת ${plan.summary.partial} קטעי וידאו באפיון חלקי`
    )
  }

  return {
    isValid: blockers.length === 0,
    blockers,
    warnings,
  }
}
