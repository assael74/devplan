# DevPlan — Advanced Stats Pipeline

תאריך אחרון לעדכון: 31/05/26

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

כל ערוצי ההזנה צריכים להתנקז לאותו מסלול עדכון סטטיסטיקה, אבל לא בהכרח לאותה פונקציית שמירה.

החל מהוספת Live Tagging קיימים שלושה מסלולי יצירה רשמיים:

```txt
Manual Form / Live Player Stats
→ createGameStatsDoc
→ playerStats נשלח
→ teamStats נגזר מתוך playerStats

Live Private Player Stats
→ savePrivatePlayerGameStatsDoc
→ playerStats של שחקן פרטי בלבד
→ externalGames.gameInfo + privatePlayersStats

Live Team Only Stats
→ createTeamOnlyGameStatsDoc
→ teamStats ישיר
→ ללא playerStats וללא playersStats
```

כלומר Live Tagging הוא create-only מבחינת UX, אבל הוא לא route יחיד. בחירת ה־route נקבעת לפי סוג האובייקט הנמדד.

המודל המרכזי הוא:

```txt
Input Channel
→ Local Draft / Partial Save / Committed Save
→ gameStatsShorts detail doc for partial/committed only
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

### externalGamesShorts

אובייקט משחק חיצוני רזה, בעיקר עבור שחקן פרטי.

תפקיד:
- לשמור מידע בסיסי על משחק שאינו חלק ממסלול `gamesShorts` של קבוצה.
- לשמור חיווי קל לגבי מצב הסטטיסטיקה.
- לשמור pointer למסמך הסטטיסטיקה הכבד.
- לא לשמור פירוט סטטיסטי מלא של שחקנים.

דוגמה:

```js
{
  id: 'externalGameId',
  playerId: 'privatePlayerId',
  teamName: 'Team Name',
  clubName: 'Club Name',
  gameSource: 'external',
  isExternalGame: true,

  hasStats: true,
  statsStatus: 'partial',
  statsDocId: 'gameStatsDocId',
  gameStatsDocId: 'gameStatsDocId',
  statsUpdatedAt: null
}
```

ה־metadata של סטטיסטיקה במשחק חיצוני נשמר ב־`externalGames.gameInfo`, לא ב־`games.gameInfo`.


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

### privatePlayersStats

סיכום מצטבר לפי שחקן פרטי.

תפקיד:
- לשמור aggregate מצטבר של שחקן פרטי ממשחקים חיצוניים.
- לשמור `statsGameRefs` קלים למשחקים חיצוניים שבהם יש סטטיסטיקה.
- לא לערבב סטטיסטיקה של שחקן פרטי עם `playersStats` הרגיל אם השחקן אינו שייך למסלול קבוצה.
- לשמש את פרופיל השחקן הפרטי בלי לקרוא את כל `gameStatsShorts`.

דוגמה:

```js
{
  id: 'privatePlayerId',
  playerId: 'privatePlayerId',

  gamesWithStats: 3,
  timePlayed: 240,
  timeVideoStats: 240,

  statsGameRefs: [
    {
      gameId: 'externalGameId',
      gameStatsDocId: 'gameStatsDocId',
      teamId: '',
      status: 'partial',
      gameDate: '2026-01-01'
    }
  ],

  passesTotal: 40,
  passesSuccess: 28,
  passesSuccessRate: 70
}
```


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
  docId: 'gameStatsDocId',
  gameId: 'gameId',
  teamId: 'teamId',

  playerStats: [],

  teamStats: {},

  rivelStats: null,

  status: 'partial',
  aggregateStatus: 'synced',

  createdAt: null,
  updatedAt: null,
  committedAt: null,

  source: 'manual'
}
```

### שדות חובה

#### id / docId / gameStatsDocId

מזהה מסמך הסטטיסטיקה הכבד.

