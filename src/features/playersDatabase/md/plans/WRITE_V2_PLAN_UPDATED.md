> **מסמך פעיל:** תוכנית העבודה הקנונית של Write V2 / Audit V2 / Reconcile V2.

# Players Database V2 — Greenfield Write, Audit & Reconciliation Plan

> **סטטוס: תהליך מיגרציה פעיל**
>
> מסמך זה הוא מקור האמת לתהליך החלפת שכבות הכתיבה, הבדיקה והתיקון הישנות של
> Players Database.
>
> המטרה אינה לבצע Refactor ל־Legacy אלא לבנות מסלול Greenfield פשוט, מפורש
> וניתן לבדיקה, להוכיח אותו על שלוש זרימות הטעינה, ולאחר מכן למחוק את
> המנגנונים הישנים.

---

## 1. מטרת התהליך

Players Database מיועד למשתמש יחיד שמבצע פעולה מרכזית אחת בכל רגע.

שלוש זרימות הטעינה המרכזיות הן:

- טעינת קבוצות / טבלת ליגה.
- טעינת סגל.
- טעינת סטטיסטיקות שחקנים.

הזרימה הקנונית היא:

```text
Steps
↓
Preview
↓
Approval
↓
Final Sync ידני
↓
Audit V2
↓
Repair מפורש אם נדרש
↓
Recheck
↓
Close
```

היעד הוא:

```text
מקורות אמת ברורים
+
כתיבה מפורשת
+
בדיקת סנכרון קנונית
+
תיקון פערים בלבד
```

ולא מערכת תפעולית מורכבת של:

```text
Jobs
Queues
Leases
Claims
Generations
Attempts
Superseded State
Background Recovery
Automatic Retry
Recovery Engine
```

---

## 2. עקרון ההכרעה

לכל רכיב חדש נשאל:

> אם היינו בונים היום את Players Database מאפס עבור משתמש יחיד שמבצע פעולה
> מרכזית אחת בכל רגע — האם הרכיב הזה באמת נדרש?

אם התשובה היא לא, הוא לא נכנס ל־V2 ללא צורך מוכח.

העדיפות היא:

> **קוד פשוט, מפורש וקל לבדיקה — גם אם התהליך הידני ארוך יותר.**

---

## 3. גבול הכתיבה

זרימות הקלט וההחלטות העסקיות נשארות לפני גבול הכתיבה.

```text
Paste / Input
↓
Parsing
↓
Identity Resolution
↓
Validation
↓
Business Decisions
↓
Preview
↓
Approval

══════════════════════════════
          WRITE BOUNDARY
══════════════════════════════

↓
Write V2
```

כל החלטה עסקית הנדרשת לאישור הטעינה צריכה להיסגר לפני הכתיבה הקנונית.

לאחר מכן שכבת הכתיבה מבצעת Persistence בלבד.

---

## 4. אסטרטגיית Greenfield

השכבות החדשות נבנות במקביל ל־Legacy:

```text
services/
├── write/              # Legacy — זמני
├── audit/              # Legacy — זמני
├── dataRepair/         # Legacy — זמני
│
├── writeV2/
├── auditV2/
└── reconcileV2/        # רק כאשר נדרש בפועל
```

המטרה הסופית:

```text
writeV2 + auditV2 + reconciliation החדש
↓
הוכחת עצמאות ותקינות
↓
מחיקת Legacy
↓
הסרת V2 מהשמות
```

`V2` הוא שם זמני לתקופת המיגרציה בלבד.

---

## 5. היררכיית מקורות האמת

אין מסמך אמת יחיד לכל Players Database.

מקור האמת נקבע לפי תחום הבעלות.

### 5.1 Architecture + Contracts

מסמכי הארכיטקטורה והחוזים מגדירים את כללי המערכת.

לפני שינוי Persistence, Audit או Reconciliation יש לבדוק אותם.

### 5.2 Firestore Catalog

```text
catalog/firestoreDocuments
```

