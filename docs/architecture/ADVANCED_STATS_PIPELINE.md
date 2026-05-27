# DevPlan — Advanced Stats Pipeline

מסמך זה מתאר את תהליך האחסון, העדכון והצריכה של סטטיסטיקה מתקדמת בפרויקט `devplan`.

מיקום יעד בפרויקט:

```txt
C:\projects\devplan\docs\architecture\ADVANCED_STATS_PIPELINE.md
```

> חובה לעדכן את המסמך הזה בכל שינוי במבנה Firestore, בתהליך העדכון, במבנה המסמכים, בשמות השדות, או בלוגיקת הסנכרון של סטטיסטיקה מתקדמת.  
> מטרת המסמך היא לאפשר ל־AI, למפתח או לצ׳אט חדש להבין במהירות את התהליך בלי הסברים חוזרים.

---

## 01 — מטרת התהליך

מטרת מסלול הסטטיסטיקה המתקדמת היא לשמור נתוני סטטיסטיקה בצורה שמאזנת בין:

1. חיסכון בקריאות Firestore בכניסה לאפליקציה.
2. מניעת מסמכים גדולים מדי באובייקטים ראשיים.
3. חיסכון בחישובים כבדים בזמן טעינה.
4. שמירת מקור אמת ברור לסטטיסטיקה פר־משחקית.
5. אפשרות לעדכון ידני, Live Tagging או ייבוא עתידי דרך אותו pipeline.

הבחירה הארכיטקטונית המרכזית:

```txt
יותר כתיבות בזמן שמירה
פחות קריאות וחישובים בזמן טעינה
```

הנחת עבודה:
סטטיסטיקה למשחק נכתבת בדרך כלל פעם אחת או במספר קטן של תיקונים, ולכן עדיף לשלם על מספר כתיבות בזמן השמירה כדי לחסוך קריאות וחישובים חוזרים בכל טעינה של האפליקציה.

---

## 02 — עיקרון מרכזי

Live Tagging הוא לא מודל האחסון.

Live Tagging הוא רק ערוץ הזנה אחד מתוך כמה אפשריים:

```txt
Manual Stats Update
Live Tagging
CSV / Import עתידי
```

כל ערוצי ההזנה צריכים להתנקז לאותו מסלול עדכון סטטיסטיקה.

המודל המרכזי הוא:

```txt
Input Channel
→ Stats Draft / Full Stats Save
→ gameStatsShorts detail doc
→ gamesShorts lightweight pointer + status
→ Aggregated Player Stats
→ Aggregated Team Stats
```

העיקרון החשוב:

```txt
gameId = מזהה המשחק
gameStatsDocId = מזהה מסמך הסטטיסטיקה הכבד
```

אין להסתמך על `gameId` כמזהה מסמך הסטטיסטיקה.
ביצירת סטטיסטיקה ראשונה למשחק יש ליצור `gameStatsDocId` ייעודי ולשמור אליו pointers קלים במקומות הרלוונטיים.

---

## 03 — שכבות הדאטה הרלוונטיות

### gamesShorts

אובייקט משחק רזה.

תפקיד:
- לשמור מידע בסיסי על המשחק.
- לשמור חיווי קל לגבי מצב הסטטיסטיקה.
- לשמור pointer למסמך הסטטיסטיקה הכבד.
- לא לשמור פירוט סטטיסטי מלא של שחקנים.

דוגמה:

```js
{
  id: 'gameId',
  teamId: 'teamId',
  gameDate: '2026-01-01',
  rival: 'Opponent',
  result: {},
  gamePlayers: [],

  hasStats: true,
  statsStatus: 'partial',
  statsDocId: 'gameStatsDocId',
  statsUpdatedAt: null
}
```

אין לשמור כאן `playerStats` מלא.

---

### gameStatsShorts

מקור האמת הפר־משחקי לסטטיסטיקה מתקדמת.

תפקיד:
- לשמור מסמך מפורט לכל משחק שיש לו סטטיסטיקה.
- לשמור פירוט סטטיסטיקה לכל שחקן במשחק.
- לשמור חיבור קבוצתי של כל סטטיסטיקות השחקנים במשחק.
- להכין מקום עתידי לסטטיסטיקה של יריבה.

זהו המסמך שנשלף לפי דרישה כאשר צריך לבדוק מה קרה במשחק מסוים.

נתיב מומלץ:

```txt
gameStatsShorts/{gameStatsDocId}
```

