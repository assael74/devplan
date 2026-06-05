# DevPlan — Live Tagging Stats Pipeline

תאריך יצירה: 31/05/26

מסמך זה מתאר את תהליך הכנסת הנתונים דרך `LiveTaggingPanel` כחלק ממסלול הסטטיסטיקה המתקדמת בפרויקט `devplan`.

מיקום יעד בפרויקט:

```txt
C:\projects\devplan\docs\architecture\LIVE_TAGGING_STATS_PIPELINE.md
```

מסמך זה משלים את:

```txt
C:\projects\devplan\docs\architecture\ADVANCED_STATS_PIPELINE.md
```

---

## 01 — מטרת המסמך

מטרת Live Tagging היא לאפשר תיוג פעולות בזמן אמת או בזמן צפייה בווידאו, לשמור את האירועים ב־state מקומי, ובסיום session להמיר אותם למבנה הסטטיסטיקה הרשמי שנשמר ב־Firestore.

העיקרון:

```txt
Live Event
→ Local Session State
→ Save Model
→ Payload
→ Firestore Create Route
```

Live Tagging אינו מודל אחסון עצמאי. הוא ערוץ הכנסת נתונים נוסף לסטטיסטיקה מתקדמת.

---

## 02 — החלטת מוצר מרכזית

Live Tagging הוא create-only מבחינת UX.

כלומר:

```txt
אין עריכה של מסמך סטטיסטיקה קיים
אין מחיקה של מסמך סטטיסטיקה קיים
אין טעינה של gameStatsShorts לעריכה
אין update route מתוך LiveTaggingPanel
```

כאשר משחק כבר מכיל:

```js
{
  hasStats: true,
  statsDocId: 'gameStatsDocId'
}
```

או:

```js
{
  gameStatsDocId: 'gameStatsDocId'
}
```

המשחק צריך להופיע disabled בשדה בחירת המשחק במצב יצירת סטטיסטיקה חדשה.

---

## 03 — נקודת כניסה

נקודת הכניסה למסך:

```txt
src/features/liveTagging/LiveTaggingPanel.js
```

אחריות הפאנל:
- להציג את ה־UI.
- לקבל model מתוך hook.
- לא להכיל חישובי payload כבדים.
- לא לכתוב ישירות ל־Firestore.

ה־state וה־handlers מרוכזים ב:

```txt
src/features/liveTagging/hooks/useLiveTaggingPanelModel.js
```

---

## 04 — מבנה תיקיות מומלץ

```txt
src/features/liveTagging/
  LiveTaggingPanel.js
  index.js

  hooks/
    useLiveTaggingPanelModel.js

  logic/
    index.js
    liveTagging.actions.js
    liveTagging.flow.js
    liveTagging.model.js
    liveTagging.payload.js
    liveTagging.selection.js

  ui/
    index.js

    toolbar/
      index.js
      LiveClockBar.js
      LiveObjectGameSelector.js
      LiveActionsGrid.js
      LiveEventsList.js

    drawer/
      index.js
      LiveZonesDrawer.js
      LiveActionsSettingsDrawer.js
      LivePitch.js

    sx/
      liveTagging.sx.js
      base.sx.js
      clock.sx.js
      actions.sx.js
      events.sx.js
      selection.sx.js
      subject.sx.js
      zones.sx.js
```

---

## 05 — סוגי אובייקטים ב־Live Tagging

הקוד משתמש ב־subject types הבאים:

```js
export const LIVE_SUBJECT_TYPES = {
  PLAYER: 'player',
  PRIVATE_PLAYER: 'privatePlayer',
  SCOUT_PLAYER: 'scoutPlayer',
  TEAM: 'team',
}
```

אפשרויות UI:

```js
export const LIVE_SUBJECT_OPTIONS = [
  {
    id: LIVE_SUBJECT_TYPES.PLAYER,
    label: 'שחקן',
    disabled: false,
    idIcon: 'player'
  },
  {
    id: LIVE_SUBJECT_TYPES.PRIVATE_PLAYER,
    label: 'שחקן פרטי',
    disabled: false,
    idIcon: 'private'
  },
  {
    id: LIVE_SUBJECT_TYPES.SCOUT_PLAYER,
    label: 'שחקן במעקב',
    disabled: true,
    idIcon: 'scouting'
  },
  {
    id: LIVE_SUBJECT_TYPES.TEAM,
    label: 'קבוצה',
    disabled: false,
    idIcon: 'teams'
  },
]
```

### player

שחקן רגיל מתוך קבוצה.

דרישות:

```txt
playerId
teamId
gameId
```

