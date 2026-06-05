// src/features/hub/playerProfile/sharedModules/games/model/index.js

// אחראי על חילוץ מזהים למסלול סטטיסטיקה של שחקן
export * from './playerGamesStats.helpers.js'

// הכנת הנתונים לטופס הסטטיסטיקה במסלול פרופיל שחקן
export * from './playerGamesStatsForm.helpers.js'

// אחראי על בניית מודל הנתונים של משחקי השחקן: שחקן חי, קבוצה, משחקים, פילטרים, מיון ונתוני תצוגה
export * from './usePlayerGamesCoreModel.js'

// אחראי על ניהול state ו־handlers מקומיים של ה־UI במודול משחקי שחקן
export * from './usePlayerGamesUiState.js'

//  אחראי על פעולות טופס הסטטיסטיקה במסלול שחקן: פתיחה, טעינה, שמירה ומחיקה
export * from './usePlayerGamesStatsActions.js'
