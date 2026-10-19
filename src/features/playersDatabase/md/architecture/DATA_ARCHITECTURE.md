# Players Database — Data Architecture

## מטרה

מסמך זה מגדיר בעלות, משמעות ומקור אמת. הוא אינו מפרט את מבנה Firestore
המלא; המבנה המחייב נמצא ב־`catalog/firestoreDocuments`.

## שכבות קנוניות

| שכבה | אחריות | מקור אמת |
|---|---|---|
| League Document | טבלת הליגה, עונת הליגה וביצועי הקבוצות הרשמיים | טעינת League |
| Team Root | זהות קבועה של קבוצת שנתון ו־`seasons[]` לניווט | זהות קנונית |
| Team Season | מצב עונה יחיד: סגל, סטטיסטיקה, ביצועים, Balance ו־scout summary | League + Roster + Stats לפי תחום |
| Player Root | זהות שחקן, מעקב ומצב Scouting קומפקטי | Stats ומידע ידני לפי בעלות |
| Player Season | מצב שחקן בעונה אחת | Roster + Stats לפי תחום |
| Player SearchIndex | חיפוש ותצוגה בלבד | Projection מהמקורות הקנוניים |
| ClubProfile | זהות מועדון ומידע ידני ארוך טווח | קלט המועדונים המאושר |
| ClubsDirectory | ספריית מועדונים כללית | Projection מ־ClubProfile |
| LeaguesCenter / ClubsCenter | ניווט ותצוגה עונתיים | Projection מליגה ומקבוצות עונה |

`PlayersDatabaseReadScope` שייך למעטפת הניהול של ההתחברות. האזנת
`LeaguesCenter` מתחילה בכניסה הראשונה ל־Players Database ונשארת יחידה עד
סיום ההתחברות, גם במעבר למסכים אחרים ובחזרה. העמודים משתמשים ב־Read Store
הקיים; שינויים במסמך ממשיכים לעדכן אותו בזמן אמת. רענון שרת מפורש נשאר זמין.
האזנת `ClubsDirectory` פעילה רק בזמן שהמשתמש נמצא במסכי המאגר. בסיום
המעטפת נסגרות ההאזנות ומנוקה מטמון המאגר. אין שינוי במבני Firestore.

עדכון חי או החלפה מפורשת של ערך ב־Read Store גוברים על קריאה שהתחילה
לפניהם ועדיין לא הסתיימה. תשובה מאוחרת או כישלון של אותה קריאה אינם
דורסים את הערך העדכני ואת מצב התצוגה שלו.

`Team Season` הוא מקור האמת לעונת קבוצה אחת. `Team Root` אינו מחזיק payload
עונתי נוסף; `seasons[]` שלו הוא אינדקס ניווט בלבד.

מחברת החקירה הרב־עונתית נשמרת רק ב־`Team Root.notes`: חמישה מסלולים והערות
כלליות, כל אחד עם תוכן אזכורים, מזהי שחקנים קשורים ו־`reportsIds`. הסיכום
מחושב בממשק. `showInvestigationIndicator` הוא החלטת משתמש נפרדת, ברירת המחדל
שלה `false`. עמוד הליגה, `LeaguesCenter` ו־`ClubsCenter` מקבלים ממנה דגל
בוליאני בלבד ברשומת הקבוצה; הם אינם מחזיקים טקסט או מזהי קישורים מהמחברת.
שמירת טקסט מוסיפה את מזהי השחקנים שהוזכרו למערך הקשרים הקיים; הסרת אזכור
מהטקסט אינה מסירה קשר שכבר נוצר. הסרת קשר תדרוש פעולה מפורשת בעת חיבור
ממשק השיוכים.

ב־`ClubsCenter` זהות המסמך משותפת לעונה הטכנית, אך `seasonStatus` שייך לכל
ליגה ונשמר תחת `leaguesById[leagueId]`; אין סטטוס lifecycle יחיד לכל הליגות
שבמסמך העונתי.

## ביצועי קבוצה

`teamSignalSummary` הוא סיכום נגזר של חמש משפחות איתותים, עם עוצמה,
זמינות וגרסאות מבנה וכיול. הוא נשמר ב־Team Season קיים ומוקרן לשורת
הקבוצה ב־League,‏ LeaguesCenter ו־ClubsCenter. העובדות נשארות בבעלות
League,‏ Team Season ו־ClubProfile; אין שימוש במרכזים כמקור לחישוב מחדש.
מחברת החקירה אינה משתנה ואינה מקור לעוצמות. החוזה הפעיל הוא
`../contracts/TEAM_SIGNALS_CONTRACT.md`.

נתוני League הם המקור היחיד ל־`teamGamePlayed`,‏ `goalsFor`,‏
`goalsAgainst`,‏ `tableRank`,‏ `tableAttackRank`,‏ `tableDefenseRank` ולערכי
ה־Pace שלהם. Player Stats אינם רשאים לשכתב אותם.

יש לשמור בנפרד:

- Actual — מה שכבר קרה.
- Pace — קצב הנגזר מה־Actual.
- Projected — תחזית לסוף העונה.

ערכי `goalsForPerGame` ו־`goalsAgainstPerGame` נשמרים עם לכל היותר ספרה
אחת אחרי הנקודה.

## גבולות כתיבה

- שמות המועדון והאליאסים בבעלות ClubProfile. בחירה ידנית בטעינת ליגה רשאית
  להוסיף את השם שהודבק כאליאס באותה עסקה עם League ועם הקרנת הספרייה.
  עריכת שמות מעמוד המועדונים מסנכרנת את הספרייה ושדות השם במרכזים הקיימים,
  בלי לשנות זהות או נתונים עונתיים. הכללים ב־`STANDALONE_EDITS_CONTRACT.md`
  וב־`LEAGUE_CONTRACT.md` תחת `md/contracts`.

