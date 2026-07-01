// src/features/bulkActions/players/delete/logic/validatePlayersDeletePlan.js

import { PLAYERS_DELETE_SCOPE } from '../configs/playersDelete.config.js'

export function validatePlayersDeletePlan(plan = {}) {
  const blockers = []
  const warnings = []

  if (!plan?.teamId) blockers.push('חסר מזהה קבוצה למחיקה')

  if (!Array.isArray(plan?.players) || plan.players.length === 0) {
    blockers.push('לא נמצאו שחקנים למחיקה')
  }

  if (plan?.scope === PLAYERS_DELETE_SCOPE.ALL_TEAM_PLAYERS) {
    warnings.push('נבחרה מחיקה מלאה של כל שחקני הקבוצה')
  }

  if (plan?.summary?.withPhoto > 0) {
    warnings.push(`המחיקה כוללת ${plan.summary.withPhoto} תמונות שחקנים מ־Storage`)
  }

  if (plan?.summary?.withParents > 0) {
    warnings.push(`המחיקה כוללת ${plan.summary.withParents} שחקנים עם פרטי הורים`)
  }

  if (plan?.summary?.withAbilities > 0) {
    warnings.push(`המחיקה כוללת ${plan.summary.withAbilities} שחקנים עם נתוני יכולות`)
  }

  if (plan?.summary?.withStats > 0) {
    warnings.push(`המחיקה כוללת ${plan.summary.withStats} שחקנים עם נתוני ביצוע`)
  }

  return {
    isValid: blockers.length === 0,
    blockers,
    warnings,
  }
}
