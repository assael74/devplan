// src/shared/players/insights/insights.profiles.js

/*
|--------------------------------------------------------------------------
| Player Insights Engine / Profiles
|--------------------------------------------------------------------------
|
| אחריות:
| קטלוג פרופילי הביצוע בפועל של שחקן.
|
| הפרדה טרמינולוגית:
| - Input של מאמן: מעמד מתוכנן.
| - Output של מערכת: פרופיל ביצוע בפועל.
|
| לכן אין כאן מונחים כמו "שחקן מפתח", "שחקן רוטציה",
| או "שולי סגל" כתוויות מערכת.
*/

export const PLAYER_INSIGHT_PROFILES = {
  stat_anchor: {
    id: 'stat_anchor',
    legacyId: 'mvp',
    label: 'עוגן סטטיסטי',
    shortLabel: 'עוגן',
    tone: 'success',
    icon: 'anchor',
    description:
      'שחקן עם השפעה מצטברת חריגה, הרבה דקות ויעילות גבוהה לאורך זמן.',
    coachText:
      'השחקן מייצר ערך משמעותי לקבוצה בפועל. מומלץ לנטר עומסים ולוודא שהשימוש הגבוה בו לא מייצר סיכון פציעה.',
  },

  joker: {
    id: 'joker',
    legacyId: 'secret_weapon',
    label: "הג'וקר",
    shortLabel: "ג'וקר",
    tone: 'success',
    icon: 'joker',
    description:
      'שחקן עם יעילות גבוהה בזמן משחק מוגבל יחסית.',
    coachText:
      'השחקן מנצל היטב את הדקות שהוא מקבל. מומלץ לבחון הגדלת דקות או שימוש ממוקד יותר במצבי משחק שבהם צריך שינוי.',
  },

  core_worker: {
    id: 'core_worker',
    legacyId: 'core_worker',
    label: 'בורג מרכזי',
    shortLabel: 'בורג מרכזי',
    tone: 'primary',
    icon: 'worker',
    description:
      'שחקן יציב שמשחק הרבה, נמצא סביב הממוצע או מעליו, ואינו מייצר נזק מצטבר משמעותי.',
    coachText:
      'השחקן מחזיק חלק חשוב מהמערכת לאורך זמן. לא תמיד מייצר מספרים חריגים, אך אפשר לסמוך עליו במסגרת התפקוד הקבוצתי.',
  },

  secondary_contributor: {
    id: 'secondary_contributor',
    legacyId: 'rotation_player',
    label: 'תורם משני',
    shortLabel: 'תורם משני',
    tone: 'primary',
    icon: 'contributor',
    description:
      'שחקן עם תרומה בסיסית או בינונית, ללא השפעה חיובית מובהקת וללא נזק חריג.',
    coachText:
      'השחקן מספק עומק ותפקוד בסיסי, אך כרגע לא מייצר ערך שמצדיק הגדרה מקצועית גבוהה יותר.',
  },

  unstable: {
    id: 'unstable',
    legacyId: 'roller_coaster',
    label: 'לא יציב',
    shortLabel: 'לא יציב',
    tone: 'warning',
    icon: 'unstable',
    description:
      'שחקן עם תנודתיות גבוהה ומשחקי נפילה אמיתיים לצד משחקים טובים.',
    coachText:
      'השחקן מציג פערים חדים בין משחקים. מומלץ לבחון הקשר טקטי, עומס, ביטחון וקבלת החלטות לפני שמבנים עליו כעוגן קבוע.',
  },

  weak_spot: {
    id: 'weak_spot',
    legacyId: 'weak_link',
    label: 'נקודת תורפה',
    shortLabel: 'נקודת תורפה',
    tone: 'danger',
    icon: 'weakSpot',
    description:
      'שחקן עם דקות משמעותיות והשפעה שלילית מצטברת על יעדי הקבוצה או העמדה.',
    coachText:
      'השחקן מקבל נפח דקות גבוה אך מייצר פגיעה מצטברת. מומלץ לבחון הורדת דקות, שינוי תפקיד, ליווי נקודתי או חיזוק בעמדה.',
  },

  out_of_sample: {
    id: 'out_of_sample',
    legacyId: 'fringe',
    label: 'מחוץ למדגם',
    shortLabel: 'מחוץ למדגם',
    tone: 'warning',
    icon: 'fringe',
    description:
      'השחקן לא צבר מספיק דקות או מספיק ציונים תקפים כדי לגזור מסקנה סטטיסטית חזקה.',
    coachText:
      'אין מספיק בסיס נתונים כדי להסיק מסקנה מקצועית יציבה. מומלץ להתייחס בזהירות לכל נתון מספרי לגביו.',
  },
}

export const getPlayerInsightProfile = (id) => {
  return (
    PLAYER_INSIGHT_PROFILES[id] ||
    PLAYER_INSIGHT_PROFILES.secondary_contributor
  )
}
