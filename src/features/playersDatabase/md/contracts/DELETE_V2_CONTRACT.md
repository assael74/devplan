# Delete V2 Contract

> **סטטוס:** חוזה קנוני למחיקות ו־Clear בתקופת המיגרציה ל־Write V2.
>
> מטרת החוזה היא להגדיר גבולות בעלות, תנאי קדם, משמעות Canonical,
> סנכרון Projections, Receipt ו־Audit V2 עבור פעולות מחיקה.
>
> מחיקה אינה מערכת נפרדת. היא דרך נוספת להביא Domain למצב קנוני חדש.

---

## 1. עקרון־על

כל Flow רשאי להקטין רק מצב קנוני שבבעלותו.

אם קיימת תלות קנונית של Domain אחר:

```text
Dependency של Domain אחר קיימת
→ BLOCK
```

ולא:

```text
Dependency של Domain אחר קיימת
→ Cascade אוטומטי
```

אין Cascade נסתר בין Stats, Roster ו־League.

הסימטריה בין טעינה למחיקה היא בעיקר ברמת ה־Expected State וה־Projections.
ה־Canonical mutation של כל Flow נשאר מוגבל לבעלות שלו.

---

## 2. מסלול מחיקה קנוני

כל פעולת Clear/Delete V2 עוברת:

```text
Read Canonical
↓
Validate Preconditions
↓
Build Proposed Plan + Impact
↓
Preview
↓
Approval
↓
Freeze Approved State
↓
Create WriteAction Receipt
↓
Canonical Mutation
↓
Projection Sync
↓
Audit V2
↓
Close
```

לפני Approval קיים Proposed Plan בלבד.

`Approved State` נוצר רק לאחר Approval והוא snapshot בזיכרון של כל
ההחלטות, ה־patches והיעדים שאושרו לביצוע Final Sync דטרמיניסטי.

אין לבצע שינוי Canonical לפני שנוצר בהצלחה WriteAction Receipt.

---

## 3. מקורות אמת

החלטת מחיקה ובדיקת תנאי קדם נגזרות ממקורות קנוניים בלבד.

```text
Canonical
→ קובע מה צריך להיות

Projection
→ משמש רק לקריאת Actual State
```

SearchIndexes, Club projections, Clubs Master ו־Leagues Master אינם מקורות
אמת למחיקה.

Projection שגוי אינו מקבל סמכות למחוק Canonical ואינו יוצר Cascade.

---

## 4. Expected State וקיום מסמכים

Audit V2 ו־Reconcile V2 משתמשים באותו Expected State גם לאחר טעינה וגם לאחר
מחיקה.

ברמת מסמך קיימים שלושה מצבים:

```text
REQUIRED
→ המסמך חייב להתקיים

ABSENT
→ המסמך חייב לא להתקיים

OPTIONAL
→ קיום המסמך תלוי בבעלים אחרים
```

ברמת רשומה או חלק בבעלות Flow בתוך מסמך משותף:

```text
REQUIRED
→ הרשומה שבבעלות ה-Flow חייבת להתקיים

ABSENT
→ הרשומה שבבעלות ה-Flow חייבת לא להתקיים
```

`OPTIONAL` ברמת המסמך אינו הופך את הרשומה שבבעלות Flow לאופציונלית.

לדוגמה:

```text
Identity Document → OPTIONAL
League-owned Identity entries → ABSENT
```

---

## 5. מסמכים משותפים

במסמך משותף Writer רשאי להסיר רק מידע שבבעלותו.

הכלל:

```text
הסר owned entries
↓
נשאר מידע של בעלים אחרים?
├── כן → שמור את המסמך
└── לא → מחק את המסמך רק אם חוזה המסמך מאפשר זאת
```

הכלל חל במיוחד על:

- Club Season Identity Index.
- Club Documents.
- Clubs Master.
- Leagues Master כאשר רלוונטי.
- Player Document כאשר Flow רשאי לשנות רק חלק ממנו.

אין למחוק מסמך משותף רק משום שהמידע של Flow הנוכחי הוסר.

---

## 6. Canonical predicates