- Roster Load כותב סגל, מצב תנועה ומטא־דאטה של הסגל; הוא אינו יוצר Player
  Document רק מפני ששחקן הופיע בסגל.
- Roster Load יוצר `Team Root` מלא רק בהיעדר מסמך. בטעינה חוזרת הוא מעדכן
  את הפניית העונה בלבד ואינו כותב מחדש את `notes`. שמירת מחברת מעדכנת רק
  מסלולים ששונו ואת דגל הסימון, בעסקה אחת עם ההקרנות הקיימות.
- עריכת עמדה או הערה ידנית ומפורשת רשאית ליצור Player Root חסר לשחקן מזוהה מתוך
  רשומת הסגל הקנונית ב־Team Season, באותה עסקה עם עדכון ההיטלים. היא אינה
  יוצרת תמונת סקאוט עונתית חסרה.
- Stats Load כותב `playerStats`,‏ Team Balance, scouting ו־Player projections.
- Stats Load מתעד ב־`TeamSeason.stats.statsLoadState.teamGamePlayedAtLoad`
  את מספר משחקי הקבוצה בטבלת League בזמן הטעינה. זהו בסיס היסטורי בבעלות
  Stats שמוקרן ל־`League.table.teamsById.*.stats.teamGamePlayedAtLoad` בתוך
  העונה. עדכון הטבלה או שחזור הקרנות אינם מקדמים אותו; חוסר תיעוד הוא לא ידוע.
- SearchIndex לעולם אינו מקור לתיקון, Migration או חישוב Expected.
- Audit בודק lifecycle, relations ו־projection mismatch; הוא אינו validator
  של סכמת Firestore.
- Repair מחייב אישור משתמש ומשתמש ב־canonical writers בלבד.

## מבנים שאינם חלק ממצב היעד

המבנים הבאים אינם נשמרים, אינם נבנים מחדש ואינם מקבלים תחליף בשם אחר:

- `clubSeasonIdentityIndex`;
- `dbClubsMaster`;
- `dbLeaguesMaster`;
- `dbFavorites` בשלב הנוכחי;
- `dbWriteActionsV2`;
- SearchIndex ישן מסוג `birthTeamSeason`;
- `playerDocumentId`;
- זהות שחקן המבוססת על שם.

אין להפנות צרכן ישן למבנה חדש שאינו שקול. יש להעביר את הצרכן למקור הראשי
המתאים או להסיר אותו כאשר הצורך עצמו אינו קיים במבנה היעד.

## כלל שינוי

לפני שינוי persistence יש לבדוק לפי הסדר:

```text
Architecture → Firestore Catalog → Domain builder → Writer → Projection → Audit/Repair
```

אין להוסיף שדה לכותב בלי חוזה Catalog תואם, ואין לשכפל נוסחה עסקית בכותבים
שונים.

## בעלות קישורים ועריכה ידנית

- playerUrl של שחקן בקבוצה ובעונה בבעלות רשומת Team Season; Player ואינדקס
  השחקן מכילים עותקים מסונכרנים. במסלול עריכה מעמוד Player שלושתם מחויבים.
- seasonUrl בבעלות עונת League ומוקרן ל־LeaguesCenter בלבד. עריכת הקישור
  מעדכנת שני מסמכים אלה באותה עסקה, ללא קריאת אינדקסי שחקנים או רענון איתותים.
  team.seasonUrl אינו שדה פעיל ב־Player SearchIndex ואינו נכתב בבוני האינדקסים.
  עותקים קיימים יכולים להישאר כמידע ישן שאינו בשימוש; אין צורך בניקוי גורף.
- teamUrl בבעלות שורת הקבוצה בעונת League, גם לפני יצירת Team Season.
  competitionSnapshot.teamUrl ב־Team Season הוא עותק. עריכת הקישור מעדכנת
  רק את League ואת Team Season אם הוא קיים, באותה עסקה וללא יצירת מסמך חסר.
  אין קריאה או כתיבה של אינדקסי שחקנים ואין רענון איתותים. team.teamUrl אינו
  שדה פעיל ב־Player SearchIndex; ערכים ישנים יכולים להישאר ללא סנכרון או ניקוי.
  אין החזרת ערך מעותק למקור.
- ClubProfile.clubUrl הוא שדה קנוני ידני בתוך מסמך שיתר תחומיו נשארים בבעלותם.
  שדה קיים נשמר גם כשהוא ריק. אקסל/קטלוג רשאים לאתחל רק שדה חסר.
  ClubsDirectory ו־ClubsCenter מקרינים אותו מ־ClubProfile. עריכת הקישור אינה
  משנה externalClubId.

כללי פעולות העריכה: `../contracts/STANDALONE_EDITS_CONTRACT.md`.

מגירת עונת League שומרת רק שדות שהשתנו דרך `updateLeagueSeasonSettings`.
שינוי קישור בלבד מסנכרן רק קישורים; שינוי `competitionRules` מחשב תחזיות
באמצעות בוני התחום הקיימים ומשמר manual. כששני התחומים השתנו הם נשמרים
בעסקה אחת, בנתיבי שדות ממוקדים בלי לכתוב מחדש את העונה או הטבלה.
חותמת זמן אחידה נכתבת בכל מסמך ורשומה מקוננת ששונו בפעולת עריכה.