במסמך עצמו נשמרים `id` ו־`docId`. ב־payload, ב־UI וב־pointers משתמשים בשם `gameStatsDocId`.

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
}
```

פירוש:

```txt
none      = אין מסמך סטטיסטיקה
draft     = טיוטה מקומית ב־state בלבד; לא נשמרת ל־Firestore בתהליך הנוכחי
partial   = יש סטטיסטיקה חלקית שמורה ב־Firestore ומסונכרנת ל־aggregates
committed = סטטיסטיקה מלאה ושמורה ב־Firestore ומסונכרנת ל־aggregates
locked    = סטטיסטיקה מלאה ונעולה לעריכה רגילה
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
= משחק קבוצתי רגיל + חיווי קל + statsDocId

externalGamesShorts
= משחק חיצוני / שחקן פרטי + חיווי קל + statsDocId

privatePlayersStats
= סיכום מצטבר לשחקן פרטי + refs קלים למשחקים חיצוניים
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

בתהליך הנוכחי יש הפרדה חדה בין טיוטה מקומית לבין שמירה רשמית.

### Draft מקומי

כאשר המשתמש בוחר `draft`:

```txt
1. בונים payload + draft מהטופס
2. שומרים את הטיוטה ב־state לפי gameId
3. לא כותבים ל־Firestore
4. לא יוצרים gameStatsShorts
5. לא מעדכנים gamesShorts
6. לא מעדכנים playersStats / teamsStats
```

### Partial / Committed

כאשר יוצרים סטטיסטיקה רשמית למשחק בפעם הראשונה:

```txt
1. מקבלים gameId ו־teamId מהמשחק
2. יוצרים gameStatsDocId ייעודי
3. יוצרים מסמך חדש ב־gameStatsShorts/{gameStatsDocId}
4. שומרים id, docId, gameId, teamId
5. מנרמלים playerStats ושומרים רק שחקנים עם סטטיסטיקה מתקדמת
6. מחשבים teamStats מתוך playerStats
7. מעדכנים gamesShorts עם hasStats + statsStatus + statsDocId + statsUpdatedAt
8. מעדכנים playersStats aggregate + statsGameRefs[]
9. מעדכנים teamsStats aggregate + statsGameRefs[]
10. מסמנים aggregateStatus = synced
11. מנקים draft מקומי אחרי שמירת partial / committed
```

סטטוס `partial` ו־`committed` שניהם נשמרים ל־Firestore ומעדכנים aggregates. ההבדל ביניהם הוא איכות/שלמות הנתונים מבחינת המוצר, לא מסלול כתיבה נפרד.

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

בזמן עריכה ידנית, כאשר הסטטוס הוא `draft`:

```txt
שומרים draft מקומי ב־state בלבד
לא כותבים ל־Firestore
לא יוצרים gameStatsShorts
לא מעדכנים gamesShorts
לא מעדכנים playersStats / teamsStats
```

### Partial / Commit

כאשר המשתמש שומר `partial` או `committed`:

```txt
1. validate playerStats
2. normalize playerStats
3. calculate teamStats
4. calculate deltas מול גרסה קודמת אם קיימת
5. create/update gameStatsShorts
6. update playersStats aggregates
7. update playersStats.statsGameRefs[]
8. update teamsStats aggregates
9. update teamsStats.statsGameRefs[]
10. update gamesShorts metadata
11. aggregateStatus = synced
12. clear local draft
```