תנאי קדם אינם מוגדרים לפי ניסוח כללי כגון "Stats נקיים".

יש להגדיר Domain predicates קנוניים יחידים, ולהשתמש בהם ב־Preview,
Writers וב־Audit.

### 6.1 Team Season Stats State

נדרש builder קנוני:

```text
getTeamSeasonStatsState()
→ absent | present
```

ה־predicate אינו בודק עצם קיום של שדות. לפי הקטלוג, שדות Stats יכולים
להתקיים גם כאשר Stats אינם טעונים.

המצב הקנוני `absent` לאחר `CLEAR_STATS` מוגדר במפורש כך:

```text
statsStatus = missing
playerStats = cleared canonical object
teamBalance.availability = unavailable
teamBalance.availabilityReason = stats_not_loaded
Stats-derived scouting state = cleared
scoutProfilesSummary = empty
Stats-owned Player Document season state = removed/cleared
```

`teamPlayers` נשמר מבחינת חברות, זהות וסדר ה־Roster, אך מותר ל־Stats Clear
לנקות או לאפס בתוך רשומות השחקנים את תתי־השדות שבבעלות Stats בלבד.

כל מצב שאינו תואם לייצוג הקנוני המלא של `absent` ייחשב `present` או
מצב לא תקין לפי Domain builder. Preview, Writers ו־Audit חייבים להשתמש
באותו builder ובאותה הגדרה.

Balance מנוקה נבנה רק באמצעות `buildStatsAbsentTeamBalance()` מקלט ריק
וקבוע. הוא אינו תלוי ב־`teamPlayers`, בתפקידים, בטביעת הסגל או בביצועי
הליגה. `source.inputHash` שלו הוא טביעת הקלט הריק הקבוע, ולא טביעת הסגל.
כל קריאה מחזירה אובייקט עצמאי במבנה ה־Catalog ובגרסאות המודל הנוכחיות.

`Clear Stats` בונה אותו לפני Approval; ה־Writer מחיל את הערך המאושר בלבד.
ה־predicate וביקורת Stats משתמשים באותו Builder ומשווים את כל מצב ה־Stats,
כולל Balance מלא: אין התעלמות ממונים, מטביעה שגויה או משאריות scouting.
ריקון הסגל לאחר מכן אינו משנה את מצב היעדר הסטטיסטיקה, ואינו מקנה
ל־`Clear Roster` בעלות על Balance.

Balance מנוקה מהייצוג הישן שתלוי בסגל אינו מקבל פטור מהבדיקה. אם אינו
תואם לייצוג הקבוע, נדרשת מחיקת Stats מפורשת עם Preview ואישור חדשים.
אין הסבה אוטומטית, ואין שינוי בחישוב Balance כאשר Stats טעונים.

### 6.2 Team Season existence

בדיקות Roster ו־League חייבות להסתמך על Team Root + Team Season הקנוניים,
ולא על Team SearchIndex.

---

## 7. CLEAR_STATS

### 7.1 בעלות

`CLEAR_STATS` הוא Flow של Stats.

הוא רשאי לנקות רק Stats-owned state.

הוא רשאי להסיר או לאפס, לפי חוזי Stats והקטלוג:

- `playerStats`.
- `statsStatus`.
- Team Balance.
- Stats-derived scouting.
- `scoutProfilesSummary`.
- Stats-owned metadata.
- Stats-owned SearchIndex fields.
- Stats-owned League projections.
- Stats-owned Club/Master projections.

### 7.2 מידע שחייב להישמר

`CLEAR_STATS` אינו רשאי לשנות:

- `teamPlayers`.
- Roster membership.
- `transfersIn`.
- `transfersOut`.
- `pendingPlayers`.
- Team Performance הרשמי שמקורו ב־League.
- League table.

ניקוי Stats אינו יוצר Movement ואינו משנה Movement.

לכן אין שלב Counterpart Movement ב־Clear Stats, אלא אם פעולה עתידית נפרדת
תגדיר שינוי Movement מפורש ומאושר.

### 7.3 Player Document

Stats Clear רשאי בתוך Player Document:

- להסיר או לאפס שדות Stats/Scouting שבבעלות Stats.
- להסיר רשומת עונה אם עצם קיומה נובע מ־Stats והחוזה הקנוני מגדיר אותה
  כ־Stats-owned.

Stats Clear אינו רשאי למחוק את Player Document כולו.

מחיקת Player Document כולו שייכת ל־Player lifecycle contract נפרד.

### 7.4 תנאי קדם

Team Root ו־Team Season חייבים להתקיים.

מצב Stats נקבע באמצעות `getTeamSeasonStatsState()`.

### 7.5 תוצאה קנונית

לאחר Clear מוצלח:

```text
Roster → נשמר
Movement → נשמר
Official Team Performance → נשמר
Stats state → absent
Stats-derived state → absent/reset לפי החוזה
```

### 7.6 Audit

בסיום מופעל `Stats Audit V2`.

אין `Delete Stats Audit` נפרד.

---

## 8. CLEAR_ROSTER

### 8.1 בעלות

`CLEAR_ROSTER` הוא Flow של Roster.

### 8.2 תנאי קדם קשיח

לפני Approval:

```text
getTeamSeasonStatsState() = present
→ BLOCK

getTeamSeasonStatsState() = absent
→ ניתן להמשיך
```

Roster אינו מקבל בעלות על Stats רק משום שהמשתמש ביקש למחוק את הסגל.

### 8.3 מידע שבבעלות Roster

Roster רשאי להסיר:

- `teamPlayers`.
- Roster-owned metadata.
- `pendingPlayers`.
- `transfersIn` ו־`transfersOut` של עונת הקבוצה הנמחקת.
- Roster-owned SearchIndex state.

ב־`CLEAR_ROSTER`, השדות `transfersIn`, `transfersOut` ו־`pendingPlayers`
מתאפסים ל־`[]`, משום שהם נגזרו מהסגל של אותה עונה. אין שלב Counterpart:
אין לקרוא, לבדוק או לשנות את מסמך הקבוצה שבצד השני של מעבר. כל צד עצמאי,
וחוסר או סתירה בצד השני אינם חוסמים את המחיקה. `rosterImport` מתאפס לערכי Catalog:
`mode: AUTHORITATIVE_SNAPSHOT`, מפתחות וטביעה ריקים ו־`effectiveAt: null`.
`teamPlayers = []` ו־`playersCount = 0` מגדירים יחד עם אלה מצב Roster absent.
ה־predicate של Roster אינו בודק Stats; תנאי Stats absent נבדק בנפרד.

### 8.4 מידע שאסור למחוק

Roster אינו רשאי למחוק:

- Stats.
- Stats-derived scouting.
- Player Document.
- League canonical table.
- Official Team Performance.

### 8.5 Team Season

Team Season ו־Team Root נשמרים תמיד בזרימה זו. אינדקס העונות שב־Root אינו
משתנה. `teamSeasonDocumentId` נשמר ב־Team SearchIndex. זהויות, ביצועי League,
Balance ו־scouting נשמרים ללא שינוי. מחיקת הסגל אינה
מוחקת Player Documents ואינה כותבת בהם. ניקוי Stats שייך ל־Clear Stats בלבד.

Player SearchIndexes של הקבוצה והעונה נמחקים. מוני הסגל מתעדכנים ב־Team
SearchIndex, בשורת League, ב־Club וב־Clubs Master; סיכומי Leagues Master
נגזרים מחדש ממסמכי League קנוניים. סיכומי ההעברות של עונת הקבוצה ב־Club
וב־Clubs Master מתאפסים מתוך המצב הקנוני הריק, ללא גישה לקבוצות אחרות.

מסמך משותף או רשומת יעד חסרים/עמומים חוסמים Prepare לפני יצירת Receipt.
הזרימה אינה יוצרת השלמה חלקית של מסמך חסר. תיקון יעד חסר הוא פעולה נפרדת.

### 8.6 Audit

בסיום מופעל `Roster Audit V2`.

---

## 9. DELETE_PLAYER_FROM_ROSTER

זוהי פעולת Roster ממוקדת.

### 9.1 תנאי קדם

יש לבדוק את מצב השחקן בעונה באמצעות predicate קנוני.