שמירה:

```txt
route: create
service: createGameStatsDoc
```

תוצאה:
- נוצר `gameStatsShorts/{gameStatsDocId}`.
- נשמר `playerStats`.
- מחושב `teamStats` מתוך `playerStats`.
- מתעדכן `games.gameInfo`.
- מתעדכן `playersStats`.
- מתעדכן `teamsStats`.

### privatePlayer

שחקן פרטי עם משחק חיצוני.

דרישות:

```txt
playerId
gameId
```

אין `teamId`.

שמירה:

```txt
route: privatePlayerSave
service: savePrivatePlayerGameStatsDoc
```

תוצאה:
- נוצר או נשמר `gameStatsShorts/{gameStatsDocId}` עם `teamId: ''`.
- מתעדכן `externalGames.gameInfo`.
- מתעדכן `privates.privatePlayersStats`.
- לא מתעדכן `games.gameInfo`.
- לא מתעדכן `playersStats`.
- לא מתעדכן `teamsStats`.

ב־Live Tagging עצמו יש לחסום שמירה אם למשחק חיצוני כבר יש סטטיסטיקה קיימת, למרות שה־service הפרטי יודע גם לעדכן. ההחלטה המוצרית היא create-only.

### scoutPlayer

שחקן במעקב.

סטטוס:

```txt
disabled
```

כרגע:
- מופיע ב־UI כהכנה עתידית.
- לא ניתן לבחור.
- אין route שמירה.
- אין Firestore flow.

### team

סטטיסטיקה קבוצתית ישירה.

דרישות:

```txt
teamId
gameId
```

שמירה:

```txt
route: teamOnlyCreate
service: createTeamOnlyGameStatsDoc
```

תוצאה:
- נוצר `gameStatsShorts/{gameStatsDocId}`.
- נשמר `statsScope: 'teamOnly'`.
- נשמר `playerStats: []`.
- נשמר `teamStats` ישיר מתוך אירועי Live Tagging.
- מתעדכן `games.gameInfo`.
- מתעדכן `teamsStats`.
- לא מתעדכן `playersStats`.

חשוב:
`createGameStatsDoc` לא מתאים למצב team-only כי הוא דורש `playerStats` לא ריק ומחשב `teamStats` מתוך השחקנים.

---

## 06 — מבנה Live Event

אירוע Live Tagging נבנה דרך:

```txt
src/shared/liveTagging/events/liveEvent.builder.js
```

מבנה מומלץ:

```js
{
  id: 'evt_123456789',
  sessionId: 'sessionId',
  gameId: 'gameId',
  teamId: 'teamId',

  subject: {
    type: 'player',
    playerId: 'playerId',
    teamId: 'teamId'
  },

  clock: {
    period: 1,
    minute: 12,
    second: 34,
    ms: 754000
  },

  action: {
    id: 'passes_positive',
    baseId: 'passes',
    label: 'מסירות - טובה',
    shortLabel: 'טובה',
    side: 'positive',
    group: 'passing',
    scope: 'player',
    idIcon: 'passes',
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

  note: '',

  meta: {
    source: 'live',
    createdAt: 123456789
  }
}
```

---

## 07 — קטלוג פעולות Live

מקור האמת לפעולות Live:

```txt
src/shared/liveTagging/actions/liveActionStatsMap.js
```

דוגמאות mapping:

```txt
passes
→ passesTotal
→ passesSuccess
→ passesSuccessRate

shots
→ shotsTotal
→ shotsOnTarget
→ shotsOnTargetSuccessRate

tackles
→ tacklesTotal
→ tacklesSuccess
→ tacklesSuccessRate

personalPressures
→ personalPressuresTotal
→ personalPressuresSuccess
→ personalPressuresSuccessRate

ballLoss
→ ballLoss

interceptions
→ interceptions

fouls
→ foulsDrawn / foulsCommitted
```

כל פעולה נבנית לשתי פעולות אפשריות לפי side:

```txt
positive
negative
```

לדוגמה:

```txt
passes_positive
passes_negative
```

---

## 08 — המרת אירועים לסטטיסטיקה

קובץ אחראי:

```txt
src/features/liveTagging/logic/liveTagging.payload.js
```

פונקציה מרכזית:

```js
buildLiveTaggingStatsSaveModel({
  events,
  selection,
  players,
  games,
  sessionId,
})
```

הפונקציה מחזירה:

```js
{
  ok: true,
  route: 'create' | 'privatePlayerSave' | 'teamOnlyCreate',
  payload
}
```

או:

```js
{
  ok: false,
  error: 'reason'
}
```