---

### playersStats

סיכום מצטבר לפי שחקן.

תפקיד:
- לשמור חיבור של ערכי הסטטיסטיקה של השחקן בכל המשחקים עד עכשיו.
- לשמור references קלים למשחקים שבהם יש לשחקן סטטיסטיקה.
- לא לשמור פירוט משחק־משחק.
- לשמש את פרופיל השחקן, דוחות, סקורינג ותובנות בלי לקרוא את כל `gameStatsShorts`.

דוגמה:

```js
{
  id: 'playerId',
  playerId: 'playerId',
  teamId: 'teamId',

  gamesWithStats: 8,
  timePlayed: 520,
  timeVideoStats: 470,

  statsGameRefs: [
    {
      gameId: 'gameId',
      gameStatsDocId: 'gameStatsDocId',
      teamId: 'teamId',
      status: 'committed',
      gameDate: '2026-01-01'
    }
  ],

  passesTotal: 210,
  passesSuccess: 160,
  passesSuccessRate: 76.2,

  tacklesTotal: 32,
  tacklesSuccess: 19,
  tacklesSuccessRate: 59.4
}
```

`statsGameRefs` הוא pointer קל בלבד.
אין לשמור בו סטטיסטיקה מלאה של המשחק.

---

### teamsStats

סיכום מצטבר לפי קבוצה.

תפקיד:
- לחסוך חישוב קבוצתי בכניסה לאפליקציה.
- למנוע צורך לסכום את כל `playersStats` בכל טעינה.
- לשמור references קלים למשחקים שבהם יש לקבוצה סטטיסטיקה.
- לשמש פרופיל קבוצה, דשבורד, תובנות ודוחות.

אם אין מסמך כזה עדיין — מומלץ להוסיף אותו כחלק מהתהליך.

דוגמה:

```js
{
  id: 'teamId',
  teamId: 'teamId',

  gamesWithStats: 12,
  playersWithStats: 18,

  statsGameRefs: [
    {
      gameId: 'gameId',
      gameStatsDocId: 'gameStatsDocId',
      status: 'committed',
      gameDate: '2026-01-01'
    }
  ],

  timePlayed: 960,
  timeVideoStats: 960,

  passesTotal: 1480,
  passesSuccess: 1090,
  passesSuccessRate: 73.6,

  tacklesTotal: 210,
  tacklesSuccess: 126,
  tacklesSuccessRate: 60
}
```

`statsGameRefs` מאפשר לשלוף את מסמך המשחק הכבד לפי דרישה בלי לסרוק את כל `gameStatsShorts`.

---

## 04 — מבנה מסמך gameStatsShorts

מבנה חובה:

```js
{
  id: 'gameStatsDocId',
  gameStatsDocId: 'gameStatsDocId',
  gameId: 'gameId',
  teamId: 'teamId',

  playerStats: [],

  teamStats: {},

  rivelStats: null,

  status: 'draft',
  aggregateStatus: 'dirty',

  createdAt: null,
  updatedAt: null,
  committedAt: null,

  source: 'manual'
}
```

### שדות חובה

#### id / gameStatsDocId

מזהה מסמך הסטטיסטיקה הכבד.

ביצירת סטטיסטיקה ראשונה למשחק יש ליצור `gameStatsDocId` ייעודי.
אין להסתמך על `gameId` כמזהה המסמך.

```txt
gameStatsShorts/{gameStatsDocId}
```

הסיבה:
- מאפשר לשמור pointer ברור באובייקט משחק.
- מאפשר לשמור pointer קל אצל שחקנים וקבוצה.
- מאפשר להפריד בין זהות המשחק לבין זהות מסמך הסטטיסטיקה.
- מאפשר הרחבה עתידית בלי להיתקע עם הנחה ש־`gameId === gameStatsDocId`.

#### gameId

מזהה המשחק שאליו שייך מסמך הסטטיסטיקה.

#### teamId

מזהה הקבוצה שאליה שייך המשחק.

נשמר ישירות במסמך כדי לחסוך lookup דרך המשחק.

#### playerStats

מערך אובייקטים של שחקנים.

כל אובייקט מייצג את סטטיסטיקת השחקן במשחק הספציפי.

דוגמה:

```js
{
  playerId: 'playerId',
  gameId: 'gameId',
  gameStatsDocId: 'gameStatsDocId',
  teamId: 'teamId',

  isSelected: true,
  isStarting: false,
  position: 'CM',

  timePlayed: 70,
  timeVideoStats: 63,

  passesTotal: 25,
  passesSuccess: 19,

  keyPassesTotal: 4,
  keyPassesSuccess: 3,

  tacklesTotal: 5,
  tacklesSuccess: 2,

  personalPressuresTotal: 8,
  personalPressuresSuccess: 5,

  interceptions: 3,
  foulsDrawn: 1
}
```

#### teamStats

חיבור כל הסטטיסטיקות של השחקנים לסטטיסטיקה אחת של הקבוצה במשחק.

חריג חשוב: `timePlayed` ו־`timeVideoStats` ברמת קבוצה אינם סכום זמני השחקנים, אלא זמן המשחק / זמן הווידאו של המשחק עצמו.

זהו מקור האמת לסטטיסטיקה קבוצתית של המשחק הספציפי.

דוגמה:

```js
{
  gameId: 'gameId',
  gameStatsDocId: 'gameStatsDocId',
  teamId: 'teamId',

  playersCount: 16,
  timePlayed: 80,
  timeVideoStats: 80,

  passesTotal: 280,
  passesSuccess: 211,
  passesSuccessRate: 75.4,

  tacklesTotal: 34,
  tacklesSuccess: 19,
  tacklesSuccessRate: 55.9,

  interceptions: 23,
  foulsDrawn: 11
}
```

#### rivelStats

שדה שמור לאופציה עתידית של סטטיסטיקת יריבה.

כרגע לא בשימוש.

אם השם `rivel` כבר קיים בפרויקט, לא לשנות ל־`rival` בלי ריפקטור מסודר.

ערך מומלץ כרגע:

```js
rivelStats: null
```

---

## 05 — סטטוסים

### gameStatsShorts.status

```js
export const GAME_STATS_STATUS = {
  NONE: 'none',
  DRAFT: 'draft',
  PARTIAL: 'partial',
  COMMITTED: 'committed',
  LOCKED: 'locked',
  DELETED: 'deleted',
}
```

פירוש:

```txt
none      = אין מסמך סטטיסטיקה
draft     = נוצרה סטטיסטיקה אבל עדיין בעריכה
partial   = יש סטטיסטיקה חלקית
committed = סטטיסטיקה מלאה ושמורה
locked    = סטטיסטיקה מלאה ונעולה לעריכה רגילה
deleted   = סטטיסטיקה שנוטרלה ב־soft delete ואינה נספרת ב־aggregates
```

### aggregateStatus

```js
export const STATS_AGGREGATE_STATUS = {
  DIRTY: 'dirty',
  SYNCED: 'synced',
}
```

פירוש:

```txt
dirty  = נתוני המשחק השתנו אך הסיכומים המצטברים עדיין לא עודכנו
synced = playersStats / teamsStats / gamesShorts מעודכנים לפי מסמך המשחק
```

---

## 06 — מה נשמר על gamesShorts

על אובייקט המשחק שומרים רק metadata קל ו־pointer למסמך הסטטיסטיקה.

מותר ומומלץ:

```js
{
  hasStats: true,
  statsStatus: 'partial',
  statsDocId: 'gameStatsDocId',
  statsUpdatedAt: null
}
```

`statsDocId` אינו אופציונלי בתהליך החדש.
כאשר נוצרת סטטיסטיקה ראשונה למשחק, חובה לשמור את `gameStatsDocId` על המשחק כדי לאפשר שליפה ישירה של מסמך הסטטיסטיקה.

אסור לשמור שם פירוט מלא:

```js
// לא לשמור ב-gamesShorts
{
  playerStats: [...]
}
```

הסיבה:
`gamesShorts` נטען כחלק מדאטה ראשי של משחקים. הכנסת סטטיסטיקה מפורטת לשם תגרום למסמכים גדולים ולקריאות כבדות בכל טעינה.

---

## 07 — Source of Truth

הגדרת מקור אמת:

```txt
gameStatsShorts.playerStats
= מקור האמת לפירוט שחקן במשחק

gameStatsShorts.teamStats
= מקור האמת לסטטיסטיקת קבוצה במשחק

playersStats
= סיכום מצטבר לשחקן + pointers קלים למשחקים עם סטטיסטיקה

teamsStats
= סיכום מצטבר לקבוצה + pointers קלים למשחקים עם סטטיסטיקה

gamesShorts
= משחק + חיווי קל + statsDocId
```