```text
לשחקן אין Stats/Scouting owned state
→ ניתן להסיר מה-Roster

לשחקן יש Stats/Scouting owned state
→ BLOCK
```

פעולה משולבת עתידית מותרת רק אם תוגדר במפורש כבעלת Ownership גם על Stats.

### 9.2 בעלות

הפעולה רשאית לשנות:

- `teamPlayers`.
- Roster Movement.
- `pendingPlayers`.
- Roster-owned projections.
- Counterpart Movement כאשר נדרש.

היא אינה רשאית למחוק:

- Player Stats.
- Stats-derived scouting.
- Player Document.
- Stats-owned projections באופן שקט.

### 9.3 Already removed

אם השחקן כבר אינו חבר ב־Roster והמצב הקנוני כבר תואם לתוצאה המבוקשת,
הפעולה היא idempotent success ללא שינוי עסקי.

אם היעד אינו חד־משמעי או קיימת סתירה קנונית, הפעולה נכשלת לפני Approval.

---

## 10. CLEAR_LEAGUE_TEAMS

### 10.1 בעלות

`CLEAR_LEAGUE_TEAMS` הוא Flow של League.

הוא אינו מוחק Team Seasons.

### 10.2 תנאי קדם קשיח

אם קיימים Team Seasons רלוונטיים לעונת הליגה:

```text
BLOCK
```

League אינו מבצע Cascade ל־Roster או Stats.

### 10.3 משמעות Canonical

ה־Catalog מבדיל בין:

```text
tableRank = null
→ טבלת הליגה טרם נטענה

tableRank = []
→ טבלת הליגה נטענה וכרגע ריקה
```

לכן:

```text
CLEAR_LEAGUE_TEAMS
→ tableRank = []
```

`CLEAR_LEAGUE_TEAMS` אינו מוחק את League Season.

### 10.4 Team SearchIndex

לאחר תנאי הקדם אין Team Season, Roster או Stats שדורשים Team SearchIndex
עבור הקבוצה והעונה.

לכן Team SearchIndex הרלוונטי יכול להיות:

```text
Document existence → ABSENT
```

### 10.5 Identity

ה־Writer מסיר רק Identity entries השייכים ל־League הנוכחית.

```text
נשארו entries של Leagues אחרות
→ שמור את Identity Document

לא נשארו entries כלל
→ מחק את Identity Document
```

Expected State:

```text
Identity Document → OPTIONAL
League-owned Identity entries → ABSENT
```

Audit V2 חייב לפרש:

```text
Expected League entries ריקים
+ Identity Document חסר
→ תקין

Expected League entries ריקים
+ Identity קיים עם entries של Leagues אחרות
→ תקין

נשאר entry של ה-League שנוקתה
→ Finding

Identity Document קיים עם entries ריקים לחלוטין
→ stale empty projection
```

Audit אינו רשאי להחזיר `missing_projection` רק משום שה־Identity Document
חסר כאשר אין Identity entries צפויים.

### 10.6 Club Documents ו־Clubs Master

אלה מסמכים משותפים.

ה־Writer מסיר רק projections/entries השייכים לקבוצות ול־League שנוקו.

```text
Document existence → OPTIONAL
League-owned entries → ABSENT
```

מידע של Leagues, קבוצות או עונות אחרות נשמר.

### 10.7 Leagues Master

League Season נשאר קנוני ולכן League/Season entry ב־Leagues Master נשאר
נדרש.

Leagues Master אינו שומר `tableRank` עצמו. לאחר Clear הסיכומים שלו נגזרים
מ־League Season הריק, ובפרט:

```text
teamsCount = 0
playersCount = 0
tableRankCount = 0
```

ושאר הסיכומים מחושבים לפי חוזה Leagues Master והמצב הקנוני הנוכחי.

### 10.8 Audit

בסיום מופעל `League Audit V2`.

אין Audit נפרד ל־League Clear.

---

## 11. DELETE_LEAGUE_SEASON

### 11.1 בעלות

זוהי מחיקת ה־Canonical של League Season.

### 11.2 תנאי קדם

לפני Approval יש לבצע dependency scan קנוני.