גישה זו מונעת כתיבות על כל שינוי בטופס, אבל מבטיחה שכל שמירה רשמית כבר מסונכרנת ל־CoreData ול־aggregates.

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
  payload: {
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
  payload: {
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

### updateGamePlayerStatsDoc

```js
updateGamePlayerStatsDoc({
  payload: {
    gameStatsDocId,
    gameId,
    teamId,
    status,
    playerStats: [singlePlayerRow],
    meta: {
      scope: 'player',
      playerId: 'playerId'
    }
  }
})
```

תפקיד:
- מסלול עדכון מתוך פרופיל שחקן רגיל.
- לקבל payload של שחקן אחד בלבד.
- לשלוף את `gameStatsShorts/{gameStatsDocId}` המלא.
- להחליף / להוסיף רק את שורת השחקן בתוך `playerStats`.
- לקרוא ל־`updateGameStatsDoc` עם `playerStats` מלא כדי לא לדרוס שחקנים אחרים.
- לעדכן `playersStats` ו־`teamsStats` לפי delta בלבד.

כלל קריטי:
אם הטופס נפתח מפרופיל שחקן, מותר ל־UI לשלוח `playerStats` של שחקן אחד בלבד, אבל אסור להעביר זאת ישירות ל־`updateGameStatsDoc`.

### savePrivatePlayerGameStatsDoc

```js
savePrivatePlayerGameStatsDoc({
  payload: {
    gameId,
    gameStatsDocId,
    status,
    source: 'privatePlayerProfile',
    playerStats: [singlePrivatePlayerRow],
    meta: {
      scope: 'privatePlayer',
      playerId: 'privatePlayerId'
    }
  }
})
```

תפקיד:
- מסלול יצירה / עדכון של סטטיסטיקה לשחקן פרטי במשחק חיצוני.
- ליצור או לעדכן `gameStatsShorts/{gameStatsDocId}`.
- לעדכן `externalGames.gameInfo` עם `hasStats`, `statsStatus`, `statsDocId`, `gameStatsDocId`, `statsUpdatedAt`.
- לעדכן `privates.privatePlayersStats` לפי delta.
- לא לעדכן `games.gameInfo`.
- לא לעדכן `players.playersStats`.
- לא לעדכן `teams.teamsStats`.

### deletePrivatePlayerGameStatsDoc

```js
deletePrivatePlayerGameStatsDoc({
  payload: {
    gameId,
    gameStatsDocId,
    source: 'privatePlayerProfile',
    meta: {
      scope: 'privatePlayer',
      playerId: 'privatePlayerId'
    }
  }
})
```

תפקיד:
- למחוק סטטיסטיקה רשמית של משחק חיצוני לשחקן פרטי.
- לבצע rollback ל־`privates.privatePlayersStats`.
- לעדכן `externalGames.gameInfo` כך שהמשחק כבר לא מצביע על סטטיסטיקה פעילה.
- למחוק בפועל את `gameStatsShorts/{gameStatsDocId}`.
- לא לגעת במסלולי המשחקים / השחקנים / הקבוצות הרגילים.


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
  payload: {
    gameStatsDocId,
    gameId,
    teamId,
  }
})
```

תפקיד:
- לבצע מחיקה מלאה של סטטיסטיקת משחק רשמית מאזור קבוצה/משחק.
- לשלוף קודם את `gameStatsShorts/{gameStatsDocId}` ולא להסתמך על draft פתוח.
- לוודא שהמסמך שייך ל־`gameId` ול־`teamId` המבוקשים.
- לאפס את תרומת המשחק מתוך `playersStats` ו־`teamsStats` באמצעות delta שלילי.
- להסיר refs מתוך `playersStats.statsGameRefs[]`.
- להסיר refs מתוך `teamsStats.statsGameRefs[]`.
- לעדכן `gamesShorts.hasStats = false`.
- להסיר / לנקות `gamesShorts.statsStatus`, `gamesShorts.statsDocId`, `gamesShorts.gameStatsDocId`, `gamesShorts.statsUpdatedAt`.
- למחוק בפועל את `gameStatsShorts/{gameStatsDocId}` עם `tx.delete`.
- לנקות שדות aggregate שיורדים ל־0, למעט שדות זהות וזמני audit בסיסיים.

---
### createTeamOnlyGameStatsDoc

```js
createTeamOnlyGameStatsDoc({
  payload: {
    gameId,
    teamId,
    status,
    source: 'liveTaggingTeamOnly',
    teamStats,
    meta: {
      scope: 'team',
      source: 'liveTagging'
    }
  }
})
```

תפקיד:
- מסלול יצירה רשמי לסטטיסטיקה קבוצתית ישירה מתוך Live Tagging.
- מיועד למצב שבו המשתמש מתייג פעולה ברמת קבוצה ולא ברמת שחקן.
- ליצור `gameStatsDocId` ייעודי.
- ליצור `gameStatsShorts/{gameStatsDocId}` עם `statsScope: 'teamOnly'`.
- לשמור `playerStats: []`.
- לשמור `teamStats` ישיר מתוך אירועי Live Tagging.
- לעדכן `games.gameInfo` עם `hasStats`, `statsStatus`, `statsDocId`, `gameStatsDocId`, `statsUpdatedAt`.
- לעדכן `teamsStats` aggregate + `statsGameRefs[]`.
- לא לעדכן `playersStats`.
- לא לחשב `teamStats` מתוך `playerStats`.

כלל קריטי:
`createGameStatsDoc` אינו מתאים ל־team-only כי הוא דורש `playerStats` לא ריק ומחשב `teamStats` מתוך שחקנים. לכן אין להשתמש בו לסיכום קבוצתי ישיר.

---

## 13.1 — Live Tagging כערוץ הזנה נוסף

Live Tagging הוא ערוץ הכנסת נתונים נוסף לסטטיסטיקה מתקדמת.

העיקרון:

```txt
LiveTaggingPanel
→ events in local state
→ buildLiveTaggingStatsSaveModel
→ route מתאים
→ Firestore create flow
```

ה־Live Tagging אינו עורך מסמכים קיימים ואינו מוחק מסמכים קיימים.

כללי UX:
- אם למשחק כבר יש `hasStats`, `statsDocId` או `gameStatsDocId`, בחירת המשחק במצב יצירת סטטיסטיקה חדשה צריכה להיות disabled.
- Live Tagging הוא create-only מבחינת המשתמש.
- אין טעינה של `gameStatsShorts` קיים לעריכה.
- אין route של update מתוך Live Tagging.
- אין route של delete מתוך Live Tagging.
- שמירה מתבצעת רק בסיום session.

סוגי אובייקטים ב־Live Tagging:

```txt
player
privatePlayer
scoutPlayer
team
```

פירוט:

```txt
player
→ שחקן רגיל
→ דורש playerId + teamId + gameId
→ route: createGameStatsDoc
→ יוצר playerStats
→ teamStats נגזר מתוך playerStats

