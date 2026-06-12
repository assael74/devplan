// src/features/bulkActions/games/delete/logic/validateGamesDeletePlan.js

import { GAMES_DELETE_SCOPE } from '../configs/gamesDelete.config.js'

export function validateGamesDeletePlan(plan = {}) {
  const blockers = []
  const warnings = []

  if (!plan?.teamId) {
    blockers.push('חסר מזהה קבוצה למחיקה')
  }

  if (!Array.isArray(plan?.games) || plan.games.length === 0) {
    blockers.push('לא נמצאו משחקים למחיקה')
  }

  if (plan?.scope === GAMES_DELETE_SCOPE.ALL_TEAM_GAMES) {
    warnings.push('נבחרה מחיקה מלאה של כל משחקי הקבוצה')
  }

  if (plan?.summary?.withStats > 0) {
    warnings.push(`המחיקה כוללת ${plan.summary.withStats} משחקים עם סטטיסטיקה`)
  }

  if (plan?.summary?.withVideo > 0) {
    warnings.push(`המחיקה כוללת ${plan.summary.withVideo} משחקים עם וידאו`)
  }

  return {
    isValid: blockers.length === 0,
    blockers,
    warnings,
  }
}