תלות קנונית של Domain אחר היא Blocker.

בפרט:

- Team Seasons רלוונטיים אינם קיימים.
- Roster state רלוונטי אינו קיים.
- Stats state רלוונטי אינו קיים.

Projection ישן או שגוי אינו מקור אמת ואינו כשלעצמו הרשאה ל־Cascade.

Stale projection יכול להפוך ל־Audit Finding ולניקוי דרך Reconcile.

### 11.3 League Document lifecycle

לאחר הסרת העונה יש להשתמש ב־Domain builder יחיד שמכריע אם League Document
עצמו עדיין נדרש.

ההכרעה חייבת להתחשב ב:

- current season.
- history seasons.
- League catalog.
- כללי lifecycle הקנוניים.

ה־Writer אינו ממציא כלל lifecycle משלו.

### 11.4 Audit

בסיום מופעל `League Audit V2` על המצב הקנוני החדש.

`League Audit V2` חייב לתמוך גם ביעד שבו ה־Canonical Season כבר אינו קיים.

ה־audit target נשאר locator קטן:

```text
{
  leagueId,
  seasonKey
}
```

וה־Expected State כולל:

```text
Canonical Season existence → ABSENT
```

במצב זה Audit אינו נכשל רק משום שה־Season או League Document אינם קיימים.
הוא בונה Expected absence מתוך ה־locator, ה־Catalog והמצב הקנוני שנותר,
וסורק אחר projections ישנים השייכים לעונה שנמחקה, לרבות לפי החוזים:

- Identity entries.
- Team SearchIndexes.
- Club projections.
- Clubs Master entries.
- Leagues Master entries.
- projections נוספים שבכיסוי League Audit V2.

כך מחיקת Canonical מוצלחת עדיין ניתנת להוכחה באמצעות Audit V2.

אם League Document נשאר בגלל עונות אחרות או Catalog, Audit קורא אותו
ומוודא שרק העונה שנמחקה נעדרת. אם League Document כולו אינו נדרש עוד
ונמחק לפי lifecycle, גם היעדרו הוא Expected State תקין.

---

## 12. Player Document lifecycle

Player Document הוא Domain קנוני בפני עצמו.

הכללים הבסיסיים:

```text
Roster
→ אינו יוצר Player Document רק בגלל חברות בסגל
→ אינו מוחק Player Document
```

Stats רשאי ליצור או לעדכן Player Document בהתאם לחוזי Stats/Scouting.

Stats Clear רשאי לנקות רק Stats/Scouting-owned state בתוך Player Document,
אך אינו מוחק את המסמך כולו.

מחיקת Player Document כולו דורשת Player lifecycle contract נפרד שיכריע
לפי הסיבות הקנוניות לקיום המסמך, כגון:

- Profile.
- Favorite.
- Watchlist.
- Manual tracking.
- Transfer.
- Stats/Scouting state.
- עונות אחרות.

---

## 13. Proposed Plan, Approved State ו־Receipt

שלושת המושגים נפרדים.

### 13.1 Proposed Plan

נבנה לפני Preview ומכיל את התוכנית וה־Impact המוצעים.

הוא עדיין אינו מאושר.

### 13.2 Approved State

נוצר רק לאחר Approval.

הוא יכול וצריך להכיל בזיכרון:

- target.
- canonical mutation.
- approved decisions.
- expected patches.
- affected entities.
- projection inputs.

הוא משמש לביצוע Final Sync דטרמיניסטי.

אין לצמצם אותו ל־impact counters בלבד.

### 13.3 WriteAction Receipt

Receipt הוא מסמך קטן בלבד.

הוא אינו שומר:

- Approved payload.
- Expected State מלא.
- Actual State מלא.
- Findings מלאים.
- Recovery state.
- Jobs או retries.

Receipt נוצר אחרי Freeze Approved State ולפני ה־Canonical mutation הראשון.

---

## 14. Receipt contract למחיקות

אותו WriteAction V2 משמש Import, Clear ו־Delete.

נדרש להוסיף ל־WriteAction contract ול־Catalog שדה:

```text
operationType
```

ערכים קנוניים:

```text
import
clear
delete
```

`flowType` ממשיך לזהות את ה־Domain:

```text
league
roster
stats
```

ה־label יכול לזהות פעולה ספציפית כגון Clear Stats או Delete Player.

מבנה Receipt המינימלי נשאר:

```text
id
flowType
operationType
label
auditTarget
canonicalStatus
lastAuditAt
lastAuditSummary
status
createdAt
updatedAt
```

`auditTarget` הוא locator קטן בלבד.

### 14.1 canonicalStatus

```text
pending
reported
failed_or_unknown
```

הוא מתאר מה ה־Receipt הצליח לדווח, לא הוכחה מוחלטת למה שקרה ב־Firestore.

אם Canonical mutation הצליח אך עדכון Receipt נכשל:

```text
אין Rollback
canonicalStatus מבחינת הדיווח → failed_or_unknown
נדרש לקרוא מחדש את ה-Canonical/Audit
```

### 14.2 status

החוזה הקנוני הוא:

```text
open
closed
abandoned
```

המימוש וה־Catalog חייבים לתמוך באותו enum.

פעולה שנכשלה לפני Canonical יכולה לעבור ל־`abandoned` באופן מפורש.

אסור לסמן פעולה כ־`abandoned` לאחר כתיבת Canonical או כאשר תוצאת הכתיבה
אינה ידועה. ב־Clear Roster וב־Clear Stats, Retry אינו נוטש Receipt: הוא קורא מקורות מחדש,
בונה תוכנית חדשה ומחייב אישור חדש, תוך שימוש באותו Receipt פתוח לאותו יעד.
גם אחרי רענון עמוד נבחר ה־Receipt הפתוח מהשרת. כמה רשומות פתוחות לאותו
יעד חוסמות את ההמשך ודורשות בדיקה; אין בחירה שקטה או יצירת רשומה נוספת.
אין שחזור Approved State ישן, rollback או Resume של רשימת שלבים ישנה.

Clear Stats יוצר Receipt וכל שדות החובה שלו בכתיבה אחת.
לפני כל ביצוע נבדקות כל פעולות Stats הפתוחות: אין פתוחות — יוצרים Receipt;
פעולת Clear Stats יחידה לאותו יעד — משתמשים בה מחדש; פעולה ליעד אחר,
פעולת Stats מסוג אחר או יותר מפעולה פתוחה אחת — חוסמות ללא כתיבה.
Clear Stats אינו הופך פעולת טעינה פתוחה לפעולת מחיקה.

אין יצירת Receipt ואחריה
השלמת metadata בכתיבה נפרדת. גם Receipt ישן עם label של CLEAR_STATS וללא
operationType מזוהה כפעולת מחיקה קיימת, ואינו מצדיק יצירת רשומה נוספת.

Clear Roster שומר תיעוד ביצוע קטן: executionStatus, lastCompletedStep,
failedStep ו־failedTarget בצורת { targetType, documentId } או null.
כל שלב שהושלם או דולג באופן תקין מעדכן lastCompletedStep. בכשל נשמרים
השלב והיעד שנכשלו והפעולה נשארת open. כשל בכתיבת התיעוד עצמו מוצג למשתמש.
בתחילת ביצוע חוזר מתאפסים פרטי הכשל, lastCompletedStep וסיכום הביקורת הקודם;
canonicalStatus אינו מתאפס ואינו משמש הוכחה לכך שלא הייתה כתיבה.
מתחילים שוב מהשלב הראשון עם Approved State חדש, באופן idempotent.
רק לאחר Audit מלא ותקין נכתבים יחד status closed ו־executionStatus succeeded.
אין שמירת Approved State, תוכנית התאוששות או מצב Resume ב־Receipt.

Clear Roster דורש בנוסף למצב Stats absent מהשרת: אין פעולת Stats פתוחה,
והפעולה האחרונה של Stats לקבוצה ולעונה נסגרה עם דיווח Canonical ועם
ביקורת מלאה ללא ממצאים. בהיעדר הוכחה זו הפעולה חסומה; Receipt אינו מחליף
את בדיקת המצב הקנוני. בדיקת הקדם חלה גם ב־Prepare ובאישור לפני יצירת Receipt.

