# תקלות ומשימות נדחות — Players Database

מסמך זה הוא המקום היחיד לריכוז תקלות פתוחות ומשימות המשך שנדחו. מסמכי
ארכיטקטורה מתעדים contracts וזרימות; הם אינם רשימת משימות.

## Movement direction for a secondary team of another club

### MV-001 — כיוון מעבר אל קבוצה 2/3 של מועדון אחר — פתוח

**חומרה: בינונית · סטטוס: נדחה להכרעה**

**הבעיה:** `clubLevel` מתאר את רמת המועדון, ולא בהכרח את רמת קבוצת היעד
הספציפית. לכן מעבר אל קבוצה 2 או 3 של מועדון אחר עלול להיראות בטעות
כעלייה, ירידה או מעבר רוחבי אם משווים רק את רמות שני המועדונים.

**ההתנהגות הזמנית המחייבת:**

- אותו מועדון נשאר מעבר `internal` בלי סיווג כיוון.
- יעד בסלוט 1 של מועדון אחר יכול לקבל `up` / `lateral` / `down` לפי
  `clubLevel`.
- יעד בסלוט 2 או 3 של מועדון אחר נשמר כעובדת Movement מלאה, אך
  `direction: unknown`.

**טיפול עתידי:** להגדיר חוזה השוואה מקצועי ברמת Team Season — למשל רמות
הליגה של קבוצת המקור והיעד, כללי השוואה כשמידע חסר, והשפעת מעבר בין slots —
ורק אז להחליף את הסיווג הזמני.

---

## Club Summary identity lookup

### CS-001 — backfill של זהות קבוצה ב־Club וב־Clubs Master

**חומרה: בינונית · סטטוס: נפתר**

ה־Clubs Summary כבר משתמש ב־`dbClubsMaster/identity__{seasonKey}__{birthYear}`
כ־lookup מדויק של `teamSlot` לפי `seasonKey + birthYear + teamId`. זה פותר
את התצוגה עבור מסמכי Master ישנים בלי parsing של `teamId`.

בוצע rebuild של ה־Club projections ושל `Clubs Master`, כדי שכל
`ageGroups[].current[]` ישמור `teamSlot` וגם כל `nextCompetitionPath` ישמור
`sourceTeamId` ו־`sourceTeamSlot`. לאחר מכן בוצע rebuild נוסף של `Clubs Master`
עם תיקון בחירת ה־slot למסלול הליגה; Audit המערכת החזיר 0 פערים.

לאחר ה־backfill יש לאמת:

- שכל קבוצת עונה נוכחית מקבלת `teamSlot` קנוני.
- ש־Future League Path ישן יכול להיקשר לקבוצת המקור שלו.
- שה־Summary אינו נדרש עוד ל־identity lookup: עמוד המועדונים קורא רק את
  `Clubs Master` ואינו טוען מסמכי identity נוספים.

---

## מקור האמת

סיכון לכך ששנתון ייכנס לרמת ליגה נמוכה יותר בעונה הבאה מחושב מתוך קבוצת
המקור של השנתון שמעל:

1. שורת הקבוצה בטבלת הליגה של אותה עונה (`tableRank`, נקודות ומשחקים).
2. `competitionRules` של עונת הליגה: מקומות עלייה, ירידה ופלייאוף.
3. סטטוס עונת הליגה והתקדמות המשחקים.

החישוב הקנוני הוא
`domain/projections/club/clubCompetition.projection.js` באמצעות
`buildCompetitionProjection`.

במועדון, מספר רמה נמוך יותר מייצג ליגה גבוהה יותר. לכן:

- `RELEGATION_RISK` או `RELEGATED_CONFIRMED` מגדילים את מספר הרמה הצפויה.
- `PROMOTION_POSSIBLE` או `PROMOTED_CONFIRMED` מקטינים את מספר הרמה הצפויה.

לפני 50% מהמשחקים הצפויים, החישוב מחזיר `CURRENT_LEVEL`: רמת הליגה
הנוכחית של קבוצת המקור. מ־50% ומעלה הוא מחשב מיקום חזוי לפי הטבלה וחוקי
הליגה. `UNKNOWN` מוחזר רק כאשר קבוצת המקור אינה קיימת בטבלת ליגה טעונה.

## זרימת הנתונים