אין לחשב `teamsStats` בכניסה לאפליקציה מתוך כל השחקנים אם אפשר לשמור אותו מראש בזמן כתיבה.


### הבהרה חשובה — זמן שחקן מול זמן קבוצה

בסטטיסטיקה מתקדמת יש להפריד בין זמן ברמת שחקן לבין זמן ברמת קבוצה.

ברמת שחקן:

```txt
timePlayed = דקות המשחק של השחקן במשחק
timeVideoStats = דקות הווידאו המצולמות של השחקן במשחק
```

ברמת קבוצה:

```txt
timePlayed = זמן המשחק / זמן הסטטיסטיקה של המשחק עצמו
timeVideoStats = זמן הווידאו המצולם של המשחק עצמו
```

אין לחבר את `timePlayed` או `timeVideoStats` של כל השחקנים כדי ליצור את זמן הקבוצה.

דוגמה:
אם במשחק אחד יש 17 שחקנים וכל אחד קיבל `timePlayed: 80`, אז:

```txt
playersStats של כל שחקן = 80
teamsStats של הקבוצה = 80
לא 1360
```

כאשר מוסיפים משחק נוסף של 90 דקות:

```txt
teamsStats.timePlayed = 170
teamsStats.timeVideoStats = 170
```

עדכון קיים עדיין עובד עם delta: אם זמן המשחק משתנה מ־80 ל־70, ה־aggregate הקבוצתי יורד ב־10 בלבד.

---

## 08 — תהליך יצירת סטטיסטיקה למשחק

כאשר יוצרים סטטיסטיקה למשחק בפעם הראשונה:

```txt
1. מקבלים gameId ו־teamId מהמשחק
2. יוצרים gameStatsDocId ייעודי
3. יוצרים מסמך חדש ב־gameStatsShorts/{gameStatsDocId}
4. שומרים id, gameStatsDocId, gameId, teamId
5. שומרים playerStats
6. מחשבים teamStats מתוך playerStats
7. מעדכנים gamesShorts עם hasStats + statsStatus + statsDocId
8. מעדכנים playersStats aggregate + statsGameRefs[]
9. מעדכנים teamsStats aggregate + statsGameRefs[]
10. מסמנים aggregateStatus = synced אם מדובר ב־commit
```

ב־Draft ראשוני ניתן ליצור את מסמך הסטטיסטיקה ואת ה־pointer למשחק, אבל לעדכן aggregates רק ב־commit.

---

## 09 — תהליך עדכון סטטיסטיקה קיימת

עדכון סטטיסטיקה קיימת חייב לעבוד עם Delta.

אסור להוסיף את הערך החדש ישירות ל־playersStats או ל־teamsStats בלי להשוות לערך הקודם.

דוגמה:

```js
const oldValue = 10
const nextValue = 14

const delta = nextValue - oldValue // +4
```

ואז:

```txt
gameStatsShorts.playerStats[playerId].passesTotal = 14
playersStats[playerId].passesTotal += 4
teamsStats[teamId].passesTotal += 4
gameStatsShorts.teamStats.passesTotal += 4
```

אם מחזירים ערך אחורה:

```js
const oldValue = 14
const nextValue = 0

const delta = nextValue - oldValue // -14
```

כל ה־aggregates צריכים לרדת בהתאם.

`statsGameRefs` צריכים להתעדכן רק כ־metadata קל: status, gameDate, gameStatsDocId וכדומה. אין להכניס אליהם פירוט סטטיסטי.

---

## 10 — Draft מול Commit

לא כל שינוי קטן צריך לעדכן את כל המקומות.

מומלץ להפריד בין מצב עריכה למצב פרסום.

### Draft Update

בזמן עריכה ידנית או Live Tagging:

```txt
עדכון gameStatsShorts בלבד
עדכון gamesShorts metadata אם צריך ליצור/לשמר statsDocId
status = draft / partial
aggregateStatus = dirty
```

### Commit

כאשר המשתמש לוחץ שמור / פרסם / נעילה:

```txt
1. validate playerStats
2. calculate teamStats
3. calculate deltas מול גרסה קודמת
4. update gameStatsShorts
5. update playersStats aggregates
6. update playersStats.statsGameRefs[]
7. update teamsStats aggregates
8. update teamsStats.statsGameRefs[]
9. update gamesShorts metadata
10. aggregateStatus = synced
```

גישה זו מונעת 4 כתיבות על כל קליק קטן.

