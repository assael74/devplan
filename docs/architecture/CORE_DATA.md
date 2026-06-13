# Core Data - שכבת הרכבת הנתונים המרכזית

מסמך זה מתאר את תפקיד `src/features/coreData`, את סדר הטעינה הנוכחי, ואת תהליך הפיכת מסמכי Firestore shorts לאובייקטים העיקריים של האפליקציה.

יש לצרף את המסמך הזה לצ'אט כאשר המשימה קשורה לטעינת נתונים, אובייקטים ראשיים, enriched players/teams/clubs, אינדקסים, relations, או ביצועים בכניסה לאפליקציה.

---

## תפקיד השכבה

`src/features/coreData` היא שכבת הרכבת הדאטה המרכזית של DevPlan.

Firestore מחזיק נתונים מפוצלים במסמכי `shorts`. השכבה הזו מחברת את המסמכים האלה לאובייקטים עשירים ומוכנים לצריכה:

- `clubs`
- `teams`
- `players`
- `privatePlayers`
- `roles`
- `meetings`
- `payments`
- `games`
- `videos`
- `videoAnalysis`
- `scouting`

הצריכה נעשית דרך `useCoreData()` מתוך `CoreDataProvider`.

---

## מיקום בקוד

הקבצים המרכזיים:

- `src/features/coreData/CoreDataProvider.js`
- `src/features/coreData/resolvers/coreData.resolver.js`
- `src/features/coreData/resolve/coreData.resolver.next.js`
- `src/features/coreData/resolve/merge-stage.js`
- `src/features/coreData/resolve/index-stage.js`
- `src/features/coreData/resolve/enrich-stage.js`
- `src/features/coreData/resolve/relations-stage.js`
- `src/features/coreData/resolvers/builders/*`
- `src/features/coreData/utils/*`

`coreData.resolver.js` הוא wrapper ששומר API יציב ומפנה ל־`resolveCoreDataNext`.

---

## סדר providers וטעינה

ב־`src/app/App.js`, הסדר הנכון הוא:

```txt
AuthProvider
-> CoreDataProvider
-> BrowserRouter
-> NotificationsProvider
-> LifecycleProvider
-> CreateModalProvider
-> AppRoutes
```

המשמעות:

1. קודם Firebase Auth מזהה אם יש משתמש.
2. רק אחרי שיש `user`, `CoreDataProvider` פותח subscriptions ל־Firestore.
3. אם אין `user`, `CoreDataProvider` מחזיר state ריק ויציב ולא פותח subscriptions.

הסדר הזה חשוב במיוחד בכניסה קרה בתחילת יום, אחרי שהאפליקציה היתה לא פעילה. הוא מונע מצב שבו CoreData מתחיל לקרוא Firestore לפני ש־Auth סיים להתאפס.

---

## סדר הטעינה הנוכחי

כאשר יש משתמש מחובר, `CoreDataProvider` פותח subscriptions ל־shorts הבאים:

```txt
clubsShorts
teamsShorts
playersShorts
privatePlayersShorts
scoutingShorts
meetingsShorts
paymentsShorts
gamesShorts
externalGamesShorts
rolesShorts
videosShorts
videoAnalysisShorts
```

`tagsShorts` לא נטען דרך `CoreDataProvider` ולא חוסם טעינה. עבור תאימות, `tagsShorts` נשאר כ־array ריק.

כרגע ה־loading הראשי של CoreData מסתיים רק אחרי שכל ה־collections ברשימה למעלה החזירו snapshot ראשון.

הנתונים החשובים ביותר לטעינה ראשונית של האפליקציה הם:

1. `clubs`
2. `teams`
3. `players`

לאחר מכן נדרשים נתוני summary עבור בחירת ישות:

1. `meetings`
2. `payments`
3. `games`
4. `videos`
5. `videoAnalysis`

`privatePlayersShorts` חשוב, אבל הוא יכול להגיע אחרי `playersShorts` בסבב ראשוני.

---

## זרימת resolver

הזרימה המרכזית נמצאת ב־`src/features/coreData/resolve/coreData.resolver.next.js`.

```txt
input shorts
-> mergeCoreShorts
-> buildCoreIndexes
-> enrichTeams
-> enrichPlayers
-> enrichMeetings
-> enrichScouting
-> attachPlayerStatsAndVideos
-> attachTeamStatsAndVideos
-> buildFinalRelations
-> useCoreData value
```

---

## 1. Merge stage

קובץ: `src/features/coreData/resolve/merge-stage.js`

מטרה:

- לחבר מסמכי shorts מפוצלים לאובייקטי בסיס.
- לבחור מסמך base מתאים לכל domain.
- לנרמל שחקנים ומשחקים לפי source.

דוגמאות:

- `clubsShorts` -> `clubs`
- `teamsShorts` -> `teamsBase`
- `playersShorts` + `privatePlayersShorts` -> `playersBase`
- `gamesShorts` -> `gamesBase`
- `externalGamesShorts` -> `externalGamesBase`
- `videoAnalysisShorts` -> `videoAnalysisBase`
- `videosShorts` -> `videosBase`

שחקנים:

```txt
playersShorts
-> mergeStandardPlayers
-> playerSource: "club"

privatePlayersShorts
-> mergePrivatePlayers
-> playerSource: "private"

standardPlayersBase + privatePlayersBase
-> uniqById
-> playersBase
```

משחקים:

```txt
gamesShorts
-> gameSource: "team"

externalGamesShorts
-> gameSource: "external"
```

---

## 2. Index stage

קובץ: `src/features/coreData/resolve/index-stage.js`

מטרה:

- לבנות maps ואינדקסים כדי למנוע חיפוש חוזר במערכים.
- להכין relations מהירים לשלבי enrich ו־relations.

