// src/features/playersDatabase/model/shared/futureCompetition.presentation.js

const UNAVAILABLE_REASON_LABELS = {
  RULES_NOT_CONFIGURED: 'לא הוגדרו חוקי עלייה וירידה לליגה',
  SEASON_BEFORE_HALFWAY: 'טרם הושלמו 50% ממשחקי העונה',
  TEAM_NOT_IN_TABLE: 'קבוצת המקור חסרה בטבלת הליגה',
  SCHEDULE_MISSING: 'חסר מספר משחקי העונה הצפוי',
  LEAGUE_UNAVAILABLE: 'נתוני ליגת המקור לא זמינים',
  LEAGUE_SEASON_MISSING: 'חסרים נתוני העונה בליגת המקור',
}

export const describeUnavailableFutureCompetition = competition => {
  const reasons = (competition?.unavailableReasons || []).map(reason => UNAVAILABLE_REASON_LABELS[reason]).filter(Boolean)
  if (reasons.length) return `שנתון ${competition.sourceBirthYear}: ${reasons.join(' · ')}`
  if (competition?.reason === 'SOURCE_CURRENT_LEVEL_ONLY') {
    return `שנתון ${competition.sourceBirthYear}: צפי טרם זמין — סיבת החסימה לא זמינה`
  }
  if (competition?.reason === 'SOURCE_AMBIGUOUS') return 'לא ניתן לזהות באופן חד־משמעי את הקבוצה המשפיעה'
  if (competition?.reason === 'SOURCE_MISSING') return 'חסרים נתוני השנתון המשפיע לעונה הבאה'
  return 'צפי התחרות טרם זמין'
}
