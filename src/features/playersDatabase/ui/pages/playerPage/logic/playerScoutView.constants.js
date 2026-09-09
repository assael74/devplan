// Player scout view presentation constants.

export const ACTION_LABELS = {
  immediate: 'לבדוק עכשיו',
  priority: 'עדיפות גבוהה',
  watch: 'מעקב',
  remove: 'הוסר',
  unknown: 'לא נקבעה',
}

export const ACTION_NOTES = {
  immediate: 'השחקן מצדיק בדיקה מקצועית מיידית.',
  priority: 'השחקן מצדיק בדיקה מקצועית בזמן הקרוב.',
  watch: 'השחקן מסומן למעקב עד שיצטברו נתונים או אימות נוסף.',
  remove: 'הפרופיל הוסר מהמצב הפעיל בעקבות החלטה ידנית.',
  unknown: 'המנוע עדיין לא קבע רמת עניין לשחקן.',
}

export const ACTION_COLORS = {
  immediate: 'immediate',
  priority: 'priority',
  watch: 'watch',
  remove: 'remove',
  unknown: 'unknown',
}

export const IMMEDIACY_REASON_LABELS = {
  early_age_group: 'גיל מוקדם שמצדיק זיהוי ומעקב מוקדם',
  profile_combination: 'שילוב פרופילים מחזק את המקרה',
  ideal_club_range: 'חוזק המועדון נמצא בטווח הסקאוטינג המועדף',
  ideal_league_level: 'רמת הליגה היא רמת יעד לסקאוטינג',
  future_level_risk: 'סביבת התחרות העתידית מחייבת תשומת לב מוקדמת',
  playing_up_validation: 'משחק מעל השנתון עם מדגם משחקים מספק',
  profile_persistence: 'הפרופיל חוזר לאורך יותר מעונה אחת',
  profile_combination_persistence: 'שילוב הפרופילים חוזר לאורך יותר מעונה אחת',
  signal_decay: 'הסימן נחלש לאורך זמן',
  profile_repeat_2: 'הפרופיל נשמר שתי עונות ברציפות',
  closing_gap: 'השחקן מתקרב באופן משמעותי לפרופיל',
  future_competition_risk: 'סביבת התחרות העתידית משפיעה על התזמון',
}

export const IMMEDIACY_EVALUATION_RESULT_LABELS = {
  boost: 'תרם',
  no_change: 'נבדק ולא התקיים',
  reduction: 'הפחית',
  not_applicable: 'לא היה רלוונטי לבדיקה',
}

export const IMMEDIACY_REDUCTION_LABELS = {
  signal_decay: 'הסימן נחלש לאורך זמן',
  profile_decay: 'הפרופיל לא נשמר לאורך זמן',
  exposure_high: 'רמת החשיפה מפחיתה את יתרון התזמון',
}

export const TRAJECTORY_LABELS = {
  breakthrough: 'פריצה',
  up: 'מתחזק',
  stable: 'יציב',
  down: 'נחלש',
  unknown: 'לא ידוע',
}

export const TREND_LABELS = {
  closing_fast: 'מתקרב במהירות',
  closing: 'מתקרב',
  stable: 'יציב',
  moving_away: 'מתרחק',
  unknown: 'לא ידוע',
}

export const TEAM_CONTEXT_LABELS = {
  supportive: 'תומך',
  neutral: 'נייטרלי',
  adverse: 'מאתגר',
  mixed: 'מעורב',
  unavailable: 'לא זמין',
}

export const COMPETITION_CONTEXT_LABELS = {
  plays_above_club_level: 'משחק מעל רמת המועדון',
  plays_at_club_level: 'משחק בהתאם לרמת המועדון',
  plays_below_club_level: 'משחק מתחת לרמת המועדון',
  unavailable: 'הקשר תחרותי לא זמין',
}

export const METRIC_LABELS = {
  games: 'משחקים',
  goals: 'שערים',
  minutes: 'דקות',
  starts: 'פתיחות',
  goalsPerGameDuration: 'קצב הבקעה',
  goalsPer90: 'שערים ל־90',
  goalsShareOfTeam: 'חלק משערי הקבוצה',
  startsPct: 'אחוז פתיחות',
  minutesPct: 'אחוז דקות',
  minutesPerGame: 'דקות למשחק',
  scoringGamesPct: 'משחקים עם שער',
  yellowCards: 'צהובים',
  yellowCardsPer90: 'צהובים ל־90',
  subIn: 'כניסות כמחליף',
  subInPct: 'אחוז כניסות כמחליף',
  subOut: 'יציאות בחילוף',
  subOutPct: 'אחוז יציאות בחילוף',
  isYoungerAgeGroup: 'שנתון צעיר',
  topClubOpportunityEligible: 'הזדמנות במועדון מוביל',
  clubLevel: 'רמת מועדון',
}

