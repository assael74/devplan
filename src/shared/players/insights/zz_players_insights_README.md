# Player Insights Engine

## מה האזור הזה מבצע

אזור `shared/players/insights` בונה תובנות ביצוע בפועל לשחקנים על בסיס ציוני המשחק ממנוע ה־scoring.

המנוע מקבל ציוני משחק, מחשב לכל שחקן ציון עונתי / תקופתי, TVA, סטטיסטיקות עזר, תנודתיות, אמינות וסיווג פרופיל ביצוע.

הפלט המרכזי הוא רשימת שחקנים מסווגת לפרופילי ביצוע כמו:

- עוגן סטטיסטי
- בורג מרכזי
- נקודת תורפה
- הג׳וקר
- לא יציב
- תורם משני
- מחוץ למדגם

חשוב: אלו פרופילי ביצוע של המערכת, לא מעמד שהמאמן הגדיר.

---

## הזרימה המרכזית

```txt
games / scoped scores
  ↓
buildScopedGameScores
  ↓
buildPlayerSeasonScore
  ↓
buildPlayerInsightStats
  ↓
classifyPlayerInsight
  ↓
buildPlayerInsightProfile
  ↓
buildPlayersInsightsFromGames
```

---

## מתי לחפש כאן

חפש כאן כאשר צריך להבין או לשנות:

- איך שחקן מקבל פרופיל תובנה.
- למה שחקן סווג כעוגן / נקודת תורפה / ג׳וקר / מחוץ למדגם.
- איך מחושבים סטיית תקן, טווח, משחקים טובים ומשחקים חלשים.
- איך ציוני משחק הופכים לשורת תובנה לשחקן.
- איך ממיינים שחקנים לפי פרופיל ביצוע.
- איך מכינים rows למסכי UI, דוחות או הדפסה.
- איך מכיילים thresholds של פרופילי ביצוע.

---

## קבצי האזור

### `insights.config.js`

קובץ ספי הסיווג של מנוע התובנות.

אחראי על:

- רף דקות קשיח ליציאה מהמדגם.
- רף דקות רך ליציאה מהמדגם.
- רף דקות למדגם אמין.
- רף דקות למדגם חזק.
- רף דקות לשחקן מרכזי.
- רף דקות לשחקן עם עומס גבוה.
- ספי ציון ו־TVA לעוגן סטטיסטי.
- ספי ציון ו־TVA לג׳וקר.
- ספי ציון ו־TVA לנקודת תורפה.
- ספי תנודתיות.
- סף משחק גבוה.
- סף משחק נמוך.
- התאמת ספים ל־scope תקופתי במקום עונה מלאה.

חפש כאן כשצריך לכייל את המודל או לשנות את “מדיניות הסיווג”.

---

### `insights.profiles.js`

קטלוג פרופילי הביצוע של המערכת.

אחראי על:

- הגדרת מזהה לכל פרופיל.
- תמיכה במזהה legacy.
- label מלא.
- label קצר.
- tone לתצוגה.
- icon לתצוגה.
- תיאור מקצועי.
- טקסט פעולה למאמן.
- פונקציית שליפה לפי מזהה פרופיל.

הפרופילים הקיימים:

- `stat_anchor` — עוגן סטטיסטי.
- `joker` — הג׳וקר.
- `core_worker` — בורג מרכזי.
- `secondary_contributor` — תורם משני.
- `unstable` — לא יציב.
- `weak_spot` — נקודת תורפה.
- `out_of_sample` — מחוץ למדגם.

חפש כאן כשצריך לשנות שם, צבע, אייקון, תיאור או טקסט המלצה של פרופיל.

---

### `insights.classify.js`

מנוע הסיווג של שחקן לפרופיל ביצוע.

אחראי על:

- קבלת נתוני ביצוע מסכמים של שחקן.
- התאמת thresholds לפי מצב עונה או scope.
- חישוב ספי TVA יחסיים לכמות משחקים.
- חישוב ספי דקות יחסיים לאורך ה־scope.
- בדיקת יציאה מהמדגם.
- בדיקת עוגן סטטיסטי.
- בדיקת ג׳וקר.
- בדיקת נקודת תורפה.
- בדיקת תנודתיות.
- בדיקת בורג מרכזי.
- החזרת פרופיל ברירת מחדל כתורם משני.

הקלט המרכזי:

```js
{
  ratingRaw,
  tva,
  minutes,
  std,
  range,
  min,
  mode,
  scopeMaxMinutes,
  scopeGames,
}
```

חפש כאן כששחקן מקבל סיווג לא צפוי.

---

### `insights.stats.js`

מחשב סטטיסטיקות עזר מתוך ציוני משחק של שחקן.

אחראי על:

- סינון ציוני משחק תקינים.
- חילוץ ratings.
- חישוב ממוצע.
- חישוב סטיית תקן.
- חישוב מינימום.
- חישוב מקסימום.
- חישוב טווח.
- סכימת דקות.
- סכימת שערים.
- סכימת בישולים.
- חישוב מעורבות.
- ספירת משחקים גבוהים.
- ספירת משחקים נמוכים.

