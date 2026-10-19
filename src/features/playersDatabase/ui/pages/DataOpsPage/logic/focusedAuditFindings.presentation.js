// src/features/playersDatabase/ui/pages/DataOpsPage/logic/focusedAuditFindings.presentation.js

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const TARGET_LABELS = {
  teamSeason: 'עונת הקבוצה',
  counterpartTeamSeason: 'עונת הקבוצה השנייה במעבר',
  teamSeasonCompetitionSnapshots: 'נתוני התחרות בעונת הקבוצה',
  playerRoot: 'מסמך השחקן',
  playerSeason: 'עונת השחקן',
  playerSearchIndex: 'אינדקס חיפוש השחקן',
  leagueMetadata: 'נתוני הקבוצה בליגה',
  leaguesCenter: 'מרכז הליגות',
  clubsCenter: 'מרכז המועדונים',
  teamSignals: 'משפחות איתותים',
  clubProfile: 'פרופיל המועדון',
  statsAudit: 'מקורות בדיקת הקבוצה',
}

const FIELD_LABELS = {
  teamSignalSummary: 'סיכום משפחות האיתותים',
  stats: 'סטטיסטיקה',
  scouting: 'סקאוטינג',
  scout: 'נתוני סקאוטינג',
  scoutEvidence: 'בסיס נתוני הסקאוטינג',
  statsStatus: 'מצב הנתונים הסטטיסטיים',
  movement: 'מעברי שחקנים',
  transfers: 'סיכום מעברי שחקנים',
  competitionSnapshot: 'נתוני התחרות',
  competitionProjection: 'תחזית התחרות',
  documentationState: 'מצב התיעוד',
  documentationStateUpdatedAt: 'מועד עדכון התיעוד',
  updatedAt: 'מועד העדכון',
  identity: 'פרטי הזהות',
  seasonIdentity: 'פרטי העונה',
  profile: 'פרטי המועדון',
  expectedLevelDelta: 'פער הרמה הצפוי',
  scoutEffectiveImmediacyStatus: 'מוכנות השחקן',
  scoutProfileIds: 'פרופילי סקאוטינג',
  scoutCombinationIds: 'שילובי סקאוטינג',
  scoutProfileSearchIds: 'פרופילי החיפוש',
}

const fieldLabel = field => {
  if (field.startsWith('seasonRefsById.')) return 'הפניה לעונת השחקן'
  const lastPart = field.split('.').pop()
  return FIELD_LABELS[lastPart] || ''
}

export const presentFocusedAuditFinding = (finding = {}) => {
  const target = TARGET_LABELS[finding.target] || clean(finding.target) || 'נתוני המאגר'
  const field = fieldLabel(clean(finding.field))
  const subject = field ? `${field} · ${target}` : target
  const type = clean(finding.type)
  const details = {
    missing_document: ['מסמך חסר', 'המסמך שהבדיקה מצפה למצוא אינו קיים.', 'warning'],
    missing_projection: ['תוצר חסר', 'נתונים שאמורים להיבנות ממסמכי המקור חסרים בתוצר.', 'warning'],
    projection_mismatch: ['אי־התאמה', 'הנתונים השמורים שונים מהנתונים המחושבים ממסמכי המקור.', 'warning'],
    source_mismatch: ['אי־התאמה', 'הנתונים השמורים שונים ממסמך המקור.', 'warning'],
    stale_projection: ['נתונים שאינם נדרשים', 'נשארו נתונים שהמקור הקנוני כבר אינו מחייב.', 'warning'],
    orphan_projection: ['תוצר יתום', 'התוצר נשאר ללא מקור קנוני תקין.', 'warning'],
    unexpected_document: ['מסמך שאינו נדרש', 'המסמך קיים אף שמצב הנתונים שנבדק אינו מחייב אותו.', 'warning'],
    invalid_identity: ['זהות לא תקינה', 'מזהה המסמך או פרטי הזהות אינם תואמים למקור.', 'danger'],
    broken_relation: ['קשר שבור', 'הפניה בין המסמכים חסרה או מפנה למסמך שגוי.', 'danger'],
    missing_canonical: ['מקור חסר', 'חסר מסמך מקור שנדרש לבנייה בטוחה של הנתונים.', 'danger'],
    missing_canonical_dependency: ['מקור חסר', 'חסר מסמך מקור שנדרש לבנייה בטוחה של הנתונים.', 'danger'],
  }[type] || ['ממצא', 'נמצא פער בנתונים שנבדקו.', 'info']
  const sourceMissing = finding.field === 'missing_team_season'
    ? 'מסמך עונת הקבוצה חסר ולכן לא ניתן לחשב את הנתונים הצפויים.'
    : finding.field === 'missing_league'
      ? 'מסמך הליגה חסר ולכן לא ניתן לחשב את הנתונים הצפויים.'
      : ''
  const hebrewReason = /[\u0590-\u05FF]/.test(clean(finding.reason)) ? clean(finding.reason) : ''

  return {
    target,
    label: details[0],
    tone: details[2],
    title: clean(finding.title) || `${details[0]} · ${subject}`,
    description: sourceMissing || hebrewReason || details[1],
  }
}

export const formatFocusedAuditValue = value => {
  if (value === null || value === undefined) return 'אין ערך'
  if (value === 'present') return 'קיים'
  if (value === 'missing') return 'חסר'
  if (value === true) return 'כן'
  if (value === false) return 'לא'
  return typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
}

export const getFocusedAuditScopeDetails = scope => [
  ['סוג הבדיקה', { league: 'ליגה', team: 'קבוצה', player: 'שחקן' }[scope && scope.type]],
  ['עונה', scope && scope.seasonId],
  ['ליגה', scope && scope.leagueId],
  ['קבוצה', scope && scope.type !== 'league' && scope.teamId],
  ['שחקן', scope && scope.type === 'player' && scope.playerId],
].filter(([, value]) => value)