export const METRIC_UNITS = {
  games: 'משחקים',
  goals: 'שערים',
  minutes: 'דקות',
  starts: 'פתיחות',
  goalsPerGameDuration: 'שערים למשחק',
  goalsPer90: 'שערים ל־90',
  goalsShareOfTeam: 'משערי הקבוצה',
  startsPct: 'פתיחות',
  minutesPct: 'מהדקות',
  minutesPerGame: 'דקות למשחק',
  scoringGamesPct: 'משחקים עם שער',
  yellowCards: 'צהובים',
  yellowCardsPer90: 'צהובים ל־90',
  subIn: 'כניסות',
  subInPct: 'כניסות כמחליף',
  subOut: 'יציאות',
  subOutPct: 'יציאות בחילוף',
  clubLevel: 'רמת מועדון',
}

export const REASON_LABELS = {
  elite_goal_total: 'כמות שערים גבוהה',
  exceptional_goal_total: 'כמות שערים חריגה',
  minimum_minutes_sample: 'מדגם דקות מספק',
  deep_minutes_sample: 'מדגם דקות עמוק',
  enough_goal_sample: 'מדגם שערים מספק',
  strong_goal_sample: 'מדגם שערים חזק',
  elite_goals_per_game_duration: 'קצב הבקעה גבוה',
  exceptional_goals_per_game_duration: 'קצב הבקעה חריג',
  high_team_goals_share: 'תלות התקפית גבוהה',
  elite_team_goals_share: 'תלות התקפית חריגה',
  max_starter_load: 'נוכחות קבועה בהרכב',
  elite_starter_share: 'נוכחות כמעט מלאה בהרכב',
  near_full_starter: 'באנקר בהרכב',
  very_high_minutes: 'עומס דקות גבוה',
  elite_minutes_load: 'עומס דקות חריג',
  max_minutes_load: 'נוכחות גבוהה מאוד בדקות',
  defensive_goal_threat: 'איום הבקעה מעמדה אחורית',
  elite_defensive_goal_threat: 'איום הבקעה חריג מעמדה אחורית',
  younger_age_group: 'משחק בשנתון גבוה יותר',
  minimum_games_sample: 'מדגם משחקים מספק',
  deep_games_sample: 'מדגם משחקים עמוק',
  low_cards: 'משמעת נקייה',
  never_subbed_out: 'לא מוחלף',
  near_double_digit_goals: 'קרוב לדו־ספרתי בשערים',
  strong_secondary_goal_total: 'כמות שערים משנית חזקה',
  top_club_or_level_two_first_team: 'הזדמנות במועדון/רמה גבוהה',
  low_minutes_share: 'מעט דקות',
  not_younger_age_group: 'לא שנתון צעיר',
  top_club_only: 'מועדון מוביל',
  many_appearances: 'הרבה הופעות',
  low_minutes_per_appearance: 'מעט דקות להופעה',
  frequent_substitute_in: 'נכנס הרבה כמחליף',
  few_starts: 'מעט פתיחות',
}

export const REASON_SUB_LABELS = {
  minimum_minutes_sample: 'מדגם דקות מספק לקבלת החלטה ראשונית.',
  deep_minutes_sample: 'בסיס הדקות מספיק עמוק כדי לחזק את הסיגנל.',
  enough_goal_sample: 'כמות השערים כבר אינה מקרית בלבד.',
  strong_goal_sample: 'מדגם השערים חזק ביחס לפרופיל.',
  elite_goals_per_game_duration: 'קצב ההבקעה עובר את רף הפרופיל.',
  exceptional_goals_per_game_duration: 'קצב ההבקעה חריג ביחס לסביבה.',
  high_team_goals_share: 'חלק משמעותי מההתקפה עובר דרך השחקן.',
  elite_team_goals_share: 'התלות ההתקפית של הקבוצה בשחקן חריגה.',
  max_starter_load: 'השחקן מקבל אמון עקבי בהרכב.',
  elite_starter_share: 'הנוכחות בהרכב כמעט מלאה.',
  near_full_starter: 'השחקן מתפקד כשחקן הרכב קבוע.',
  very_high_minutes: 'עומס הדקות מצביע על תפקיד משמעותי.',
  elite_minutes_load: 'היקף הדקות חריג ביחס לסביבה.',
  max_minutes_load: 'השחקן כמעט לא יוצא מהרוטציה.',
  younger_age_group: 'השחקן מקבל הזדמנות מול סביבת גיל גבוהה יותר.',
  low_cards: 'היקף הכרטיסים נשאר בטווח שמאפשר לראות בו שחקן יציב ואמין.',
  never_subbed_out: 'כאשר הוא פותח, הוא כמעט לא יוצא מהרוטציה.',
  near_double_digit_goals: 'כמות השערים קרובה לרף דו־ספרתי.',
  strong_secondary_goal_total: 'כמות השערים חזקה לפרופיל איום משני.',
  low_minutes_share: 'היקף הדקות נמוך ביחס לפוטנציאל הסביבה.',
  many_appearances: 'הוא מופיע מספיק פעמים כדי לזהות דפוס שימוש.',
  low_minutes_per_appearance: 'הוא מקבל מעט דקות בכל הופעה.',
  frequent_substitute_in: 'תפקידו כרגע בעיקר כניסה מהספסל.',
  few_starts: 'מספר הפתיחות נמוך ביחס לכמות ההופעות.',
}


export const FUTURE_OUTLOOK_LABELS = {
  upside: 'הזדמנות אפשרית',
  risk: 'סביבה צפויה להתחזק',
  stable: 'יציב',
  unknown: 'לא ידוע',
}
