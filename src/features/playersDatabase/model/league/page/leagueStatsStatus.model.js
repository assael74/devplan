// src/features/playersDatabase/model/league/page/leagueStatsStatus.model.js

import { readStatsGameCount } from '../../../domain/stats/statsLoadState.js'

export const buildLeagueStatsStatus = ({ stats = {}, teamGamePlayed = null } = {}) => {
  if (stats.hasStats !== true) {
    return {
      state: 'missing',
      label: 'לא נטענה סטטיסטיקה',
      color: 'neutral',
      gap: null,
      description: 'אין נתוני סטטיסטיקה טעונים לקבוצה.',
    }
  }

  const current = readStatsGameCount(teamGamePlayed)
  const atLoad = readStatsGameCount(stats.teamGamePlayedAtLoad)
  if (current === null || atLoad === null) {
    return {
      state: 'unknown',
      label: 'נטען · פער לא ידוע',
      color: 'neutral',
      gap: null,
      description: 'יש סטטיסטיקה, אך חסר מספר המשחקים בטבלה בזמן הטעינה או כעת. לא ניתן לקבוע פער משחקים.',
    }
  }

  const gap = current - atLoad
  const basis = `בטבלה כעת: ${current} משחקים; בזמן טעינת הסטטיסטיקה: ${atLoad}.`
  if (gap < 0) {
    return {
      state: 'mismatch',
      label: 'פער בנתונים',
      color: 'warning',
      gap,
      description: `${basis} מספר המשחקים בטבלה קטן מהבסיס שנשמר; יש לבדוק את הנתונים.`,
    }
  }
  if (gap > 0) {
    return {
      state: 'gap',
      label: gap === 1 ? 'פער משחק אחד' : `פער ${gap} משחקים`,
      color: 'warning',
      gap,
      description: `${basis} נוספו משחקים בטבלה מאז טעינת הסטטיסטיקה.`,
    }
  }

  const complete = stats.statsComplete === true
  return {
    state: complete ? 'matched' : 'partial',
    label: complete ? 'נטען · ללא פער' : 'חלקי · ללא פער',
    color: complete ? 'success' : 'warning',
    gap: 0,
    description: `${basis} אין פער בבסיס המשחקים.${complete ? '' : ' טעינת הסטטיסטיקה מסומנת כחלקית.'}`,
  }
}