privatePlayer
→ שחקן פרטי
→ דורש playerId + gameId
→ ללא teamId
→ route: savePrivatePlayerGameStatsDoc
→ מעדכן externalGames.gameInfo + privatePlayersStats

scoutPlayer
→ שחקן במעקב
→ הכנה עתידית בלבד
→ disabled ב־UI כרגע
→ אין route שמירה

team
→ קבוצה
→ דורש teamId + gameId
→ route: createTeamOnlyGameStatsDoc
→ יוצר teamStats ישיר
→ playerStats נשאר []
→ לא מעדכן playersStats
```

מבנה event ב־Live Tagging:

```js
{
  id: 'evt_timestamp',
  sessionId: 'sessionId',
  gameId: 'gameId',
  teamId: 'teamId',

  subject: {
    type: 'player' | 'privatePlayer' | 'team',
    playerId: 'playerId' || null,
    teamId: 'teamId' || null
  },

  clock: {
    period: 1,
    minute: 23,
    second: 14,
    ms: 1394000
  },

  action: {
    id: 'passes_positive',
    baseId: 'passes',
    side: 'positive',
    stats: {
      group: 'passes',
      statId: 'passesSuccess',
      totalStatId: 'passesTotal',
      rateStatId: 'passesSuccessRate'
    }
  },

  field: {
    zoneNumber: 8
  },

  meta: {
    source: 'live',
    createdAt: 123456789
  }
}
```

המרת action לסטטיסטיקה:
- אם יש `totalStatId`, מוסיפים `+1` ל־total.
- אם הפעולה חיובית ויש `statId` שונה מ־`totalStatId`, מוסיפים `+1` גם ל־success/stat.
- אם אין `totalStatId`, מוסיפים `+1` ל־`statId`.
- rates מחושבים מחדש בשכבת ה־stats engine או בשירות השמירה, לא ב־UI.

דוגמאות:

```txt
passes_positive
→ passesTotal +1
→ passesSuccess +1

passes_negative
→ passesTotal +1

shots_positive
→ shotsTotal +1
→ shotsOnTarget +1

shots_negative
→ shotsTotal +1

interceptions_positive
→ interceptions +1

fouls_positive
→ foulsDrawn +1

