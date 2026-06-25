// docs/PLAYERS_DB_ARCH.md

# ארכיטקטורת מאגר השחקנים

מסמך זה מתאר את מבנה הנתונים, זרימות הטעינה, עדכון המסמכים ומחיקת המסמכים בתחום `playersDatabase`.

המטרה המרכזית היא לשמור על מערכת חסכונית ב-Firestore: מעט קריאות, מעט כתיבות, מסמכים קטנים וברורים, ומקור אמת אחד לכל נתון שמוצג במסך.

## עקרונות יסוד

1. `dbLeagues` הוא מקור האמת לתצוגת טבלת הליגה.
2. כמות שחקנים, כמות סטטיסטיקות וכמות פרופילי סקאוט בשורת קבוצה מגיעות ממסמך הליגה בלבד.
3. הקולאפס של קבוצה טוען את השחקנים רק כאשר פותחים אותו.
4. טעינת שחקנים אינה אמורה לסרוק את כל המאגר.
5. טעינת סטטיסטיקה בונה גם מסמך חיפוש מהיר.
6. עדכון או מחיקה של שחקנים חייבים לעדכן גם את אינדקס הקבוצה במסמך הליגה.
7. שמות תצוגה צריכים להגיע מהקטלוג הרשמי, לא מהשם הגולמי שהגיע מהאתר.

## הקולקשנים

### `dbLeagues`

מסמך ליגה אחד לכל ליגה.

תפקיד המסמך:

- פרטי הליגה.
- עונות הליגה.
- קישור לצילום האחרון.
- אינדקס קבוצות לצורך תצוגה מהירה בטבלה.

השדה החשוב לתצוגה הוא:

```js
teamsIndex: {
  [teamSeasonKey]: {
    clubId,
    clubName,
    seasonId,
    ageGroupId,
    leagueId,
    teamSlot,
    teamSlotId,
    teamSeasonKey,
    playersCount,
    statsCount,
    searchCount,
    scoutProfilesCount,
    profileCounts,
    rawProfileCounts,
    reliabilityCounts,
    updatedAt
  }
}
```

הטבלה הראשית לא אמורה לספור שחקנים בעצמה. היא קוראת רק מתוך `teamsIndex`.

### `dbLeagueSnapshots`

צילום טבלת ליגה בזמן נתון.

תפקיד המסמך:

- לשמור את שורות הטבלה כפי שנקלטו.
- לשמור נתוני קבוצה בליגה: מקום, משחקים, נקודות, שערי זכות, שערי חובה.
- לשמור זהות קבוצה מחושבת: `clubId`, `teamSlot`, `teamSlotId`, `teamSeasonKey`.

הצילום הוא מקור למבנה הטבלה, אבל לא מקור לכמות השחקנים.

### `dbPlayers`

זהות בסיסית של שחקן.

מסמך אחד לשחקן אמיתי, ללא תלות בעונה או בקבוצה.

שדות עיקריים:

```js
{
  id,
  externalPlayerId,
  fullName,
  normalizedName,
  birthYear,
  birthDate,
  primaryPosition,
  positions,
  positionLayer,
  status,
  source,
  updatedAt
}
```

מסמך זה לא מתאר איפה השחקן משחק בעונה מסוימת.

### `dbPlayerSeasons`

שחקן בתוך עונה וקבוצה.

זה המסמך שמחבר בין שחקן לבין:

- עונה.
- מועדון.
- שנתון.
- קבוצת סלוט.
- ליגה.

שחקן יכול להופיע ביותר ממסמך אחד אם:

- עבר קבוצה באותה עונה.
- שיחק בשנתון מעל.
- שיחק בשתי מסגרות שונות.

שדות עיקריים:

```js
{
  id,
  playerId,
  externalPlayerId,
  fullName,
  seasonId,
  playerBirthYear,
  birthDate,
  clubId,
  clubName,
  ageGroupId,
  teamSlot,
  teamSlotId,
  teamSeasonKey,
  leagueId,
  leagueName,
  sourceTeamName,
  sourceLeagueName,
  primaryPosition,
  positions,
  positionLayer,
  rosterStatus,
  isPlayingUp,
  source,
  updatedAt
}
```