הוא מקור האמת עבור:

- מבנה המסמכים.
- מזהי המסמכים.
- שדות.
- תחומי בעלות Persistence.
- יחסים בין המסמכים.

אין להסיק Schema או Ownership מתוך:

```text
Legacy Writers
Legacy Audit
DataRepair
מסמכים קיימים ב-Firestore
```

הקטלוג אינו Schema Validator כללי.

הוא מגדיר מה מותר לכל Flow לבנות, להשוות ולכתוב.

### 5.3 Identity Catalogs

קטלוגים קבועים כגון:

- Clubs.
- Age Groups.
- Team Display.
- League / Team identity definitions.

הם מקור האמת לזהויות ולמידע קבוע.

### 5.4 Business Canonical Sources

מקור האמת העסקי נקבע לפי תחום הבעלות:

```text
League Document
→ טבלת ליגה
→ Team Performance
→ League identity
→ League-owned metadata

Team Root + Team Season
→ Roster
→ Movement
→ Team Balance
→ Team-owned state

Team Season + League
→ Stats
→ Scouting
→ Stats-owned metadata

Player Document
→ Player lifecycle
→ היסטוריה
→ מעקב ידני
→ מידע קנוני בבעלות Player
```

---

## 6. Projections אינם מקורות אמת

המסמכים הבאים הם Projections:

```text
SearchIndexes
Club projections
Clubs Master
Leagues Master
Derived metadata
```

מותר לקרוא אותם כדי לדעת:

```text
מה קיים בפועל?
```

אסור להשתמש בהם כדי לקבוע:

```text
מה צריך להיות?
```

כיוון התלות תמיד:

```text
Architecture + Catalogs
↓
Canonical Sources
↓
Domain Builders
↓
Expected State
↓
Projection
```

ולא להפך.

---

## 7. Dependency Contract

### 7.1 תלות מותרת

`writeV2`, `auditV2` ו־`reconcileV2` רשאים להשתמש ב:

```text
playersDatabase/domain
playersDatabase/catalog
stable shared business/domain modules
stable constants / definitions / identity catalogs
Firebase primitives / stable Firebase infrastructure
```

### 7.2 תלות אסורה

השכבות החדשות אינן רשאיות להסתמך על:

```text
services/write/**
services/audit/**
services/dataRepair/**

legacy flows
legacy writers
legacy jobs
projection-job infrastructure
legacy recovery infrastructure
legacy retry orchestration
legacy leases / attempts / claims
```

ה־Legacy הוא מקור ללימוד התרחישים והחוקים הקיימים בזמן המיגרציה בלבד.

הוא אינו Dependency של המימוש החדש.

המבחן:

> אם שכבות ה־Legacy יימחקו, V2 צריכה להמשיך לעבוד.

---

## 8. לוגיקה שימושית שנמצאת ב־Legacy

אם V2 זקוקה ללוגיקה שנמצאת כיום ב־Legacy, לא מייבאים אותה אוטומטית.

יש לסווג אותה.

### Business / Domain Logic

אם זו לוגיקה עסקית קנונית, היא עוברת לשכבת Domain יציבה ומשותפת:

```text
domain/
```

### Persistence Logic

אם זו לוגיקת Firestore, המימוש החדש מקבל Writer עצמאי.

### Mixed Logic

אם קובץ Legacy מערבב Business Logic ו־Persistence:

```text
Business calculation → domain/
Persistence          → implementation חדש
```

אין להעביר את המבנה הישן רק משום שהוא כבר קיים.

---

## 9. Write V2

`writeV2` אחראי לכתיבה העסקית של פעולת הטעינה.

הוא אינו אחראי ל־Recovery היסטורי.

הזרימה:

```text
Approved operation
↓
Manual Final Sync
↓
Canonical write
↓
Explicit projection sync steps
↓
Audit V2
```

### 9.1 פעולות מפורשות

כל פעולה צריכה לבצע אחריות מוגדרת אחת.