כאשר Stats כבר absent וכל ההקרנות תקינות, ממשק Clear Stats מאפשר אישור
ביקורת וסיום. המסלול יוצר Receipt, מדלג על כתיבות עסקיות שאינן נדרשות,
קורא Actual מחדש מהשרת וסוגר את ה־Receipt רק לאחר ביקורת מוצלחת.

---

## 15. Idempotency ומטרות חסרות

כל Clear/Delete V2 חייב להגדיר תוצאה דטרמיניסטית להרצה חוזרת.

### 15.1 Clear שכבר בוצע

כאשר ה־Canonical כבר נמצא בדיוק במצב היעד:

```text
→ idempotent success
→ אין שינוי עסקי נוסף
```

Audit עדיין רשאי לבדוק את ה־Projections.

### 15.2 CLEAR_STATS כאשר Team Season חסר

Team Season הוא תנאי קדם ל־Stats.

לכן:

```text
Team Season חסר
→ precondition failure
```

אין ליצור Team Season ואין להפוך זאת ל־Clear מוצלח.

### 15.3 DELETE_PLAYER כאשר השחקן כבר הוסר

אם אין סתירה קנונית והמצב כבר תואם לתוצאה:

```text
→ idempotent success
```

אם קיימים Stats/Scouting או relations סותרים:

```text
→ BLOCK / precondition failure
```

### 15.4 CLEAR_ROSTER כאשר Team Season חסר

בזרימה הנוכחית Team Root ו־Team Season הם תנאי קדם ונשמרים. יעד חסר מחזיר
כשל תנאי קדם, ולא נוצר לצורך המחיקה. כאשר המסמך קיים במצב Roster absent,
כל שלבי ההקרנה והביקורת עדיין זמינים כדי לנקות שאריות מהרצה קודמת.

### 15.5 CLEAR_LEAGUE_TEAMS שכבר בוצע

אם League Season קיים ו־`tableRank = []`:

```text
→ idempotent success
```

Projection Sync ו־Audit יכולים עדיין להסיר stale projections.

### 15.6 DELETE_LEAGUE_SEASON כאשר העונה אינה קיימת

אם ה־League Season כבר אינה קיימת ואין סתירה קנונית:

```text
→ idempotent success
```

Stale projections מטופלים על ידי Audit/Reconcile ולא הופכים את העונה
החסרה מחדש לקיימת.

---

## 16. כשל לאחר Canonical

מרגע שה־Canonical mutation הצליח:

```text
Canonical החדש הוא מקור האמת
```

אין Rollback למצב הישן בגלל כשל Projection, Receipt או Audit.

אם שלב מאוחר נכשל:

```text
Canonical נשאר
↓
Audit V2 קורא מחדש
↓
Findings
↓
Reconcile V2 בונה Expected מחדש מה-Canonical הנוכחי
```

אין replay עיוור של payload ישן ואין Recovery engine נפרד למחיקות.

---

## 17. Audit V2

מחיקות משתמשות באותם Audits של ה־Domains:

```text
Stats → auditStatsV2
Roster → auditRosterV2
League → auditLeagueV2
```

אין:

```text
auditDeleteStatsV2
auditDeleteRosterV2
auditDeleteLeagueV2
```

Audit V2 תמיד:

```text
Read Current Canonical
↓
Build Expected State
↓
Read Current Actual State
↓
Compare
```

Audit V2 נשאר Read Only.

שמירת `lastAuditSummary` ב־Receipt מתבצעת מחוץ ל־Audit על ידי orchestration
או Receipt service.

---

## 18. Findings לאחר מחיקה

אין צורך בסוגי Findings מיוחדים למחיקה.

הסוגים הקיימים יכולים לתאר גם absence:

```text
unexpected_document
missing_document
source_mismatch
broken_relation
stale_projection
```

דוגמאות:

```text
Team Season אינו קיים
+ Player SearchIndex עדיין קיים
→ unexpected_document / stale_projection

League tableRank = []
+ נשאר League Identity entry
→ stale_projection

מסמך משותף קיים אך owned entry הוסר
+ קיימים entries של בעלים אחרים
→ תקין
```