### `dbPlayerStats`

סטטיסטיקה של שחקן בקבוצה/ליגה/עונה.

מסמך זה מחזיק:

- סטטיסטיקה נוכחית.
- היסטוריית טעינות.
- תוצאת חישוב סקאוט בסיסית לצורך תצוגה מהירה.

מבנה עיקרי:

```js
{
  id,
  playerId,
  playerSeasonId,
  teamSeasonKey,
  seasonId,
  leagueId,
  clubId,
  ageGroupId,
  teamSlot,
  teamSlotId,
  statsType,
  current,
  history,
  rawScoutProfileIds,
  eligibleScoutProfileIds,
  scoutProfileIds,
  bestScoutProfileId,
  bestScoutReliabilityLevel,
  updatedAt
}
```

היסטוריה נשמרת לפי מפתח לוגי:

```js
seasonId + snapshotType + roundNumber
```

כך טעינה חוזרת של אותו מחזור מחליפה את אותה נקודה בהיסטוריה ולא יוצרת כפילות.

### `dbPlayerSearch`

קולקשן חיפוש מהיר.

מסמך אחד לכל מסמך סטטיסטיקה.

המטרה שלו היא לאפשר שאילתות מהירות בלי לפתוח את כל מסמכי השחקנים.

שדות עיקריים:

```js
{
  id,
  playerId,
  playerSeasonId,
  fullName,
  normalizedName,
  teamSeasonKey,
  clubId,
  clubName,
  seasonId,
  ageGroupId,
  leagueId,
  current,
  rawScoutProfileIds,
  rawScoutProfiles,
  eligibleScoutProfileIds,
  eligibleScoutProfiles,
  blockedScoutProfiles,
  scoutProfileIds,
  scoutProfiles,
  bestScoutProfileId,
  bestScoutProfileLabel,
  bestScoutReliabilityLevel,
  searchText,
  updatedAt
}
```

הבדל חשוב:

- `rawScoutProfileIds` = פרופילים שהשחקן מתאים להם בלי הקשר ביצוע קבוצתי.
- `scoutProfileIds` / `eligibleScoutProfileIds` = פרופילים אחרי בדיקת ההקשר הקבוצתי.

## מזהי קבוצה

### `clubId`

מזהה המועדון הרשמי מהקטלוג.

זה המזהה שצריך לחבר בין כל המסכים.

### `clubName`

שם התצוגה הרשמי מהקטלוג.

השם שהגיע מהאתר נשמר רק כ-`sourceTeamName`.

### `teamSlot`

מספר הקבוצה בתוך אותו מועדון ושנתון.

דוגמאות:

- `1` = הקבוצה הבכירה בשנתון.
- `2` = קבוצה נוספת באותו שנתון.

### `teamSlotId`

מזהה קבוצה בתוך מועדון ושנתון:

```js
clubId + ageGroupId + teamSlot
```

### `teamSeasonKey`

מזהה הקבוצה הספציפית בעונה וליגה:

```js
clubId + seasonId + ageGroupId + teamSlot + leagueId
```

זה המפתח המרכזי של `teamsIndex`.

## זרימת כניסה למסך

כאשר נכנסים ל-`/players-database`:

1. נטענת רשימת הליגות מתוך `dbLeagues`.
2. נטענים ברקע צילומי הליגה האחרונים לפי `latestSnapshotId` בלבד.
3. לא נטענים שחקנים.
4. לא נטענות סטטיסטיקות שחקנים.
5. המסך הראשי מציג מידע כללי מתוך מסמכי הליגות.
6. נתוני הרקע משמשים לאיתור מוקדם של שנתונים עם חסימת ליגה.

כאשר פותחים ליגה:

1. נטען מסמך הליגה מתוך `dbLeagues`.
2. נטען צילום הליגה האחרון מתוך `dbLeagueSnapshots`.
3. שורות הטבלה נבנות מתוך הצילום.
4. ספירות השחקנים נלקחות מתוך `dbLeagues.teamsIndex`.
5. הקולאפסים סגורים ולכן לא מתבצעת טעינת סגלים.

## זרימת טעינת שחקנים