אין Cross-Flow orchestration אוטומטי ללא צורך מוכח.

### 9.2 Idempotency

פעולת סנכרון צריכה להיות בטוחה להרצה חוזרת ככל האפשר.

הרצה חוזרת אינה מנגנון Recovery בפני עצמו, אלא תכונה שמקטינה סיכון ומפשטת
תיקונים.

### 9.3 Canonical write

ה־Canonical הוא הגבול החשוב של הפעולה.

אם הכתיבה הקנונית נכשלה:

```text
Canonical write failed
↓
אין מקור אמת חדש
↓
עוצרים
↓
הטעינה אינה ממשיכה
```

אין ניסיון לשחזר Projections של פעולה שה־Canonical שלה לא נכתב.

במקרה כזה ניתן להתחיל את ה־Import מחדש.

אם ה־Canonical נכתב במלואו:

```text
Canonical completed
↓
מקורות האמת הנוכחיים הופכים לבסיס לכל Audit ותיקון עתידי
```

אין צורך לשמור את כל Approved Payload לצורך שחזור Projections.

---

## 10. UX Contract — Final Sync

שלוש זרימות הטעינה משתמשות באותו Pattern:

```text
Steps
↓
Preview
↓
Approval
↓
Final Sync
↓
Audit
↓
Close
```

ב־Final Sync קיימים תתי־שלבים מפורשים.

כל תת־שלב מתחיל רק לאחר פעולה מפורשת של המשתמש.

אסור לבצע כברירת מחדל:

- מעבר אוטומטי לשלב הבא.
- תיקון אוטומטי ברקע.
- Retry אוטומטי.
- Recovery אוטומטי.
- orchestration מוסתר.

ה־Modal הוא UX orchestrator בלבד.

---

## 11. WriteAction V2

WriteAction החדש הוא **Receipt קטן של פעולת הטעינה**.

הוא אינו Recovery Contract ואינו שומר עותק מלא של הנתונים העסקיים.

רשומת הפעולה נוצרת לפני ניסיון הכתיבה העסקית הראשונה ומחוברת כבר בשלב
הראשון לכל שלוש הזרימות:

```text
League
Roster
Stats
```

המטרה:

- מזהה קבוע לפעולה.
- Label ברור.
- לדעת האם ה־Canonical נכתב.
- לשמור את תוצאת Audit V2 האחרונה.
- לדעת אם הפעולה עדיין פתוחה או נסגרה.

מבנה רעיוני מינימלי:

```text
id
flowType
label

auditTarget

canonicalStatus

lastAuditAt
lastAuditSummary

status
createdAt
updatedAt
```

אין לקבע שדות נוספים לפני צורך מוכח.

### 11.1 WriteAction אינו הוכחת תקינות

תוצאת לחיצה או כתיבה במודאל אינה הוכחה שה־Projection תקין.

לדוגמה:

```text
Players sync → reported success
```

אינו שווה ל:

```text
Players projection → verified correct
```

ההוכחה לתקינות מגיעה מ־Audit V2.

### 11.2 פעולה פתוחה

המודל העסקי הוא פעולה מרכזית אחת בכל רגע.

לפני התחלת פעולת Import חדשה יש לבדוק אם קיימת פעולת Import פתוחה.

פעולה פתוחה צריכה להיסגר או לעבור בדיקה/תיקון לפני פתיחת פעולה חדשה.

אין צורך ב־lease, lock מבוזר או מנגנון concurrency מורכב לצורך כלל זה.

---

## 12. Audit V2 — Greenfield

`auditV2` נבנה מחדש ואינו Refactor של `services/audit`.

מטרתו היחידה:

> לבדוק האם המצב הנוכחי של המערכת מסונכרן עם מקורות האמת הקנוניים בתחום
> הכיסוי שכבר מומש.

המודל:

```text
Architecture + Firestore Catalog + Identity Catalogs
↓
Canonical Sources
↓
Domain Builders
↓
Expected State
↓
Firestore Actual State
↓
Compare owned fields / relations
↓
Audit Result
```

