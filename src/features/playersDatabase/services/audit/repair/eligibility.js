// src/features/playersDatabase/services/audit/repair/eligibility.js

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const LEAGUE_TARGETS = {
  leaguesCenter: {
    label: 'תקן מרכז ליגות',
    description: 'פרטי הליגה והעונה במרכז הליגות ייבנו מחדש ממסמך הליגה ומעונות הקבוצות.',
  },
  clubsCenter: {
    label: 'תקן מרכז מועדונים',
    description: 'תוצרי הליגה בעונה שנבחרה במרכז המועדונים ייבנו מחדש מהליגה, מפרופילי המועדונים ומעונות הקבוצות.',
  },
  teamSeasonCompetitionSnapshots: {
    label: 'תקן תמונת תחרות',
    description: 'תמונת התחרות בעונת הקבוצה שנמצאה בבדיקה תסונכרן עם טבלת הליגה. מסמך עונת הקבוצה יישמר.',
  },
}

const STATS_TARGETS = {
  arrivalHistory: {
    label: 'תקן נתוני עבר של מצטרף',
    description: 'תקציר הסקאוט והחוליה של המצטרף ייבנה מחדש מעונת קבוצת המקור.',
  },
  playerSeason: {
    label: 'תקן עונת שחקן',
    description: 'נתוני הסטטיסטיקה והסקאוט של השחקן בקבוצה שנבדקה ישוחזרו מעונת הקבוצה. קשרי קבוצות אחרות יישמרו.',
  },
  playerSearchIndex: {
    label: 'תקן אינדקס שחקן',
    description: 'אינדקס החיפוש של השחקן בקבוצה ובעונה שנבדקו ייבנה מחדש ממסמכי המקור.',
  },
  leagueMetadata: {
    label: 'תקן נתוני קבוצה בליגה',
    description: 'מצב טעינת הסטטיסטיקה וסיכום הסקאוט של הקבוצה בליגה יסונכרנו עם עונת הקבוצה.',
  },
  leaguesCenter: {
    label: 'תקן מרכז ליגות',
    description: 'כדי לתקן את נתוני הקבוצה, תוצרי הליגה והעונה שנבדקו במרכז הליגות ייבנו מחדש. מסמכי השחקנים לא ישתנו.',
  },
  clubsCenter: {
    label: 'תקן מרכז מועדונים',
    description: 'כדי לתקן את נתוני הקבוצה וההעברות, תוצרי הליגה והעונה שנבדקו במרכז המועדונים ייבנו מחדש. מסמכי השחקנים לא ישתנו.',
  },
}

const blocked = reason => ({ allowed: false, reason, label: 'תיקון לא זמין', description: '' })

export const getFocusedAuditFindingKey = finding => JSON.stringify([
  clean(finding && finding.type),
  clean(finding && finding.target),
  clean(finding && finding.documentId),
  clean(finding && finding.field),
])

export const inspectFocusedAuditRepair = ({ scope = {}, finding = {} } = {}) => {
  if (!['league', 'team', 'player'].includes(scope.type)) {
    return blocked('יש להריץ בדיקה ממוקדת לפני התיקון.')
  }
  if (!clean(scope.leagueId) || !clean(scope.seasonId)) {
    return blocked('לביצוע התיקון נדרשים מזהי הליגה והעונה שנבדקו.')
  }
  if (scope.type !== 'league' && !clean(scope.teamId)) {
    return blocked('לביצוע התיקון נדרש מזהה הקבוצה שנבדקה.')
  }
  if (scope.type === 'player' && !clean(scope.playerId)) {
    return blocked('לביצוע התיקון נדרש מזהה השחקן שנבדק.')
  }
  if (['missing_canonical', 'missing_canonical_dependency'].includes(finding.type)) {
    return blocked(finding.target === 'clubProfile'
      ? 'פרופיל המועדון המקורי חסר. יש להשלים אותו לפני שחזור התוצרים.'
      : 'מסמך המקור חסר. יש להשלים את טעינת הליגה או הסגל לפני שחזור התוצרים.')
  }
  const allowedTypes = scope.type === 'league'
    ? ['projection_mismatch', 'missing_projection', 'stale_projection']
    : ['projection_mismatch', 'missing_document', 'missing_projection']
  if (!allowedTypes.includes(finding.type)) {
    return blocked('לסוג התקלה הזה אין תיקון עצמאי ממקורות הנתונים הקיימים.')
  }
  const targets = scope.type === 'league' ? LEAGUE_TARGETS : STATS_TARGETS
  const target = Object.prototype.hasOwnProperty.call(targets, finding.target)
    ? targets[finding.target]
    : null
  if (!target) return blocked('התקלה דורשת טיפול בנתוני המקור ואינה ניתנת לתיקון תוצרים.')
  return { allowed: true, reason: '', ...target }
}