טעינת שחקנים מתבצעת מתוך קולאפס של קבוצה.

בשלב זה כבר קיימים:

- `leagueId`
- `seasonId`
- `ageGroupId`
- `clubId`
- `clubName`
- `teamSlot`
- `teamSlotId`
- `teamSeasonKey`

המערכת מדביקה רשימת שחקנים, בונה פריוויו, ואז בשמירה:

1. יוצרת או מעדכנת מסמך ב-`dbPlayers`.
2. יוצרת או מעדכנת מסמך ב-`dbPlayerSeasons`.
3. מפעילה רענון אינדקס קבוצה.
4. מעדכנת את `dbLeagues.teamsIndex[teamSeasonKey].playersCount`.

הטבלה הראשית תציג את הספירה רק אחרי שמסמך הליגה עודכן.

## זרימת טעינת סטטיסטיקה

טעינת סטטיסטיקה מתבצעת מתוך קולאפס של קבוצה שיש בה שחקנים.

המערכת:

1. מקבלת את הקשר הקבוצה מהקולאפס.
2. מקבלת מספר מחזור או סימון טעינה עונתית.
3. מזהה שחקנים מול `dbPlayerSeasons`.
4. מאפשרת טיפול בשחקנים שלא זוהו:
   - הסרה מהטעינה.
   - הוספה לסגל כשחקן שנתון מתחת.
   - שיוך לשחקן קיים.
5. בשמירה יוצרת/מעדכנת `dbPlayerStats`.
6. בונה או מעדכנת `dbPlayerSearch`.
7. מעדכנת את `dbLeagues.teamsIndex`.

## עדכון סטטיסטיקה חוזר

אם טוענים שוב את אותה סטטיסטיקה עבור אותו:

- שחקן.
- עונה.
- סוג טעינה.
- מספר מחזור.

המערכת לא אמורה ליצור כפילות.

היא מחליפה את אותו אובייקט בתוך `history`, מעדכנת את `current`, ואז בונה מחדש את מסמך החיפוש.

אם טוענים מחזור אחר, נוסף אובייקט נוסף ל-`history`.

## פרופילי סקאוט

בטעינת סטטיסטיקה נבנים שני סוגי התאמה:

### התאמה ללא הקשר קבוצתי

נשמרת ב:

```js
rawScoutProfileIds
rawScoutProfiles
```

מתארת האם השחקן מתאים לפרופיל לפי הנתונים האישיים בלבד.

### התאמה עם הקשר קבוצתי

נשמרת ב:

```js
eligibleScoutProfileIds
eligibleScoutProfiles
scoutProfileIds
scoutProfiles
```

מתארת האם השחקן מתאים לפרופיל לאחר בדיקת הביצוע הקבוצתי.

## חיפוש שחקנים

חיפוש מתוך טבלת הליגה עובד בשני שלבים:

1. הטבלה מציגה ספירות מתוך `dbLeagues.teamsIndex`.
2. פתיחת קולאפס במצב חיפוש טוענת רק את השחקנים המתאימים מתוך `dbPlayerSearch`.

דוגמא:

```js
where('teamSeasonKey', '==', teamSeasonKey)
where('scoutProfileIds', 'array-contains', profileId)
```

או בחיפוש ללא הקשר:

```js
where('teamSeasonKey', '==', teamSeasonKey)
where('rawScoutProfileIds', 'array-contains', profileId)
```

## איתור שנתונים עם חסימת ליגה

יש מנוע שמאתר מועדונים שבהם שנתון מסוים משחק בליגה גבוהה יותר מהשנתון שמעליו באותה עונה.

המטרה היא לזהות שחקנים או שנתונים שעלולים לעלות בעונה הבאה לקבוצת גיל שבה מסגרת הליגה של המועדון נמוכה יותר.

מקור האמת לאיתור הוא:

```js
dbLeagues + dbLeagueSnapshots
```

האיתור לא מתבסס על `teamsIndex`, כי `teamsIndex` מיועד לספירות שחקנים ופרופילי סקאוט, ולא בהכרח כולל כל קבוצה לפני טעינת סגל.

תנאי בסיסי:

```js
same clubId
same seasonId
upperAgeGroup(current.ageGroupId)
upperTeam.leagueLevel > currentTeam.leagueLevel
```

כאשר `level` מספרי גבוה יותר מייצג ליגה נמוכה יותר:

```js
1 = ליגת על
2 = לאומית
3 = ארצית
4 = מחוזית
```

ברירת המחדל משווה אותו `teamSlot` בין קבוצת הגיל הנוכחית לקבוצת הגיל שמעליה. אפשר לפתוח את המנוע להשוואת כל הסלוטים באותו מועדון באמצעות `sameTeamSlotOnly: false`.

## עדכון עמדה

כאשר מעדכנים חוליה או עמדה:

1. מתעדכן `dbPlayerSeasons`.
2. אם יש סטטיסטיקה לשחקן, נבנים מחדש:
   - `dbPlayerStats`
   - `dbPlayerSearch`
3. מתעדכן `dbLeagues.teamsIndex`.

הסיבה: חלק מפרופילי הסקאוט תלויים בעמדה או חוליה.

## מחיקת שחקנים

מחיקת שחקן או כמה שחקנים מקולאפס חייבת למחוק כמה שכבות.

עבור כל `playerSeasonId`:

1. מחיקת `dbPlayerSeasons`.
2. מחיקת כל מסמכי `dbPlayerStats` ששייכים אליו.
3. מחיקת כל מסמכי `dbPlayerSearch` ששייכים אליו.
4. עדכון `dbLeagues.teamsIndex`.

מסמך `dbPlayers` לא נמחק כברירת מחדל, כי הוא מייצג זהות שחקן כללית וייתכן שהשחקן קיים בקבוצה אחרת או בעונה אחרת.

## מחיקת כל השחקנים בקבוצה

כאשר מוחקים את כל השחקנים מקולאפס:

1. מאתרים את כל `dbPlayerSeasons` לפי זהות הקבוצה.
2. מוחקים את כולם.
3. מוחקים סטטיסטיקות וחיפוש לכל אחד מהם.
4. מעדכנים את `dbLeagues.teamsIndex`.

אחרי הפעולה הצפוי:

```js
playersCount: 0
statsCount: 0
searchCount: 0
profileCounts: {}
rawProfileCounts: {}
```

## מקור אמת לפי מסך

### טבלת הליגה

מקור אמת:

```js
dbLeagues + dbLeagueSnapshots
```

ספירות:

```js
dbLeagues.teamsIndex
```

### קולאפס קבוצה

מקור אמת רגיל:

```js
dbPlayerSeasons + dbPlayerStats
```

מקור אמת במצב חיפוש:

```js
dbPlayerSearch
```

### פריוויו טעינה

מקור אמת זמני:

```js
state מקומי
```

רק לחיצה על אישור כותבת ל-Firestore.

## כללי זהירות

1. לא להציג בטבלת הליגה ספירה שחושבה מקומית מתוך הקולאפס.
2. לא להשתמש בשם קבוצה כמפתח ראשי.
3. לא לשמור שם מקור כשם תצוגה רשמי.
4. לא ליצור מסמך סטטיסטיקה בלי `playerSeasonId`.
5. לא לעדכן סטטיסטיקה בלי לעדכן גם `dbPlayerSearch`.
6. לא למחוק `dbPlayerSeasons` בלי למחוק גם סטטיסטיקה וחיפוש.
7. לא לעדכן עמדה בלי לבנות מחדש את פרופילי הסקאוט.

## בדיקת תקינות מהירה

כאשר יש בעיה בספירה בטבלה:

1. לבדוק שבמסמך `dbLeagues` קיים:

```js
teamsIndex[teamSeasonKey].playersCount
```

2. לבדוק שהשורה בצילום הליגה מחזיקה את אותו:

```js
teamSeasonKey
```

3. אם המפתח שונה, לבדוק:

```js
clubId
seasonId
ageGroupId
teamSlot
leagueId
```

4. אם הנתונים קיימים במסמך הליגה אבל לא מוצגים, הבעיה היא בחיבור הטבלה ל-`teamsIndex`, לא בטעינת השחקנים.