טעינת טבלת ליגה מפעילה `syncClubProjectionsFromLeagueTable`.
היא מחשבת את ה־Competition Projection, שומרת אותו ב־Club Document תחת
`competitionPaths[].seasons[].competitionProjection`, ומעבירה את התוצאה
לשנתון הצעיר הבא תחת `competitionPaths[].nextCompetitionPath`. ה־Spotlight
מוצג לקבוצת היעד של השנתון הצעיר, באותו `teamSlot`; קבוצת המקור נשמרת
כ־provenance.

ב־Clubs Master נשמרת רק השלכה קומפקטית של הנתונים האלה:
`competitionPaths[].currentLeagueLevel`, `projectedNextLeagueLevel`, `status`
ו־`source`.

מסמך המועדון ו־Clubs Master אינם מקור אמת. גם `expectedLevelDelta` במסמכי
Team Season וב־SearchIndex אינו מקור אמת של מסלול המועדון; הוא נתון מקביל
המשמש חיפוש וחישובי שחקנים.

בפעולת חריג ידני בעונה פעילה, החריג הידני הוא המקור האפקטיבי של אותה
תחזית עד לביטולו. בעונה שהושלמה נשארת התחזית האוטומטית.

## תקלות מזוהות לטיפול

### CP-001 — בחירת קבוצת מקור לא חד-משמעית לשנתון עם כמה סלוטים — נפתר

**חומרה מקורית: גבוהה · סטטוס: נפתר**

**התקלה:** ה־Competition Path שמר תחזית לשנתון, אך לא שימר את זהות קבוצת
המקור לאורך `nextCompetitionPath` ו־Clubs Master. לכן `Future League Path`
לא יכול היה להצביע על הקבוצה הספציפית שעליה מבוססת התחזית.

**Root cause:** `buildNextCompetitionPath` לא כלל `sourceTeamId` ו־
`sourceTeamSlot`; בנוסף `buildClubsMasterCompetitionPathEntry` השליך את
הזהות הקיימת בעת בניית ההשלכה הקומפקטית.

**התיקון:** הזרימה שומרת ומעבירה את `teamId` ו־`teamSlot` הקנוניים מעונת
המקור אל `nextCompetitionPath` כ־`sourceTeamId` ו־`sourceTeamSlot`, ומשם אל
Clubs Master ו־`ClubIntelligence`. `Future League Path Spotlight` נוצר רק
כאשר שני השדות קיימים, ומזהה את קבוצת היעד באותו slot; קבוצת המקור נשמרת
ב־context. אין fallback לפי סדר מערך, שם, רמת ליגה, שנתון או parsing של
`teamId`.

**ה־contract הקנוני לאחר התיקון:**

- זהות קבוצה: `teamId` יחד עם `teamSlot` / `birthTeamSlot`.
- עונת Competition Path: `teamId`, `teamSlot`.
- `nextCompetitionPath`: `sourceBirthYear`, `sourceTeamId`, `sourceTeamSlot`.
- Clubs Master: מעביר את `sourceTeamId` ו־`sourceTeamSlot` ללא שינוי.
- Spotlight: קבוצת היעד של `birthYear` באותו `teamSlot`, עם זהות המקור ב־context.

**הגנת regression:**

- `clubCompetitionPath.projection.test.js` בודק קבוצת מקור ראשונה, שנייה,
  והיעדר slot ללא המצאה.
- `clubsMaster.projection.test.js` בודק שהזהות נשמרת בהשלכה הקומפקטית.
- `clubIntelligence.builder.test.js` בודק Spotlight לקבוצה השנייה, `teamId`
  נכון, ואי־יצירת Future Path כאשר זהות המקור חסרה.

CP-001 אינו Open Risk עוד; ה־backfill ורענון `Clubs Master` הושלמו, וה־Audit
לאחריהם לא מצא פערים.

### CP-006 — רמת הליגה הנוכחית נבחרה לפי סדר מערך — נפתר

**חומרה מקורית: גבוהה · סטטוס: נפתר**

**התקלה:** בהשלכת Competition Path ל־Clubs Master, השדה
`currentLeagueLevel` נלקח מהעונה הראשונה במערך. במועדון עם שתי קבוצות באותו
שנתון, הסדר יכול היה לבחור את הקבוצה השנייה. התוצאה הייתה איתות Future League
Path שגוי, למשל `L2 → L1` למכבי חיפה כאשר קבוצה 1 בפועל נמצאת ב־L1.