---

## 11 — מספר כתיבות צפוי

ב־commit מלא צפויות בערך 4 כתיבות מרכזיות:

```txt
1. gameStatsShorts/{gameStatsDocId}
2. gamesShorts metadata
3. playersStats aggregate
4. teamsStats aggregate
```

המחיר מתקבל כי:
- סטטיסטיקה נכתבת בדרך כלל פעם אחת.
- עדכונים חוזרים נדירים.
- הקריאה והטעינה מתבצעות הרבה יותר פעמים מהכתיבה.
- מסכי פרופיל ודשבורד צריכים להיות מהירים.

---

## 12 — כלל חשוב: לא לחשב team stats בטעינה

לא לעשות:

```txt
App Load
→ read all players
→ sum all playersStats
→ build team stats
```

כן לעשות:

```txt
Stats Commit
→ calculate teamStats once
→ save teamsStats
→ App Load reads teamsStats directly
```

המטרה:
למנוע חישובים כבדים ב־coreData בזמן כניסה לאפליקציה.

---

## 13 — פונקציות עסקיות מומלצות

כל ערוץ הזנה צריך להשתמש באותן פונקציות עסקיות.

### createGameStatsDoc

```js
createGameStatsDoc({
  draft: {
    gameId,
    teamId,
    status,
    playerStats,
    source,
  }
})
```

תפקיד:
- ליצור `gameStatsDocId` ייעודי.
- ליצור מסמך `gameStatsShorts/{gameStatsDocId}`.
- לחשב `teamStats`.
- לעדכן `gamesShorts` עם `hasStats`, `statsStatus`, `statsDocId`.
- לעדכן summaries אם מדובר ב־commit.
- להחזיר `gameStatsDocId` ל־UI.

### updateGameStatsDoc

```js
updateGameStatsDoc({
  draft: {
    gameStatsDocId,
    gameId,
    teamId,
    status,
    playerStats,
  }
})
```

תפקיד:
- לעדכן סטטיסטיקה קיימת של משחק מלא.
- לקרוא את `gameStatsShorts/{gameStatsDocId}` הקיים.
- לנרמל את `playerStats` החדש.
- לחשב `teamStats` מחדש.
- לחשב delta בין הסטטיסטיקה הקודמת לסטטיסטיקה החדשה.
- לעדכן `playersStats` ו־`teamsStats` בלי להכפיל aggregates.
- לעדכן `gamesShorts.statsUpdatedAt` ו־`statsStatus`.

### removePlayerFromGameStats / updateGameStatsDoc ללא שחקן

כאשר מוחקים סטטיסטיקה מתוך אזור שחקן, אין לבצע מחיקה כללית של מסמך הסטטיסטיקה.

הפעולה הנכונה היא:

```txt
read gameStatsShorts/{gameStatsDocId}
→ remove / reset playerStats row for playerId
→ updateGameStatsDoc with the full next playerStats list
```

תפקיד:
- להסיר או לאפס את תרומת השחקן בלבד.
- לעדכן את `teamStats` של המשחק.
- לעדכן את `playersStats` של אותו שחקן.
- לעדכן את `teamsStats` לפי delta.
- להשאיר את מסמך המשחק ואת `statsDocId` פעילים אם עדיין יש סטטיסטיקה למשחק.

### deleteGameStatsDoc

```js
deleteGameStatsDoc({
  draft: {
    gameStatsDocId,
    gameId,
    teamId,
  }
})
```

תפקיד:
- לבצע soft delete לסטטיסטיקה מלאה של משחק.
- לאפס את תרומת המשחק מתוך `playersStats` ו־`teamsStats` באמצעות delta שלילי.
- להסיר refs מתוך `playersStats.statsGameRefs[]`.
- להסיר refs מתוך `teamsStats.statsGameRefs[]`.
- לעדכן `gamesShorts.hasStats = false`.
- לעדכן `gamesShorts.statsStatus = 'none'`.
- לנקות `gamesShorts.statsDocId`.
- להשאיר את `gameStatsShorts/{gameStatsDocId}` כ־audit עם המספרים המקוריים ו־`status: 'deleted'`.

---

## 14 — Batch / Transaction

עדיפות:
- להשתמש ב־Firestore Batch כאשר כל הנתונים כבר ידועים.
- להשתמש ב־Transaction כאשר צריך לקרוא ערכים קיימים כדי לחשב delta בצורה בטוחה.