fouls_negative
→ foulsCommitted +1
```

בחירת משחק ליצירת סטטיסטיקה חדשה:
- במצב create stats יש לבדוק `hasStats`, `statsDocId`, `gameStatsDocId`.
- משחק עם סטטיסטיקה קיימת מוצג disabled.
- אין להשתמש ב־`isAlreadyInGame` כדי לחסום סטטיסטיקה; שדה זה מתאר שיוך שחקן למשחק ולא מצב סטטיסטיקה.
- מומלץ להשתמש ב־`pickerMode: 'createStats'` בשדה בחירת משחק.

קבצי קוד מרכזיים:
```txt
src/features/liveTagging/LiveTaggingPanel.js
src/features/liveTagging/hooks/useLiveTaggingPanelModel.js
src/features/liveTagging/logic/liveTagging.payload.js
src/features/liveTagging/logic/liveTagging.selection.js
src/features/liveTagging/logic/liveTagging.actions.js
src/shared/liveTagging/actions/liveActionStatsMap.js
src/shared/liveTagging/events/liveEvent.builder.js
src/services/firestore/shorts/gameStats/teamLiveGameStatsCreate.js
src/services/firestore/shorts/gameStats/privatePlayerGameStatsSave.js
src/services/firestore/shorts/gameStats/gameStatsCreate.js
```

מסמך מפורט:
```txt
docs/architecture/LIVE_TAGGING_STATS_PIPELINE.md
```

---

## 14 — Batch / Transaction

עדיפות:
- להשתמש ב־Firestore Batch כאשר כל הנתונים כבר ידועים.
- להשתמש ב־Transaction כאשר צריך לקרוא ערכים קיימים כדי לחשב delta בצורה בטוחה.

במיוחד בעדכון קיים:

```txt
read old gameStatsShorts/{gameStatsDocId}
calculate delta / rollback
create/update/delete gameStatsShorts/{gameStatsDocId}
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


## 18 — פתיחה ושמירה דרך פרופיל שחקן

פתיחה מתוך פרופיל שחקן היא אותו טופס סטטיסטיקה, אבל עם scope שונה.

### שחקן רגיל מתוך קבוצה

```txt
Player Profile
→ PerformanceCell / Stats button
→ load gameStatsShorts if statsDocId exists
→ show all players already in stats doc
→ lock all players except current player
→ save payload with one playerStats row
→ updateGamePlayerStatsDoc
→ merge into full gameStatsShorts.playerStats
→ updateGameStatsDoc with full playerStats list
```

כללי UI:
- בטופס מוצגים כל השחקנים שכבר קיימים במסמך הסטטיסטיקה.
- רק השחקן הנוכחי ניתן לעריכה.
- שחקנים אחרים disabled / read-only.
- בסיכום ניתן לראות את כל השחקנים.
- בסיכום ובשלב מילוי אין לאפשר עקיפה לעריכת שחקן נעול.
- דרך פרופיל קבוצה אין נעילות והטופס נשאר חופשי.

כללי שמירה:
- ה־payload מפרופיל שחקן כולל `playerStats` של שחקן אחד בלבד.
- `source: 'playerProfile'`.
- `meta.scope: 'player'`.
- route השמירה חייב להיות `player-update`.
- אסור לעדכן ישירות עם `updateGameStatsDoc` אם יש רק שחקן אחד ב־payload.

### שחקן פרטי עם משחק חיצוני

```txt
Private Player Profile
→ External Game
→ GameStatsCreateForm
→ source: privatePlayerProfile
→ meta.scope: privatePlayer
→ savePrivatePlayerGameStatsDoc
```

כללי שמירה:
- `gameStatsShorts` נשאר מקור אמת פר־משחקי.
- `externalGames.gameInfo` מקבל metadata קל ו־pointer.
- `privates.privatePlayersStats` מקבל aggregate מצטבר.
- אין עדכון ל־`gamesShorts`.
- אין עדכון ל־`playersStats`.
- אין עדכון ל־`teamsStats`.

---


## 19 — מדיניות מחיקה לפי מקור הפעולה

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
- `gamesShorts.statsStatus` מוסר או מתאפס.
- `gamesShorts.statsDocId` מוסר או מתאפס.
- `gamesShorts.gameStatsDocId` מוסר אם קיים.
- `gamesShorts.statsUpdatedAt` מוסר אם קיים.
- `gameStatsShorts/{gameStatsDocId}` נמחק בפועל.

### מחיקה של שחקן פרטי / משחק חיצוני

