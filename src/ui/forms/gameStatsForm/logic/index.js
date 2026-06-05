// src/ui/forms/gameStatsForm/logic/index.js

// לוגיקת בחירת/ניהול שחקנים בטופס.
export * from './players.logic.js'
// לוגיקת בחירת/הצגת פרמטרים סטטיסטיים בטופס.
export * from './parms.logic.js'
// לוגיקת בניית שדות מילוי, progress ו־triplet inputs בשלב Entry.
export * from './entry.logic.js'
// ל־patches של פעולות Step Entry.
export * from './entryStep.logic.js'
//  לוגיקת rows, totals וערכי תצוגה לשלב Summary.
export * from './summary.logic.js'
//  קבועים גלובליים של טופס הסטטיסטיקה.
export * from './core/form.constants.js'
// helpers כלליים של טופס הסטטיסטיקה.
export * from './core/form.helpers.js'
//  לוגיקת ניהול ועדכון draft של הטופס.
export * from './draft/draft.logic.js'
//  יצירת draft התחלתי לטופס.
export * from './draft/draft.init.js'
//  בניית/עדכון שחקנים בתוך draft.
export * from './draft/draft.players.js'
//  בניית/עדכון פרמטרים בתוך draft.
export * from './draft/draft.parms.js'
//  בניית draft מתוך gameStatsShorts קיים.
export * from './draft/draft.fromDoc.js'
//  בניית payload לשמירה מתוך draft.
export * from './save/payload.logic.js'
//  בניית preview/מודל תצוגה לפני שמירה.
export * from './save/savePreview.logic.js'