במיוחד בעדכון קיים:

```txt
read old gameStatsShorts/{gameStatsDocId}
calculate delta
write gameStatsShorts/{gameStatsDocId}
write playersStats
write teamsStats
write gamesShorts
```

זה candidate טוב ל־transaction או ל־service flow מבוקר.

אין לבצע כתיבות ישירות מפוזרות מתוך קומפוננטות UI.

---

## 15 — קטלוג פרמטרים

פרמטרי הסטטיסטיקה מוגדרים כקטלוג קבוע בקוד.

הקטלוג מגדיר:
- id
- שם מלא
- שם קצר
- סוג שדה
- סוג סטטיסטיקה
- האם ברירת מחדל
- סדר
- קבוצת triplet
- פורמט תצוגה

הקטלוג אינו מחזיק ערכים.

הערכים נשמרים ב:
- `gameStatsShorts.playerStats`
- `gameStatsShorts.teamStats`
- `playersStats`
- `teamsStats`

---

## 16 — Triplets and Rates

סטטיסטיקות מסוג triplet צריכות להישמר לפי השדות הקיימים בקטלוג.

דוגמה:

```txt
passesTotal
passesSuccess
passesSuccessRate
```

ה־rate נגזר מתוך total/success.

אין לעדכן rate ידנית בלי לחשב אותו מחדש.

דוגמה:

```js
passesSuccessRate = passesTotal > 0
  ? (passesSuccess / passesTotal) * 100
  : 0
```

אותו עיקרון חל על:
- keyPasses
- crosses
- dribbles
- shots
- tackles
- keyTackles
- personalPressures
- ballClearances

---

## 17 — טעינה לפי דרישה

בכניסה לאפליקציה:
- לא קוראים את כל `gameStatsShorts`.
- לא טוענים פירוט סטטיסטיקה לכל המשחקים.
- קוראים רק דאטה ראשי ו־summaries נחוצים.

כאשר צריך פירוט משחק:

```txt
game.statsDocId
→ fetch gameStatsShorts/{gameStatsDocId}
```

כאשר צריך פירוט סטטיסטיקה מתוך פרופיל שחקן:

```txt
player.statsGameRefs[].gameStatsDocId
→ fetch gameStatsShorts/{gameStatsDocId}
→ filter playerStats by playerId
```

כאשר צריך פירוט סטטיסטיקה מתוך פרופיל קבוצה:

```txt
team.statsGameRefs[].gameStatsDocId
→ fetch gameStatsShorts/{gameStatsDocId}
→ use teamStats / playerStats as needed
```

כאשר צריך פרופיל שחקן כללי:

```txt
read playersStats summary
```

כאשר צריך פרופיל קבוצה כללי:

```txt
read teamsStats summary
```

---


## 18 — מדיניות מחיקה לפי מקור הפעולה

מחיקה של סטטיסטיקה אינה פעולה אחת. סוג הפעולה תלוי במקום שממנו המשתמש מבצע את המחיקה.

### מחיקה מאזור שחקן

אם המחיקה מתבצעת מתוך פרופיל שחקן או אזור שחקן:

```txt
לא למחוק את כל gameStatsShorts
לא לנקות statsDocId מהמשחק
כן לבצע update שמסיר/מאפס את תרומת השחקן בלבד
```

הפעולה צריכה להסיר את השחקן מתוך `playerStats` של מסמך המשחק או לאפס את שדותיו, ואז להריץ עדכון מלא דרך `updateGameStatsDoc`.

תוצאה רצויה:
- `playersStats` של השחקן יורד לפי delta.
- `teamsStats` של הקבוצה יורד לפי delta.
- `gameStatsShorts` נשאר פעיל אם יש עדיין סטטיסטיקה למשחק.
- `gamesShorts.statsDocId` נשאר פעיל.

### מחיקה מאזור קבוצה או משחק

אם המחיקה מתבצעת מתוך אזור קבוצה, מסך משחקים, או פרטי המשחק:

```txt
כן לבצע מחיקה כללית של סטטיסטיקת המשחק
```

הפעולה הנכונה היא `deleteGameStatsDoc`.

תוצאה רצויה:
- `playersStats` יורד לפי delta שלילי לכל שחקני המשחק.
- `teamsStats` יורד לפי delta שלילי של המשחק.
- `gamesShorts.hasStats = false`.
- `gamesShorts.statsStatus = 'none'`.
- `gamesShorts.statsDocId = ''`.
- `gameStatsShorts/{gameStatsDocId}` נשאר לצורכי audit עם `status: 'deleted'`.

