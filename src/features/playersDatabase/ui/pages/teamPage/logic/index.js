// features/playersDatabase/ui/pages/teamPage/logic/index.js

/**
 * Team page UI logic
 *
 * teamPage.constants.js
 * - קבועים, אפשרויות ותצורות של עמוד הקבוצה.
 *
 * teamPage.utils.js
 * - פונקציות נרמול ועזר משותפות לעמוד הקבוצה.
 *
 * teamRosterImport.logic.js
 * - המרת נתוני סגל מודבקים לשורות preview.
 *
 * teamStatsImport.headers.js
 * - זיהוי ונרמול כותרות של קובצי סטטיסטיקה.
 *
 * teamStatsImport.rows.js
 * - זיהוי מבני שורה ופריסות fallback של נתוני סטטיסטיקה.
 *
 * teamStatsImport.logic.js
 * - תזמור parsing של נתוני הסטטיסטיקה ל-preview אחיד.
 *
 * teamStatsMatch.logic.js
 * - התאמת שורות הייבוא לשחקני הסגל הקיימים.
 *
 * teamStatsScout.logic.js
 * - חישוב והצגת פרופילי סקאוט מנתוני הסטטיסטיקה.
 *
 * writeFlowReport.logic.js
 * - בניית דוח UI מפעולות כתיבה מלאות או חלקיות.
 */

export * from './teamPage.constants.js'
export * from './teamPage.utils.js'
export * from './teamRosterImport.logic.js'
export * from './teamStatsImport.logic.js'
export * from './teamStatsMatch.logic.js'
export * from './teamStatsScout.logic.js'