`auditV2` אינו מנסה להבין מה קרה במהלך הכתיבה.

הוא שואל:

> מה צריך להיות עכשיו, ומה קיים עכשיו?

Audit V2 מופעל גם לאחר כתיבה רגילה שהסתיימה בהצלחה. הוא אינו מנגנון שמופעל
רק לאחר תקלה.

---

## 13. Audit Result + Coverage

Audit V2 חייב להיות אמין גם בזמן שהוא עדיין נבנה בהדרגה.

לכן תוצאת הבדיקה אינה בינארית בלבד.

שלושת המצבים:

```text
clean
findings
partial
```

### clean

מותר להחזיר `clean` רק כאשר כל היעדים שהוגדרו כחובה עבור אותו Flow כבר
מכוסים ונבדקו, ולא נמצאו פערים.

### findings

הבדיקה כיסתה את התחומים הרלוונטיים ומצאה פערים בפועל.

### partial

הבדיקה הצליחה בתחומים שכבר מומשו, אבל עדיין קיימים יעדים של אותו Flow
שאינם מכוסים על ידי Audit V2.

לדוגמה:

```text
נבדקו:
✓ Team SearchIndex
✓ Movement

טרם מכוסים:
○ Clubs
○ Clubs Master

Result: partial
```

אסור להציג `clean` כאשר הכיסוי חלקי.

ה־Coverage הוא חלק מפורש מחוזה Audit V2 ולא מידע משתמע.

כך ניתן לחבר Audit V2 ל־League, Roster ו־Stats כבר בתחילת המיגרציה, ולהרחיב
אותו בהדרגה יחד עם הכתיבות.

---

## 14. גבולות Audit V2

`auditV2` הוא Read Only.

הוא רשאי:

- לקרוא מקורות אמת.
- לקרוא Catalogs.
- להשתמש ב־Domain builders.
- לקרוא Projections קיימים כ־Actual State.
- לחשב Expected State.
- להשוות שדות ויחסים בבעלות ה־Flow.
- להחזיר Findings.
- להחזיר Coverage מפורש.
- לתאר את סוג הפער שנמצא.

הוא אינו רשאי:

- לבצע תיקון.
- להפעיל Legacy Repair.
- להפעיל Legacy Writers.
- לבצע Recovery.
- לנהל Jobs.
- לנהל Active Findings מתמשכים.
- לנהל retries.
- להפוך Projection למקור אמת.

### 14.1 Canonical אינו נבדק מול עצמו

Team Root, Team Season, League ו־Player לפי תחום הבעלות הם מקורות אמת.

Audit V2 אינו מנסה להוכיח שההחלטה העסקית שאושרה בהם הייתה נכונה באמצעות
השוואת המסמך לעצמו.

התקינות העסקית של הקלט נסגרת ב:

```text
Validation
↓
Preview
↓
Approval
```

לאחר הכתיבה, Audit V2 בודק:

- יחסים בין מקורות אמת.
- lifecycle רלוונטי.
- Projections שנגזרים ממקורות האמת.
- שדות ויחסים שבבעלות ה־Flow.

---

## 15. Expected State הוא הליבה המשותפת

אסור ליצור שתי גרסאות של הלוגיקה:

```text
Audit logic
Repair logic
```

אותו חישוב קנוני של Expected State צריך לשמש את שני הצדדים.

```text
Canonical + Catalog + Domain
↓
Expected State
     │
     ├── Audit compares it
     │
     └── Reconciliation writes its owned fields
```

כך אין פיצול לוגיקה בין בדיקה לתיקון.

---

## 16. Ownership

ההשוואה והתיקון מתבצעים רק בשדות וביחסים שבבעלות ה־Flow הרלוונטי.

אין לבצע השוואה עיוורת של מסמך מלא.

דוגמה:

```text
Player Document
├── Roster-owned fields       → Roster רשאי לבדוק ולתקן
├── Stats-owned fields        → Stats רשאי לבדוק ולתקן
├── manual tracking           → לא לגעת דרך Roster/Stats
├── favorites / watch state   → לא לגעת
└── history                   → לא לדרוס
```

---

## 17. Player Document הוא מקרה מיוחד

Player Document אינו Projection רגיל.

הוא יכול להכיל:

- היסטוריה.
- מעקב ידני.
- Favorite / Watchlist.
- פרופילים.
- מידע בבעלות מספר Flows.

לכן Audit V2 צריך קודם לחשב:

```text
האם Player Document אמור להתקיים לפי lifecycle הקנוני?
```

אם לא נדרש מסמך:

```text
אין מסמך
↓
יכול להיות מצב תקין
```

אם נדרש מסמך:

```text
קרא Player Document
↓
בדוק רק את השדות בבעלות ה-Flow
```

Reconciliation לעולם אינו בונה מחדש Player Document באופן עיוור ואינו מוחק
מידע שאינו בבעלות ה־Flow.

---

## 18. Projection Reconciliation

לאחר שה־Canonical נכתב, אין צורך לשחזר את הפעולה הישנה.

במקום:

```text
איזה Step נכשל?
מה כבר נכתב?
מאיפה ממשיכים?
```

המערכת שואלת:

```text
מה אומר מקור האמת עכשיו?
↓
מה אמור להיות בכל Projection?
↓
מה קיים בפועל?
↓
מה הפער?
```

ואז מתקנת רק את הפער.

זהו מנגנון ההתאוששות המרכזי של V2.

---

## 19. Audit של פעולה

Audit של WriteAction אינו מסתפק ב־`auditScope` כללי.

הבדיקה צריכה לכסות את כל תחומי ה־Projection שנגזרים ממקורות האמת הרלוונטיים
לפעולה.

לדוגמה, Roster עשוי לדרוש בדיקה של:

```text
Team Root / Team Season canonical state
Movement counterpart
Player Document lifecycle + owned fields
Player SearchIndexes
Team SearchIndex
League roster metadata
Leagues Master
Club projections
Clubs Master
```

ה־Audit אינו מניח ששלב שסומן כהצלחה אכן מסונכרן.

הוא בודק אותו מחדש מול מקורות האמת.

---

## 20. אסטרטגיית בנייה של Audit V2

Audit V2 אינו נבנה כמערכת מלאה לפני המשך Write V2.

המטרה בשלב הראשון היא להוכיח את **הבסיס הארכיטקטוני**, לא כיסוי מלא
מקצה לקצה.

האסטרטגיה:

```text
Build minimal Audit V2 foundation
↓
Connect to existing V2 writes
↓
Run after normal successful writes
↓
Return clean / findings / partial
↓
Continue Greenfield write work
↓
Expand Audit V2 alongside each Flow
↓
Add explicit repairs only after checks are stable
```

Audit V2 גדל יחד עם Greenfield Write V2.

אין לעצור את מיגרציית הכתיבות עד שכל Audit V2 מושלם.

---

## 21. Wave 1 — WriteAction + Audit V2 Foundation

המטרה: ליצור בסיס קטן שעובד עבור שלוש הזרימות.

### WriteAction

לחבר Receipt קטן ל:

```text
League
Roster
Stats
```

ה־Receipt שומר לכל הפחות:

```text
id
flowType
label
canonicalWritten
lastAuditAt
lastAuditResult
closed
```

### Audit V2

ליצור API מפורש:

```text
auditLeague(...)
auditRoster(...)
auditStats(...)
```

בשלב זה כל אחד יכול לכסות רק חלק מהיעדים.

החוזה כבר מהיום הראשון:

```text
clean | findings | partial
```

המטרה של Wave 1 אינה להוכיח שכל Projection בכל Flow כבר נבדק.

המטרה היא להוכיח:

```text
WriteAction נוצר
↓
Canonical נכתב
↓
Audit V2 יכול לרוץ
↓
תוצאת Audit נשמרת ב-WriteAction
↓
Coverage חסר מוצג כ-partial
```

---

## 22. Wave 2 — Audit V2 Read Only תוך כדי Greenfield Writes

ממשיכים את תהליך Greenfield של League, Roster ו־Stats.

בכל פעם שמטפלים בכתיבה או Projection:

```text
Canonical source
↓
Expected State
↓
Actual State
↓
Audit V2 comparison
```

מוסיפים ל־Audit V2 את הכיסוי המתאים לאותה כתיבה.

במהלך המעבר מותר להשוות תוצאות מול Legacy Audit לצורך גילוי תרחישים חסרים.

אסור ליצור Dependency מ־Audit V2 ל־Legacy Audit.

### סדר הכיסוי נקבע לפי העבודה בפועל

אין חובה להשלים תחילה את כל Roster ורק לאחר מכן לעבור ל־League או Stats.

הכיסוי מתווסף לפי:

- הסיכון.
- הכתיבות שכבר עברו ל־V2.
- התקלות שמתגלות.
- הצורך בפועל בזמן המיגרציה.

---

## 23. Roster Audit V2 — גבולות נכונים

Roster הוא תחום חשוב לבדיקת הארכיטקטורה, אך אינו חייב להפוך לפרויקט Audit
מלא לפני המשך העבודה.

מקורות האמת המרכזיים:

```text
Team Root
Team Season
League כאשר נדרש להקרנה
Identity Catalogs
Firestore Catalog
```

Audit Roster בודק את היחסים וה־Projections שנגזרים מהם.

דוגמאות ליעדים:

```text
Movement counterpart
Player SearchIndexes
Team SearchIndex
League roster metadata
Leagues Master
Club projections
Clubs Master
```

### Player Document

Player Document אינו יעד רגיל של Roster V2.

Roster אינו יוצר Player Document רק משום ששחקן נמצא בסגל.

בדיקות ותיקונים של Stats / Scouting ownership ב־Player Document שייכים
בעיקר ל־Stats Audit V2.

אם בעתיד יימצא שדה Player Document שנמצא במפורש בבעלות Roster, הוא יתווסף
רק לפי חוזה Catalog/Architecture מפורש.

---

## 24. Masters — סדר גזירה

Masters אינם Projection מקומי פשוט של פעולת Import אחת.

### Leagues Master

נגזר ממסמכי League הקנוניים הרלוונטיים.

לכן Expected State שלו צריך להיבנות ממקורות League הקנוניים הנדרשים, ולא
רק מהקבוצה או מהשורה שנמצאת כרגע בבדיקה.

### Clubs Master

הוא Projection מדרגה שנייה.

השרשרת:

```text
Canonical sources
↓
Club Documents
↓
Clubs Master
```

לכן בדיקה או תיקון של Clubs Master מתבצעים רק לאחר שניתן לחשב באופן קנוני
את Club Documents הרלוונטיים.

Master לעולם אינו משמש מקור אמת לתיקון Projection שמתחתיו.

---

## 25. Wave 3 — הרחבת Checks וכיסוי

כאשר בסיס Audit V2 עובד, מוסיפים בדיקות בהדרגה.

לכל יעד חדש יש למפות:

```text
1. מה מקור האמת?
2. מה אומר Firestore Catalog?
3. אילו Identity Catalogs נדרשים?
4. מה כלל הקיום של היעד?
5. איזה Domain Builder קנוני קיים?
6. אילו שדות / יחסים בבעלות ה-Flow?
7. מהו Expected State?
8. איך קוראים את Actual State?
9. מה נחשב פער?
```

אין צורך לבנות מראש:

```text
checks/
shared/
engine/
strategies/
generic framework
```

מחלצים Shared Code רק כאשר קיימת חזרתיות מוכחת בין League, Roster ו־Stats.

---

## 26. Wave 4 — Reconcile V2