### חוקי המרה

אם לאירוע יש `totalStatId`:

```txt
totalStatId +1
```

אם הפעולה חיובית ויש `statId` שונה מ־`totalStatId`:

```txt
statId +1
```

אם אין `totalStatId` ויש `statId`:

```txt
statId +1
```

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

Rates לא מחושבים ב־UI. הם מחושבים מחדש בשכבת engine/service.

---

## 09 — Payload לפי route

### route: create

שחקן רגיל:

```js
{
  gameId: 'gameId',
  teamId: 'teamId',
  status: 'partial',
  source: 'liveTagging',
  preset: 'liveTagging',

  selectedPlayerIds: ['playerId'],
  selectedParmIds: ['passesTotal', 'passesSuccess'],

  meta: {
    scope: 'player',
    source: 'liveTagging',
    sessionId: 'sessionId',
    timePlayed: 80,
    timeVideoStats: 12
  },

  timePlayed: 80,
  timeVideoStats: 12,

  playerStats: [
    {
      playerId: 'playerId',
      timePlayed: 80,
      timeVideoStats: 12,
      stats: {
        passesTotal: 4,
        passesSuccess: 3
      },
      completeness: {}
    }
  ]
}
```

### route: privatePlayerSave

שחקן פרטי:

```js
{
  gameId: 'externalGameId',
  status: 'partial',
  source: 'privatePlayerProfile',
  preset: 'liveTagging',

  selectedPlayerIds: ['privatePlayerId'],
  selectedParmIds: ['passesTotal', 'passesSuccess'],

  meta: {
    scope: 'privatePlayer',
    source: 'liveTagging',
    playerId: 'privatePlayerId',
    sessionId: 'sessionId',
    timePlayed: 80,
    timeVideoStats: 12
  },

  timePlayed: 80,
  timeVideoStats: 12,

  playerStats: [
    {
      playerId: 'privatePlayerId',
      timePlayed: 80,
      timeVideoStats: 12,
      stats: {
        passesTotal: 4,
        passesSuccess: 3
      },
      completeness: {}
    }
  ]
}
```

### route: teamOnlyCreate

קבוצה:

```js
{
  gameId: 'gameId',
  teamId: 'teamId',
  status: 'partial',
  source: 'liveTaggingTeamOnly',
  preset: 'liveTagging',

  selectedPlayerIds: [],
  selectedParmIds: ['passesTotal', 'passesSuccess'],

  meta: {
    scope: 'team',
    source: 'liveTagging',
    sessionId: 'sessionId',
    timePlayed: 80,
    timeVideoStats: 12
  },

  timePlayed: 80,
  timeVideoStats: 12,

  playerStats: [],

  teamStats: {
    gameId: 'gameId',
    teamId: 'teamId',
    playersCount: 0,
    timePlayed: 80,
    timeVideoStats: 12,
    passesTotal: 4,
    passesSuccess: 3
  }
}
```

---

## 10 — שמירה ל־Firestore

ה־hook שמבצע routing:

```txt
src/features/hub/hooks/games/useGameStatsHubUpdate.js
```

ה־Live Tagging לא משתמש ב־`runSave`, אלא מפעיל route מפורש:

```js
if (saveModel.route === 'privatePlayerSave') {
  await runPrivatePlayerSave(saveModel.payload)
} else if (saveModel.route === 'teamOnlyCreate') {
  await runTeamOnlyCreate(saveModel.payload)
} else {
  await runCreate(saveModel.payload)
}
```

הסיבה:
`runSave` הוא route כללי שיכול להגיע ל־update לפי `gameStatsDocId`. Live Tagging לא אמור להגיע ל־update.

---

## 11 — בחירת משחק במצב יצירת סטטיסטיקה

ב־Live Tagging או בכל מצב של יצירת סטטיסטיקה חדשה יש להשתמש בשדה בחירת משחק במצב:

```js
pickerMode="createStats"
disableAlreadyInGame={false}
```

הסבר:
- `hasStats`, `statsDocId`, `gameStatsDocId` קובעים אם משחק חסום ליצירת סטטיסטיקה חדשה.
- `isAlreadyInGame` מתאר אם שחקן כבר משויך למשחק ואינו קשור לשאלה האם קיימת סטטיסטיקה.
- לכן אין להשתמש ב־`isAlreadyInGame` כדי לחסום יצירת סטטיסטיקה.

אם למשחק כבר קיימת סטטיסטיקה:
- להציג אותו disabled.
- להציג chip כמו "סטטיסטיקה קיימת" / "סטטיסטיקה חלקית" / "סטטיסטיקה רשמית".
- לא לאפשר שמירה מתוך Live Tagging על אותו משחק.