חפש כאן כשצריך להבין נתוני תנודתיות, יציבות, משחקים טובים/חלשים או סטטיסטיקות בסיס לתובנה.

---

### `insights.model.js`

בונה את מודל התובנות המלא לשחקנים.

אחראי על:

- קבלת משחקים או ציוני משחק מוכנים.
- הפעלת מנוע scoring לפי scope.
- בניית metadata לסיווג.
- קיבוץ ציונים לפי שחקן.
- בניית ציון עונתי / תקופתי לכל שחקן.
- בניית סטטיסטיקות תובנה לכל שחקן.
- הפעלת classifier.
- בניית flags לתצוגה.
- בניית subStatus.
- החזרת row מלא לכל שחקן.
- מיון השחקנים לפי סדר פרופילים.
- בניית counts.
- בניית summary כללי.

פונקציות מרכזיות:

- `buildPlayerInsightProfile`
- `buildPlayersInsightsFromGameScores`
- `buildPlayersInsightsFromGames`

חפש כאן כשצריך להבין איך ציוני המשחק הופכים לטבלת תובנות שחקנים.

---

### `insights.debug.js`

כלי debug לפיתוח וכיול.

אחראי על:

- הדפסת נתוני scope לקונסול.
- הדפסת טבלת כל השחקנים.
- הדפסת סיכום לפי קטגוריות.
- הדפסת שחקני עוגן.
- הדפסת נקודות תורפה.
- הדפסת שחקנים לא יציבים.
- הדפסת תורמים משניים.
- הדפסת בורג מרכזי.

הפונקציה המרכזית:

- `printPlayersInsightsDebug`

חפש כאן כשצריך לבדוק במהירות איך המודל מסווג בפועל את כל השחקנים.

---

## מבני פלט מרכזיים

### שורת תובנה לשחקן

```js
{
  playerId,
  photo,
  playerFullName,

  profile,
  insight,
  insightId,
  legacyInsightId,
  insightLabel,

  subStatus,
  role,
  positionLayer,

  ratingRaw,
  rating,
  tva,

  games,
  minutes,

  goals,
  assists,
  involvement,

  avg,
  max,
  min,
  std,
  range,

  highGames,
  lowGames,

  reliability,
  reliabilityLabel,

  flags,

  seasonScore,
  scores,

  classificationMeta,
  scopeGames,
  scopeMaxMinutes,
}
```

---

### פלט מלא של `buildPlayersInsightsFromGames`

```js
{
  rows,

  scopedScores,
  classificationMeta,

  scope,

  counts: {
    allGames,
    filteredGames,
    scopedGames,
    scores,
    players,
  },

  summary: {
    avgRating,
    totalTva,
    totalMinutes,
  },
}
```

---

### classification meta

```js
{
  mode,
  scopeGames,
  scopeMaxMinutes,
}
```

משמש להתאמת thresholds כאשר עובדים על scope קצר ולא על עונה מלאה.

---

## סדר פרופילים בתצוגה

הסדר הפנימי ב־`insights.model.js`:

1. `stat_anchor`
2. `core_worker`
3. `weak_spot`
4. `joker`
5. `unstable`
6. `secondary_contributor`
7. `out_of_sample`

בתוך אותו פרופיל, השחקנים ממוינים לפי `ratingRaw` מהגבוה לנמוך.

---

## מפת חיפוש מהירה

| מה מחפשים | קובץ |
|---|---|
| ספי סיווג | `insights.config.js` |
| שמות / צבעים / אייקונים / טקסטים של פרופילים | `insights.profiles.js` |
| למה שחקן סווג לפרופיל מסוים | `insights.classify.js` |
| סטיית תקן / טווח / משחקים גבוהים ונמוכים | `insights.stats.js` |
| בניית rows למסכים ודוחות | `insights.model.js` |
| מיון שחקנים לפי פרופילים | `insights.model.js` |
| בדיקת תוצאות בקונסול | `insights.debug.js` |
| התאמת מודל ל־scope קצר | `insights.classify.js` + `insights.config.js` |
| חיבור לציוני scoring | `insights.model.js` |

---

## סדר קריאה מומלץ

כדי להבין את האזור מהר:

1. `insights.profiles.js`
2. `insights.config.js`
3. `insights.classify.js`
4. `insights.stats.js`
5. `insights.model.js`
6. `insights.debug.js`

---

## קשר למנוע scoring

אזור `insights` יושב מעל מנוע `scoring`.

`scoring` מחשב:

- ציון משחק.
- ציון עונתי.
- TVA.
- אמינות.

`insights` משתמש בתוצרים האלה כדי לבנות:

- פרופיל ביצוע.
- שורת תובנה לשחקן.
- סטטיסטיקות תומכות.
- סיכום קבוצתי.
- מבנה מוכן ל־UI / דוח / הדפסה.