אינדקסים מרכזיים:

- `clubById`
- `teamBaseById`
- `playerBaseById`
- `meetingsById`
- `paymentsById`
- `teamGamesByTeamId`
- `externalGamesByPlayerId`
- `allGamesByPlayerId`
- `trainingWeeksByTeamId`
- `teamMeetingsByTeamId`
- `videosByMeetingId`
- `videosByPlayerId`
- `videosByTeamId`
- `rolesByClubId`
- `rolesByTeamId`
- `meetingsByPlayerId`
- `paymentsIdsByPlayerId`

---

## 3. Enrich stage

קובץ: `src/features/coreData/resolve/enrich-stage.js`

מטרה:

- להוסיף לכל אובייקט relations ונתונים מחושבים.
- לחבר שחקנים לקבוצות, מועדונים, פגישות, תשלומים ומשחקים.
- לחבר קבוצות למועדון, משחקים, אימונים, פגישות ומדדי ביצוע.

### enrichTeams

מקבל `teamsBase` ומוסיף:

- `club`
- `trainingWeeks`
- `trainingSummary`
- `teamMeetings`
- `teamGames`
- `targets`
- `advancedStats`

### enrichPlayers

מקבל `playersBase` ומוסיף:

- `team`
- `club`
- `targets`
- `meetings`
- `payments`
- `trainingWeeks`
- `teamMeetings`
- `teamGames`
- `externalGames`
- `playerGames`
- `age`
- `playerFullName`
- `generalPosition`
- `abilitiesState`
- `advancedStats`

שחקן פרטי לא מחובר ל־team רגיל. עבורו משחקים מגיעים מ־`externalGames`.

### attachPlayerStatsAndVideos

מוסיף לשחקנים:

- סטטיסטיקות משחקים דרך `buildPlayersWithStats`
- `videos`

חשוב ביצועית:

`buildVideosWithEntities` זקוק למפות של meetings/players/teams/tags. המפות נבנות פעם אחת באמצעות `buildVideoEntityMaps`, ואז מועברות לכל חיבור וידאו. אסור לבנות את המפות מחדש לכל שחקן.

### attachTeamStatsAndVideos

מוסיף לקבוצות:

- סטטיסטיקות קבוצה דרך `buildTeamsWithStats`
- `videos`
- `teamPerformance`

גם כאן מפות הווידאו נבנות פעם אחת ולא לכל קבוצה.

---

## 4. Relations stage

קובץ: `src/features/coreData/resolve/relations-stage.js`

מטרה:

- לבנות את האובייקטים הסופיים של האפליקציה.
- לחבר relations הפוכים.
- להחזיר את החוזה המלא של `useCoreData`.

פעולות מרכזיות:

- `team.players`
- `team.roles`
- `team.squadStrength`
- `team.keyPlayers`
- `club.teams`
- `club.roles`
- `club.keyPlayers`
- `playerById`
- `teamById`
- `videoAnalysis` עם entities
- `videos` עם tags/entities לפי הצורך

---

## חוזה useCoreData

`useCoreData()` מחזיר:

- `loading`
- `error`
- `patchEntity`
- raw shorts arrays
- arrays של entities מוכנים
- maps לפי id

דוגמאות:

```js
const {
  loading,
  clubs,
  teams,
  players,
  roles,
  meetings,
  payments,
  games,
  videos,
  videoAnalysis,
  clubById,
  teamById,
  playerById,
} = useCoreData()
```

כאשר אין משתמש מחובר, CoreData מחזיר arrays ריקים ו־maps ריקים, בלי לפתוח Firestore subscriptions.

---

## patchEntity

`patchEntity(entityType, id, patch)` מעדכן state מקומי של shorts אחרי update/create/delete כדי שהמסך יתעדכן מיד בלי לחכות ל־snapshot הבא.

ה־entity types המרכזיים:

- `players`
- `privates`
- `teams`
- `clubs`
- `roles`
- `scouting`
- `meetings`
- `payments`
- `games`
- `externalGames`
- `videoAnalysis`
- `videos`

אין `tags` ב־CoreData Provider.

---

## כללי ביצועים

1. לא להחזיר חישובים כבדים לתוך render של מסכים.
2. לבנות maps פעם אחת ב־resolver pass ולא בתוך loop לכל שחקן/קבוצה.
3. לא להוסיף collection ל־`loading` הראשי אם הוא לא הכרחי לפתיחת האפליקציה.
4. לא להחזיר את `tagsShorts` ל־Firestore loading בלי סיבה ברורה.
5. אם מוסיפים domain חדש, צריך להחליט אם הוא:
   - קריטי לטעינה ראשונית
   - דרוש ל־summary לאחר בחירת ישות
   - lazy/on-demand
6. נתוני summary שנדרשים מיד לאחר בחירת ישות צריכים להיות זמינים מוקדם, אבל לא בהכרח לחסום את Home/tasks.

---

## כיוון עתידי מומלץ

המצב הנוכחי עדיין משתמש ב־`loading` אחד לכל CoreData. אם חוזרים לטפל בטעינה ראשונית, הכיוון המומלץ הוא לפצל סטטוסים:

```js
coreReady        // clubs + teams + players
accessReady      // roles
summaryReady     // meetings + payments + games + videos/videoAnalysis
secondaryReady   // scouting, external domains, etc.
```

כך Home/tasks יוכלו להיפתח מוקדם, בזמן ש־CoreData ממשיך להשלים נתונים ברקע.

נכון לעכשיו הפיצול הזה לא מיושם במלואו. המסמך מתאר את המצב הקיים ואת הכיוון המומלץ.