### מחיקת משחק

כאשר מוחקים משחק, חובה לבדוק אם יש לו סטטיסטיקה פעילה.

אם למשחק יש:

```js
{
  hasStats: true,
  statsDocId: 'gameStatsDocId'
}
```

אסור למחוק רק את המשחק.

הסדר הנכון:

```txt
delete game requested
→ if game.statsDocId exists
  → deleteGameStatsDoc({ gameId, gameStatsDocId })
→ delete / remove game from gamesShorts
```

המטרה:
- למנוע שאריות ב־`playersStats`.
- למנוע שאריות ב־`teamsStats`.
- למנוע מסמך `gameStatsShorts` פעיל שמצביע למשחק שכבר נמחק.

## 19 — החלטות שלא לשנות בלי דיון

1. `gameStatsShorts` הוא מקור האמת הפר־משחקי.
2. `gameStatsDocId` הוא מזהה מסמך הסטטיסטיקה הכבד.
3. אין להסתמך על `gameId` כמזהה מסמך הסטטיסטיקה.
4. `gamesShorts.statsDocId` נשמר כ־pointer חובה לאחר יצירת סטטיסטיקה ראשונה.
5. `playersStats` הוא aggregate מצטבר + refs קלים, לא פירוט משחקים.
6. `teamsStats` הוא aggregate מצטבר + refs קלים כדי לחסוך חישוב בטעינה.
7. `gamesShorts` מחזיק חיווי קל בלבד.
8. פירוט שחקנים במשחק לא נכנס ל־`gamesShorts`.
9. כל עדכון קיים חייב לעבוד עם delta.
10. Live Tagging הוא ערוץ הזנה, לא מודל אחסון עצמאי.
11. מחיקה מאזור שחקן היא update נקודתי ולא מחיקה כללית.
12. מחיקה מאזור קבוצה/משחק היא מחיקה כללית של סטטיסטיקת המשחק.
13. מחיקת משחק חייבת לטפל קודם בסטטיסטיקה הפעילה שלו.
14. שינוי בתהליך מחייב עדכון מסמך זה.

---

## 20 — Checklist לצ׳אט AI חדש

כאשר ממשיכים עבודה על סטטיסטיקה מתקדמת, לצרף או לבדוק:

```txt
docs/architecture/ADVANCED_STATS_PIPELINE.md
docs/context/CORE_DATA.md
docs/context/FIRESTORE_ROUTER.md
```

קבצי קוד רלוונטיים לפי צורך:

```txt
statsParmList.js
stats.calc.js
stats.helpers.js
stats.status.js
stats.options.js

קבצי services של Firestore
קבצי router/update flow
קבצי coreData resolver
קבצי gameStatsShorts קיימים
קבצי playersStats / teamsStats אם קיימים
gameStatsCreate.js
gameStatsUpdate.js
gameStatsDelete.js
shared/stats/engine
```

לפני כתיבת קוד:
- לבדוק אם קיימת פונקציה דומה.
- לא ליצור flow מקביל.
- לא לכתוב ישירות מפוזר ל־Firestore מתוך UI.
- לא להכניס סטטיסטיקה כבדה ל־gamesShorts.
- לא לחשב team stats מחדש בכניסה לאפליקציה אם אפשר לקרוא aggregate שמור.
- לא לבנות flow שמניח `gameStatsDocId === gameId`.

---

## 21 — סיכום קצר

המודל:

```txt
gameStatsShorts/{gameStatsDocId}
= פירוט מלא של סטטיסטיקה למשחק

gamesShorts
= משחק רזה + hasStats + statsStatus + statsDocId

playersStats
= סיכום מצטבר לפי שחקן + refs קלים למשחקים עם סטטיסטיקה

teamsStats
= סיכום מצטבר לפי קבוצה + refs קלים למשחקים עם סטטיסטיקה
```

האסטרטגיה:

```txt
כתיבה יקרה יותר
קריאה זולה יותר
טעינה מהירה יותר
מסמכים קטנים יותר
פחות חישובים בכניסה לאפליקציה
שליפה לפי pointer במקום סריקה
soft delete עם rollback של aggregates
```

כל שינוי בתהליך, במבנה הנתונים או במיקום האחריות בין השכבות מחייב עדכון של המסמך הזה.