אם המחיקה מתבצעת מתוך פרופיל שחקן פרטי על משחק חיצוני:

```txt
לא להשתמש ב-deleteGameStatsDoc
כן להשתמש ב-deletePrivatePlayerGameStatsDoc
```

הפעולה הנכונה:

```txt
read gameStatsShorts/{gameStatsDocId}
→ calculate negative delta for private player
→ update privates.privatePlayersStats
→ update externalGames.gameInfo:
   hasStats: false
   remove statsStatus / statsDocId / gameStatsDocId / statsUpdatedAt
   add statsDeletedAt
→ delete gameStatsShorts/{gameStatsDocId}
```

תוצאה רצויה:
- `privates.privatePlayersStats` יורד לפי delta.
- `statsGameRefs` של המשחק מוסר מהשחקן הפרטי.
- `externalGames.gameInfo.hasStats = false`.
- `gameStatsShorts/{gameStatsDocId}` נמחק.
- אין שינוי ב־`gamesShorts`.
- אין שינוי ב־`playersStats`.
- אין שינוי ב־`teamsStats`.


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
  → deleteGameStatsDoc({ payload: { gameId, gameStatsDocId } })
→ delete / remove game from gamesShorts
```

המטרה:
- למנוע שאריות ב־`playersStats`.
- למנוע שאריות ב־`teamsStats`.
- למנוע מסמך `gameStatsShorts` שמצביע למשחק שכבר נמחק.


## 20 — מצב יישום נוכחי — Completed Flow

נכון לעדכון זה, תהליך יצירת סטטיסטיקה מתקדמת הושלם ונבדק מקצה לקצה.

### מה הושלם

```txt
1. טופס GameStatsCreateForm עובד.
2. שמירת draft נשמרת ל־state בלבד ולא ל־Firestore.
3. שמירת partial / committed נשמרת ל־Firestore.
4. createGameStatsDoc יוצר gameStatsShorts ומעדכן games.gameInfo.
5. updateGameStatsDoc מעדכן סטטיסטיקה קיימת עם delta.
6. getGameStatsDoc שולף מסמך קיים לפי statsDocId.
7. createGameStatsDraftFromDoc בונה draft מטופס שמור.
8. games.gameInfo מקבל hasStats / statsStatus / statsDocId / statsUpdatedAt.
9. teamsStats מתעדכן לפי teamStats של המשחק.
10. playersStats מתעדכן לכל שחקן עם סטטיסטיקה מתקדמת.
11. rate מחושב מחדש ואינו source of truth מה־UI.
12. draft מקומי מתנקה אחרי שמירת partial / committed.
13. פתיחת טופס עם statsDocId שולפת את gameStatsShorts/{statsDocId}.
14. נוספה אינדיקציית טעינה לפתיחת טופס שמור.
15. advancedStats מחובר ל־CoreData:
    - team.advancedStats
    - team.players[].advancedStats
16. קיימת תצוגת בדיקה זמנית ב־TeamPerformanceModule.
17. כפתור פתיחת סטטיסטיקה מזהה מצבים:
    - empty
    - draft
    - partial
    - committed
    - saved
18. מחיקת draft מקומי עובדת.
19. מחיקת סטטיסטיקה רשמית עובדת עם rollback מלא.
20. UX המחיקה והשמירה עודכן:
    - כפתור שמירה לפי סטטוס
    - כפתור מחיקה לפי סוג הפעולה
    - מודאל מחיקה שמסביר במפורש מה נמחק
21. פתיחה מפרופיל שחקן רגיל עובדת:
    - מוצגים כל השחקנים שכבר קיימים במסמך
    - רק השחקן הנוכחי ניתן לעריכה
    - שמירה עוברת דרך player-update ולא דורסת שחקנים אחרים
22. שחקן פרטי / משחק חיצוני חובר למסלול נפרד:
    - savePrivatePlayerGameStatsDoc
    - deletePrivatePlayerGameStatsDoc
    - externalGames.gameInfo כ־metadata pointer
    - privates.privatePlayersStats כ־aggregate