**התיקון:** `buildClubsMasterCompetitionPathEntry` בוחר רק את קבוצת היעד
בעונת הקטלוג הנוכחית עם `teamSlot === sourceTeamSlot`. כשאין slot קנוני אין
fallback ואין `currentLeagueLevel`; לכן גם לא נוצר איתות על סמך ניחוש.

**הגנת regression:** `clubsMaster.projection.test.js` מכסה מערך שבו קבוצה 2
מופיעה לפני קבוצה 1, וכן מצב שבו slot חסר. לאחר התיקון בוצע rebuild של
`Clubs Master`; Audit המערכת החזיר 0 פערים.

### CP-002 — האודיט אינו מאמת את נכונות תחזית הירידה

**חומרה: גבוהה**

האודיט מאמת שקיימת התאמה מבנית בין `competitionPaths` לבין `ageGroups`, אך
אינו מפעיל מחדש את `buildCompetitionProjection` מול טבלת הליגה והחוקים.
תחזית שגויה אך מקושרת היטב אינה מתגלה.

**טיפול נדרש:** להוסיף בדיקת Audit קנונית עבור `status` ו־
`projectedNextLeagueLevel`, כולל Repair שמרענן את מסלול המועדון מן הליגה.

### CP-003 — מסנן "איתור ירידה במסלול הליגה" אינו תחזית לעונה הבאה

**חומרה: בינונית**

מסנן המועדונים משווה רמות בין שכבות גיל המוצגות באותה עונה. הוא אינו משתמש
ב־`competitionPaths[].projectedNextLeagueLevel`. לכן הוא עלול להציג ירידה
היסטורית או מבנית, ולא סיכון ירידה של שנתון בעונה הבאה.

**טיפול נדרש:** להוסיף מסנן/סימון נפרד המבוסס על Competition Projection,
ולשנות את הניסוח כדי להבדיל בין "ירידה במסלול קיים" ל"סיכון ירידה בעונה הבאה".

### CP-004 — שני מקורות תפעוליים ללא בדיקת עקביות

**חומרה: בינונית**

שחקנים וחיפוש משתמשים ב־`expectedLevelDelta`, בעוד מסלול המועדון משתמש
בטבלת הליגה וב־`competitionRules`. אין בדיקה שמוודאת ששני הערכים מתארים
את אותה ירידה או עלייה צפויה.

**טיפול נדרש:** להגדיר מקור נגזר אחד או Audit שמתריע על פער ביניהם.

### CP-005 — `UNKNOWN` בעונת פתיחה חסם סיכון מסלול — נפתר

**חומרה מקורית: בינונית · סטטוס: נפתר**

**התקלה:** לפני 50% משחקים החישוב החזיר `UNKNOWN`, אף כשרמת הליגה של
קבוצת המקור הייתה טעונה וידועה. לכן סיכון לשנתון הצעיר לא הוצג.

**התיקון:** לפני 50% או כאשר חוקי הליגה אינם טעונים, נשמר
`CURRENT_LEVEL` עם רמת הליגה הנוכחית של קבוצת המקור. מ־50% ומעלה החישוב
משתמש בתחזית המיקום. `UNKNOWN` נשמר רק כאשר אין קבוצת מקור בטבלת ליגה
טעונה, ואינו יוצר Spotlight.

**הגנת regression:** `clubCompetition.projection.test.js` מכסה בסיס
מוקדם, חוקים חסרים והיעדר קבוצת מקור; `clubIntelligence.builder.test.js`
מכסה את האיתות לשנתון היעד ואת חסימת `UNKNOWN`.

## קריטריוני קבלה לאחר טיפול

- לכל תחזית יש קבוצת מקור, סלוט ועונה ניתנים לאיתור; קבוצת היעד מזוהה
  באותו slot.
- שנתון עם שתי קבוצות משתמש רק בקבוצת המקור שנבחרה במפורש.
- Audit מזהה תחזית שאינה תואמת לטבלה ולחוקים.
- מסך המועדונים מבחין בין ירידה קיימת במסלול לבין סיכון ירידה בעונה הבאה.
- `UNKNOWN` קיים רק כשאין מקור ליגה טעון ואינו יוצר איתות.
