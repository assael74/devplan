# Abilities Engine Overview

התיקייה `engine` מרכזת את מנוע החישוב של יכולת, פוטנציאל ומהימנות לשחקן.

המטרה של הפירוק היא להפריד בין:
- הגדרות עסקיות
- פונקציות עזר
- לוגיקת תאריכים וחלונות הערכה
- נרמול טפסים
- מיזוג היסטורי בין חלונות
- חישוב ציונים ומהימנות
- כתיבה ל־Firestore

---

## מבנה הקבצים

### `abilitiesHistory.constants.js`
קובץ הקבועים של המנוע.

אחראי על:
- גודל חלון הערכה (`WINDOW_DAYS`)
- טווח ציונים מותר
- משקלי תחומים ליכולת
- משקלי תחומים לפוטנציאל
- טבלאות תיקון של `growthStage`
- סטטוסי מהימנות

שינוי בקובץ הזה משפיע על מדיניות החישוב, בלי לשנות את מבנה המנוע.

---

### `abilitiesHistory.utils.js`
פונקציות עזר כלליות.

אחראי על:
- ניקוי טקסטים (`safeStr`)
- המרה למספר (`toNum`)
- עיגולים (`round1`, `round2`, `roundToHalf`)
- הגבלת ערך לטווח (`clamp`)
- בדיקת ערך שמולא (`isFilled`)
- המרות תאריך (`toIsoDateOnly`, `parseIsoDateOnly`)

זהו קובץ שירות בלבד, ללא לוגיקה עסקית של יכולת.

---

### `abilitiesHistory.dates.js`
לוגיקת תאריכים וחלונות הערכה.

אחראי על:
- קבלת `evalDate`
- מיפוי התאריך לחלון הערכה
- החזרת:
  - `evalDate`
  - `windowKey`
  - `windowStart`
  - `windowEnd`
  - `sortTime`

זה הקובץ שקובע לאיזה חלון כל טופס שייך.

אם בעתיד משתנה שיטת חלונות ההערכה, זה הקובץ המרכזי לעדכון.

---

### `abilitiesHistory.forms.js`
נרמול והכנת טפסים.

אחראי על:
- נרמול abilities לצורה מלאה (`normalizeAbilities`)
- יצירת `formEntry` חדש לשמירה (`buildFormEntry`)
- נרמול טופס קיים שנשלף מהאחסון (`normalizeStoredForm`)

המטרה היא שכל טופס, חדש או ישן, ייכנס למנוע באותו מבנה.

---

### `abilitiesHistory.windows.js`
לוגיקת חלונות והיסטוריה.

אחראי על:
- קיבוץ טפסים לפי חלון (`groupFormsByWindow`)
- ממוצע בין מעריכים באותו חלון (`averageRatings`)
- בחירת `growthStage` עדכני בחלון (`resolveLatestGrowthStage`)
- בניית snapshot לחלון (`buildWindowSnapshot`)
- מיזוג היסטורי בין חלונות לפי 30% ישן ו־70% חדש (`mergeWindowAbilitiesHistory`)

זה הקובץ שמחליף את הלוגיקה הישנה שהתבססה על `playersAbilities`.

כאן קורה המעבר מ:
- אוסף טפסים גולמיים  
אל:
- abilities ממוזג לפי היסטוריית חלונות

---

### `abilitiesHistory.scoring.js`
לוגיקת החישוב העסקית.

אחראי על:
- בניית metadata של דומיינים (`getDomainsMeta`)
- חישוב ציון תחום (`calcDomainFromAbilities`)
- חישוב כיסוי תחום
- קביעת תקפות ומהימנות תחום
- חישוב יכולת כללית (`calcWeightedOverallFromDomains`)
- חישוב פוטנציאל (`calcPotentialScore`)
- קביעת מהימנות כללית ליכולת ולפוטנציאל
- בניית תוצאה סופית לשחקן (`buildFinalPlayerResult`)

זהו הקובץ שמוציא את התוצאה העסקית הסופית:
- `abilities`
- `domainScores`
- `domainsMeta`
- `level`
- `levelPotential`
- `reliability`
- `coverage`
- `validDomainsCount`

---

## שכבת Firestore

### `src/services/firestore/shorts/abilities/abilitiesUpsertHistory.js`

זה לא חלק מהמנוע עצמו, אלא שכבת הכתיבה למסד.

אחראי על:
- קבלת `draft`
- שליפת מסמך ההיסטוריה של השחקן מתוך `abilitiesShorts`
- הוספת הטופס החדש ל־`formsAbilities`
- הרצת מנוע החישוב על כלל הטפסים
- כתיבת תוצאה סופית ל־`playersShorts.playersAbilities`
- שמירת raw forms + windows ב־`abilitiesShorts`

---

## הזרימה המלאה

### 1. טופס חדש נכנס
הקריאה מתחילה ב־`upsertAbilitiesHistory.js`

### 2. הטופס מנורמל
`abilitiesHistory.forms.js`

### 3. נקבע חלון ההערכה
`abilitiesHistory.dates.js`

### 4. כל הטפסים מקובצים לפי חלונות
`abilitiesHistory.windows.js`

### 5. בתוך כל חלון מבוצע איחוד בין מעריכים
`abilitiesHistory.windows.js`

### 6. בין חלונות מבוצע מיזוג היסטורי
`abilitiesHistory.windows.js`

### 7. מחושבים תחומים, יכולת, פוטנציאל ומהימנות
`abilitiesHistory.scoring.js`

### 8. נשמרת התוצאה הסופית ל־Firestore
`abilitiesUpsertHistory.js`

---

## עקרון ארכיטקטוני חשוב

### מקור האמת לחישוב
מקור האמת הוא:
- `abilitiesShorts.formsAbilities`

### תוצאה מחושבת סופית
התוצאה המחושבת נשמרת ב:
- `playersShorts.playersAbilities`

כלומר:
- `formsAbilities` = input
- `playersAbilities` = output

ולא להפך.

---

## למה הפירוק הזה חשוב

בעבר החישוב התבסס על `playersAbilities`, כלומר על תוצאה שכבר חושבה, וזה יצר שגיאה לוגית.

הפירוק החדש מוודא:
- שהחישוב תמיד נשען על כלל הטפסים
- שיש הבחנה בין איחוד באותו חלון לבין מיזוג בין חלונות
- ש־`growthStage` לא מתמזג כמו שאר היכולות
- שאפשר לבדוק כל שכבה בנפרד

---

## מתי נוגעים בכל קובץ

- שינוי משקלים / תיקונים / ספים → `abilitiesHistory.constants.js`
- שינוי פונקציות בסיס → `abilitiesHistory.utils.js`
- שינוי שיטת חלונות → `abilitiesHistory.dates.js`
- שינוי shape של raw form → `abilitiesHistory.forms.js`
- שינוי מיזוג בין טפסים / חלונות → `abilitiesHistory.windows.js`
- שינוי לוגיקת ציון / פוטנציאל / מהימנות → `abilitiesHistory.scoring.js`
- שינוי write flow למסד → `abilitiesUpsertHistory.js`

---

## הערה להמשך

אם בעתיד תרצה להרחיב את המנוע, נכון לשמור על ההפרדה:

- normalization
- windows
- scoring
- persistence

ולא להחזיר הכול לקובץ אחד גדול.