23. Live Tagging נוסף כערוץ הכנסת נתונים create-only:
    - player → createGameStatsDoc
    - privatePlayer → savePrivatePlayerGameStatsDoc
    - team → createTeamOnlyGameStatsDoc
    - scoutPlayer → disabled / הכנה עתידית
24. נוספה חסימה לבחירת משחק עם סטטיסטיקה קיימת במצב יצירת סטטיסטיקה חדשה.
25. נוספה הפרדה בין isAlreadyInGame לבין hasStats/statsDocId בבחירת משחק.
```

### בדיקות שבוצעו

```txt
1. עדכון אותו שחקן באותו משחק — תקין.
2. הוספת שחקן נוסף לאותו משחק — תקין.
3. הוספת משחק נוסף לאותו שחקן/קבוצה — תקין.
4. counters, זמנים, deltas ו־rates — תקין.
5. מחיקת סטטיסטיקת משחק רשמית — תקין.
6. rollback ל־games.gameInfo, teamsStats, playersStats — תקין.
```

### השלב הבא המומלץ

```txt
לא לגעת יותר ב־flow של יצירה / שמירה / מחיקה אלא אם מתגלה באג.
השלב הבא הוא מוצרי:
1. להסיר או להחליף את תצוגת הבדיקה הזמנית.
2. להחליט איפה advancedStats מוצג בפועל.
3. לבנות קומפוננטות תצוגה נקיות לסטטיסטיקה מתקדמת.
4. לחבר את התצוגה למובייל בהמשך.
```

---

## 21 — החלטות שלא לשנות בלי דיון

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
13. מחיקה כללית של סטטיסטיקה רשמית מוחקת בפועל את `gameStatsShorts/{gameStatsDocId}` אחרי rollback.
14. מחיקת משחק חייבת לטפל קודם בסטטיסטיקה הפעילה שלו.
15. שינוי בתהליך מחייב עדכון מסמך זה.
16. Live Tagging הוא create-only מבחינת UX.
17. Live Tagging לא עורך ולא מוחק מסמכי סטטיסטיקה קיימים.
18. מצב team ב־Live Tagging הוא team-only stats ואינו משתמש ב־createGameStatsDoc.
19. scoutPlayer הוא הכנה עתידית בלבד ומופיע disabled עד שיוגדר לו route.
20. משחק עם סטטיסטיקה קיימת צריך להיות disabled בבחירת משחק ליצירת סטטיסטיקה חדשה.

---

## 22 — Checklist לצ׳אט AI חדש

כאשר ממשיכים עבודה על סטטיסטיקה מתקדמת, לצרף או לבדוק:

```txt
docs/architecture/ADVANCED_STATS_PIPELINE.md
docs/architecture/LIVE_TAGGING_STATS_PIPELINE.md
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
teamLiveGameStatsCreate.js
privatePlayerGameStatsSave.js
shared/stats/engine
shared/liveTagging
features/liveTagging
```

לפני כתיבת קוד:
- לבדוק אם קיימת פונקציה דומה.
- לא ליצור flow מקביל.
- לא לכתוב ישירות מפוזר ל־Firestore מתוך UI.
- לא להכניס סטטיסטיקה כבדה ל־gamesShorts.
- לא לחשב team stats מחדש בכניסה לאפליקציה אם אפשר לקרוא aggregate שמור.
- לא לבנות flow שמניח `gameStatsDocId === gameId`.

---

## 23 — סיכום קצר

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

externalGamesShorts
= משחקים חיצוניים רזים + hasStats + statsStatus + statsDocId

privatePlayersStats
= סיכום מצטבר לפי שחקן פרטי + refs קלים למשחקים חיצוניים

Live Tagging
= ערוץ הכנסת נתונים נוסף שמתרגם events ל־playerStats או teamStats לפי סוג האובייקט
```

האסטרטגיה:

```txt
כתיבה יקרה יותר
קריאה זולה יותר
טעינה מהירה יותר
מסמכים קטנים יותר
פחות חישובים בכניסה לאפליקציה
שליפה לפי pointer במקום סריקה
hard delete של מסמך הסטטיסטיקה אחרי rollback של aggregates
```

כל שינוי בתהליך, במבנה הנתונים או במיקום האחריות בין השכבות מחייב עדכון של המסמך הזה.