---

## 12 — UX בסיסי

ה־UI בנוי כך:

```txt
LiveObjectGameSelector
LiveClockBar
LiveActionsGrid
LiveEventsList
Sticky Save Footer
LiveZonesDrawer
LiveActionsSettingsDrawer
```

כללי UX:
- בחירה של subject/game מנקה pending action.
- בחירה של פעולה פותחת zone drawer.
- בחירה של zone יוצרת event.
- מחק אחרון מוחק event אחרון בלבד.
- בטל session מוחק את כל האירועים המקומיים.
- סיים ושלח מבצע שמירה רשמית.
- אחרי שמירה מוצלחת, session מקומי מתנקה.

---

## 13 — גבולות אחריות

### LiveTaggingPanel

אחראי על render בלבד ככל האפשר.

### useLiveTaggingPanelModel

אחראי על:
- state.
- handlers.
- חיבור CoreData.
- חיבור Firestore update hook.
- routing לפי saveModel.

### liveTagging.payload

אחראי על:
- המרת events ל־payload.
- קביעת route.
- validation בסיסי.

### liveTagging.selection

אחראי על:
- subject types.
- סינון שחקנים.
- סינון משחקים.
- זיהוי שחקן פרטי.
- זיהוי משחק חיצוני.
- זיהוי משחק עם stats pointer.

### shared/liveTagging

אחראי על:
- קטלוג פעולות.
- בניית event.
- שעון.
- אזורי מגרש.

### services/firestore/shorts/gameStats

אחראי על:
- שמירה ל־Firestore.
- transactions.
- aggregates.
- pointers.
- status.

אין לבצע כתיבות Firestore ישירות מתוך UI.

---

## 14 — בדיקות חובה

### שחקן רגיל

```txt
בחר שחקן
בחר משחק ללא סטטיסטיקה קיימת
תייג פעולה
שמור
```

Expected:
```txt
route=create
gameStatsShorts נוצר
games.gameInfo מקבל statsDocId
playersStats מתעדכן
teamsStats מתעדכן
```

### שחקן פרטי

```txt
בחר שחקן פרטי
בחר external game ללא סטטיסטיקה קיימת
תייג פעולה
שמור
```

Expected:
```txt
route=privatePlayerSave
gameStatsShorts נוצר
externalGames.gameInfo מקבל statsDocId
privatePlayersStats מתעדכן
games.gameInfo לא משתנה
teamsStats לא משתנה
playersStats לא משתנה
```

### קבוצה

```txt
בחר קבוצה
בחר משחק ללא סטטיסטיקה קיימת
תייג פעולה
שמור
```

Expected:
```txt
route=teamOnlyCreate
gameStatsShorts נוצר עם statsScope=teamOnly
playerStats=[]
teamStats נשמר ישיר
games.gameInfo מתעדכן
teamsStats מתעדכן
playersStats לא משתנה
```

### משחק עם סטטיסטיקה קיימת

```txt
בחר subject
פתח רשימת משחקים
```

Expected:
```txt
משחק עם hasStats/statsDocId/gameStatsDocId מופיע disabled
לא ניתן לבחור אותו ל־Live Tagging create
```

### scoutPlayer

```txt
פתח subject type buttons
```

Expected:
```txt
שחקן במעקב מופיע disabled
אין אפשרות שמירה
```

---

## 15 — החלטות שלא לשנות בלי דיון

1. Live Tagging הוא create-only מבחינת UX.
2. Live Tagging לא עורך מסמכי סטטיסטיקה קיימים.
3. Live Tagging לא מוחק מסמכי סטטיסטיקה קיימים.
4. משחק עם סטטיסטיקה קיימת חסום לבחירה במצב createStats.
5. player רגיל חייב `playerId + teamId + gameId`.
6. privatePlayer חייב `playerId + gameId` ואין לו `teamId`.
7. team mode הוא team-only stats עם `playerStats: []`.
8. scoutPlayer הוא הכנה עתידית בלבד ומופיע disabled.
9. `isAlreadyInGame` אינו מדד לקיום סטטיסטיקה.
10. `hasStats/statsDocId/gameStatsDocId` הם המדדים לקיום סטטיסטיקה.
11. אין לחשב rates ב־UI.
12. אין לכתוב ישירות ל־Firestore מתוך `LiveTaggingPanel`.
13. שינוי ב־Live Tagging שקשור ל־Firestore מחייב עדכון גם של `ADVANCED_STATS_PIPELINE.md`.
