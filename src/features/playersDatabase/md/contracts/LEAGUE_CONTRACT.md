# League Load Contract

## מקור אמת

ה־League Document הוא המקור הקנוני לטבלת הליגה, לנתוני העונה ול־Team
Performance. כל projection של ביצועי קבוצה חייב להיבנות מאותו League context.

## אחריות

פעולות League רשאיות לכתוב:

- `dbLeagues` כמקור הקנוני.
- `competitionSnapshot` ב־`dbTeamSeasons` קיימים בלבד בעת טעינת טבלה.
- `dbLeaguesCenter/all` כתוצר מרכזי.
- `dbClubsCenter/{seasonId}` כתוצר מרכזי.
- `dbWriteActions` כקבלה תפעולית שאינה מקור עסקי.

הן אינן יוצרות Team Root או Team Season רק משום שקבוצה הופיעה בטבלה.

## פתיחת ליגה ועונה

`leagueOpen` יוצרת או מוסיפה עונה ללא קבוצות. העונה נשמרת עם
`table.tableState: 'NOT_LOADED'`,‏ `table.teamsById: {}` ו־
`tableImportedAt: null`. הפעולה אינה שקולה לטעינת טבלה ריקה; רק תצפית מוצלחת
של המקור הרשמי ללא קבוצות רשאית לשמור `LOADED_EMPTY`.
מודאל טעינת הליגה הפעיל אינו מציע יצירת `LOADED_EMPTY`; הוא דורש טבלת קבוצות
תקינה. התמיכה במצב נשמרת כחלק מחוזה הנתונים בלבד.

הפעולה נשארת במרכז הליגות. המודאל נסגר רק לאחר שהקבלה נסגרה בהצלחה וה־listener
של `dbLeaguesCenter/all` הציג את הליגה והעונה שנפתחו.

## שלבי League

```text
1. open receipt                    → dbWriteActions
2. canonical                       → dbLeagues
3. teamSeasonCompetitionSnapshots  → existing dbTeamSeasons only
4. leaguesCenter                   → dbLeaguesCenter/all
5. clubsCenter                     → dbClubsCenter/{seasonId}
6. audit and close receipt          → dbWriteActions
```

לאחר כל שלב עסקי הקבלה מתעדכנת. ב־`leagueOpen` שלב
`teamSeasonCompetitionSnapshots` מקבל אפס יעדים ולכן אינו כותב מסמך קבוצה.
ניסיון חוזר קורא מקורות טריים ובונה מצב מאושר מחדש.

## מחיקת קבוצות עונה

`leagueTeamsClear` היא הפעולה ההפוכה לטעינת טבלת הליגה, אך אינה מוחקת את
הליגה, את העונה, `Team Root` או `Team Season`. היא מעבירה את טבלת העונה ל־
`NOT_LOADED`, מרוקנת את `teamsById`, מנקה `competitionSnapshot` במסמכי
`Team Season` קיימים ומעדכנת את `LeaguesCenter` ואת `ClubsCenter`.

הפעולה מציגה ומעדכנת בקבלה את אותם שלבים עסקיים של League. אם הכתיבה
הקנונית כבר אושרה ושלב מאוחר יותר נכשל, אין לפתוח מחדש את הקבלה ואין לכתוב
שוב את `dbLeagues`; ניסיון חוזר מפעיל תיקון תוצרים בלבד באותה קבלה.

ב־`leagueLoad`, המודאל מציג את מצב כל שלב בנפרד לפי העדכונים שנרשמו בקבלה.
אם הכתיבה הקנונית טרם אושרה, ניסיון חוזר רשאי להשתמש בקלט המאושר המקורי
ובאותה קבלה פתוחה. אם `canonicalOutcome === 'confirmed'`, אין לפתוח או לאפס
את הקבלה ואין לכתוב שוב את `dbLeagues`; הפעולה הבאה היא תיקון תוצרים בלבד
דרך `repairWriteActionReceipt`, שקורא מקורות טריים ומעדכן את אותה קבלה.

## כללי זהות

זהות קבוצה היא `teamId` יחד עם `teamSlot` או `birthTeamSlot`. אין להסיק slot
משם קבוצה, סדר מערך, רמת ליגה, שנתון או parsing של `teamId`.

## ביצועים ו־Projection

`goalsForPerGame` ו־`goalsAgainstPerGame` מחושבים מנתוני League ונשמרים עם
לכל היותר ספרה אחת אחרי הנקודה. League Load אינו מחשב ביצועים מ־Player Stats.

## תפעול

במסלול League הפעיל אין Job, Queue, lease, retry אוטומטי או background worker.
ניסיון חוזר או תיקון מתבצעים רק בפעולה מפורשת לפי כללי הקבלה שלעיל.
