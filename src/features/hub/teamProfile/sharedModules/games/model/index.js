// src/features/hub/teamProfile/sharedModules/games/model/index.js

//  אחראי על בניית מודל הנתונים של משחקי הקבוצה: קבוצה חיה, משחקים, scoring, פילטרים, מיון ונתוני תצוגה
export * from './useTeamGamesCoreModel.js'

//  אחראי על ניהול state ו־handlers מקומיים של ה־UI במודול משחקי קבוצה
export * from './useTeamGamesUiState.js'

// אחראי על פעולות טופס הסטטיסטיקה במסלול קבוצה: פתיחה, טעינה, שמירה ומחיקה
export * from './useTeamGamesStatsActions.js'

// אחראי על ייבוא משחקים בכמות מתוך טבלה מודבקת
export * from './useTeamGamesImportActions.js'

// אחראי על פעולות מחיקת משחקים בכמות
export * from './useTeamGamesDeleteActions.js'