רק לאחר שבדיקה מסוימת ב־Audit V2 יציבה, ניתן להוסיף עבורה תיקון מפורש.

הזרימה:

```text
Finding
↓
User selects repair
↓
Read canonical sources again
↓
Build expected state again
↓
Read actual state again
↓
Compare again
↓
אם הפער עדיין קיים
↓
Write only the required owned-field difference
↓
Audit again
```

אין תיקון אוטומטי ברקע.

אין Replay של Step היסטורי.

אין שימוש ב־Approved State ישן לצורך Projection repair.

מתחילים מתיקונים קטנים ומוכחים, אחד בכל פעם.

---

## 27. Wave 5 — Full Coverage + Legacy Removal

רק לאחר ששלוש הזרימות עברו את תהליך Greenfield:

```text
League
Roster
Stats
```

מבצעים מיפוי כיסוי מלא.

בשלב הזה בלבד דורשים שכל פעולה תקינה תוכל להגיע ל:

```text
Audit Result: clean
Coverage: complete
```

יש לוודא:

```text
✓ כל Projection נדרש מכוסה
✓ כל Relation נדרש מכוסה
✓ Ownership נשמר
✓ Player manual/history fields נשמרים
✓ Masters מחושבים ממקורותיהם הנכונים
✓ Repair כותב רק פערים
✓ Recheck חוזר נקי
```

לאחר מכן:

```text
Dependency Audit
↓
השוואה סופית מול Legacy
↓
סגירת פערים
↓
מחיקת services/audit
↓
מחיקת services/dataRepair
↓
מחיקת services/write לאחר שכל צרכניו הוחלפו
↓
הסרת V2 מהשמות
```

אין למחוק Legacy לפני שכל צרכן שלו הוסר או הוחלף.

---

## 28. מה לא נבנה כרגע

הדברים הבאים מחוץ ל־Scope ללא צורך חדש ומוכח:

- Jobs.
- Background processing.
- Automatic repair.
- Automatic retry.
- Recovery engine.
- Resume של Final Sync ישן.
- שמירת Approved State לצורך שחזור Projections.
- Leases.
- Claims.
- Generations.
- Attempt tokens.
- Superseded state.
- Active Findings infrastructure.
- Repair history engine.
- Generic reconciliation framework.
- Framework משותף ל־League/Roster/Stats לפני שיש חזרתיות מוכחת.

---

## 29. כללי פשטות

### כלל 1

אם ניתן לחשב מצב נכון ממקורות האמת הנוכחיים — אין לשמור snapshot נוסף לצורך
Recovery.

### כלל 2

אם Projection אינו תואם למקור האמת — מתקנים את הפער הנוכחי, לא משחזרים את
הפעולה ההיסטורית.

### כלל 3

Audit אינו Writer.

### כלל 4

Repair תמיד מפורש ומופעל על ידי המשתמש.

### כלל 5

אותו Expected State משמש לבדיקה ולתיקון.

### כלל 6

מתקנים רק שדות ויחסים שבבעלות ה־Flow.

### כלל 7

Projection לעולם אינו מקור אמת לתיקון Projection אחר.

### כלל 8

אין להוסיף abstraction לפני שקיים צורך מוכח בקוד.

---

## 30. יעד התהליך

היעד:

```text
Business Logic              ✓ נשמרת
Canonical ownership         ✓ ברור
All required projections    ✓ נשמרות
Firestore integrity         ✓ נבדקת
Repairability               ✓ מבוססת מקור אמת
Repeatability               ✓ נשמרת

Code complexity             ↓
Hidden orchestration        ↓
Recovery complexity         ↓
Legacy coupling             → 0
Debugging difficulty        ↓
```

המערכת צריכה להיות מסוגלת לענות בכל רגע על שאלה פשוטה:

> לפי מקורות האמת הקנוניים, האם כל המסמכים וההקרנות שבבעלות התחום מסונכרנים
> כרגע?

אם לא:

> מהם הפערים, ומהו התיקון המינימלי שניתן לבצע באופן מפורש?

---

## 31. הצעד הבא המאושר

השלב הבא אינו בניית Audit V2 מלא מקצה לקצה.

יש להתחיל ב־Wave 1:

```text
Minimal WriteAction V2
+
Audit V2 foundation
+
clean / findings / partial contract
+
חיבור בסיסי ל-League / Roster / Stats
```

המטרה היא להוכיח שהבסיס עובד:

```text
פעולה נפתחת
↓
Canonical נכתב
↓
Audit V2 מופעל גם לאחר הצלחה רגילה
↓
תוצאת הבדיקה נשמרת
↓
כיסוי חסר מדווח כ-partial
```

לאחר מכן ממשיכים את תהליך Greenfield של הכתיבות.

Audit V2 יורחב ויתוקן תוך כדי העבודה על כל Flow, בהתאם ל־Projections
ולתרחישים שמתגלים בפועל.

אין לדרוש בשלב זה הוכחת Audit מלאה End-to-End לכל המערכת.

היעד הסופי נשאר:

```text
Write V2
+
Audit V2 complete coverage
+
Explicit Reconciliation
↓
Legacy Removal
```

---

## 32. הבהרות מחייבות ל-Receipt ולתוצאת Audit

auditTarget הוא locator קטן בלבד, ולא payload עסקי. הוא מכיל את הזהויות
הקנוניות הדרושות להפעלת Audit לאחר Refresh, למשל leagueId, seasonKey
ו-birthTeamDocumentId כאשר רלוונטי.

canonicalStatus מתאר את מה שה-Receipt הצליח לדווח, ולא הוכחה מוחלטת למה
שהתרחש ב-Firestore:

~~~
pending
reported
failed_or_unknown
~~~

כך, אם הכתיבה הקנונית הצליחה אך עדכון ה-Receipt נכשל, המערכת אינה מסיקה
בטעות שה-Canonical לא נכתב.

lastAuditSummary נשאר קטן ואינו שומר Findings מלאים, Expected State או
Actual State:

~~~
ranAt
coverage
findingsCount
checkedDomains
~~~

ה-Findings המלאים מחושבים מחדש על ידי Audit V2 בזמן הבדיקה.

status מייצג את חיי ה-Receipt:

~~~
open
closed
abandoned
~~~

### Coverage ותוצאת Audit

Coverage ופערים הם שני ממדים נפרדים:

~~~
coverage: partial | complete
findingsCount: 0 | n
~~~

clean הוא תצוגת UX מותרת רק כאשר הכיסוי complete ו-findingsCount הוא אפס.
Audit עם כיסוי חלקי עדיין יכול לכלול Findings אמיתיים; אין להסתיר אותם או
להציג את הפעולה כנקייה.

בשלבי המעבר, המשתמש רשאי לסגור פעולה לאחר אישור מפורש של תוצאת partial.
הפעולה נסגרת עם סיכום Audit חלקי, ולא כפעולה נקייה. פעולה שנכשלה לפני
Canonical יכולה להינטש במפורש.

### גבולות בעלות

Roster אינו יוצר Player Document רק משום ששחקן נמצא בסגל. בדיקות ותיקונים
של Player Document עבור Stats או Scouting שייכים בעיקר ל-Stats Audit V2,
אלא אם חוזה Architecture/Catalog מפורש יגדיר בעתיד שדה בבעלות Roster.

Expected Clubs Master נבנה מ-Expected Club projections שחושבו מהמקורות
הקנוניים, ולא מ-Club Documents קיימים שעלולים להיות שגויים. סדר הכתיבה יכול
להישאר Clubs ואז Clubs Master, אך Projection קיים אינו מקור אמת לתיקון
Projection אחר.

auditV2 נשאר Read Only. שמירת lastAuditSummary ב-WriteAction נעשית על ידי
שכבת UI orchestration או שירות Receipt נפרד לאחר ש-Audit V2 החזיר תוצאה.