---

## 19. Coverage וסגירה

Coverage ופערים הם ממדים נפרדים:

```text
coverage: partial | complete
findingsCount: 0 | n
```

`clean` מותר רק כאשר:

```text
coverage = complete
findingsCount = 0
```

בזמן המיגרציה:

```text
coverage = partial
→ ניתן לסגור רק באישור מפורש
→ אסור להציג כ-clean
```

יש להציג למשתמש משמעות ברורה:

```text
Canonical + Sync הסתיימו
Audit coverage: partial
הפעולה אינה מוכחת כ-clean
```

חוסר כיסוי Audit אינו הופך אוטומטית את ה־Canonical mutation לכשל.

---

## 20. Reconcile V2

Reconcile אינו משחזר Delete operation ישנה.

לכל Finding:

```text
Read Current Canonical
↓
Build Current Expected
↓
Read Current Actual
↓
Compare again
↓
Write mismatch only
↓
Audit again
```

Reconcile אינו משתמש ב־SearchIndex כמקור אמת ואינו עושה replay של
Approved State ישן.

---

## 21. Ownership matrix

| פעולה | Stats | Roster | Movement | League | Player Document |
| --- | --- | --- | --- | --- | --- |
| `CLEAR_STATS` | מנקה | שומר | שומר | Stats-owned projection בלבד | מנקה Stats-owned state בלבד; לא מוחק מסמך |
| `CLEAR_ROSTER` | חייב להיות `absent`; אינו משתנה | מנקה; Team Season נשמר | מעברי עונת הקבוצה ו־pending מתאפסים; אין Counterpart | Roster-owned projection בלבד | לא משנה |
| `DELETE_PLAYER_FROM_ROSTER` | חייב להיות `absent` לשחקן | מסיר שחקן | מסנכרן | Roster-owned projection בלבד | לא מוחק |
| `CLEAR_LEAGUE_TEAMS` | Team Seasons חייבים לא להתקיים | Team Seasons חייבים לא להתקיים | — | מנקה קבוצות; `tableRank = []` | — |
| `DELETE_LEAGUE_SEASON` | חייב להיות נקי | Team Seasons חייבים לא להתקיים | — | מוחק Season | — |

---

## 22. סדר תלות

סדר התלות העסקי הוא:

```text
Clear Stats
↓
Clear/Delete Roster
↓
מחיקת Team Seasons נפרדת (טרם הוגדרה)
↓
Clear League Teams
↓
Delete League Season
```

זהו סדר תנאי קדם בלבד.

Clear Roster לבדו אינו מתיר Clear League Teams: הוא משאיר את Team Season.

החצים אינם Cascade אוטומטי.

כל פעולה דורשת Preview ו־Approval משלה.

---

## 23. סדר מימוש

```text
D0  Delete contract + Ownership + Preconditions
D1  Stats Audit V2 עם תמיכה ב-absence
D2  Clear Stats V2
D3  Clear Roster V2 רק כאשר Stats absent
D4  Delete Player עם הפרדה בין Roster ל-Stats
D5  Clear League Teams רק כאשר אין Team Seasons
D6  Delete League Season
D7  Reconcile לפערי מחיקה
D8  מעבר UI והסרת Legacy
```

לפני כל Wave יש לבדוק מחדש את ה־Catalog והחוזה של ה־Domain הרלוונטי.

---

## 24. קריטריון סיום

פעולת Clear/Delete V2 נחשבת מבחינת הכתיבה ככזו שהשלימה את ה־Canonical
וה־Projection Sync כאשר השלבים המפורשים הסתיימו.

הוכחת תקינות מלאה מתקבלת רק כאשר:

```text
Audit coverage = complete
+
findingsCount = 0
```

ב־`partial` ניתן לסגור במפורש בתקופת המיגרציה, אך אסור להציג את המצב
כ־clean.

היעד הסופי הוא שכל Load, Clear, Delete ו־Reconcile של אותו Domain ישתמשו
באותם מקורות אמת ובאותם Expected State builders, ללא מסלול Legacy מקביל.
