# Players Database — חוזה כתיבה ובקרה

> **מסמך פעיל:** העקרונות הקנוניים של Write V2 ו־Audit V2.

## 1. הנחת המערכת

Players Database היא מערכת למשתמש יחיד שמבצע פעולה מרכזית אחת בכל רגע.

לכן ברירת המחדל היא פתרון פשוט ומפורש. אין צורך ב־queues, locks מבוזרים,
leases, background recovery או orchestration כללי שאינו נדרש על ידי תרחיש
פעיל.

## 2. השכבות הפעילות

```text
domain/
  חוקים עסקיים, builders ו־projections טהורים

services/read/
  קריאות ממוקדות מ־Firestore

services/writeV2/
  כתיבות עסקיות מפורשות

services/auditV2/
  בדיקה לקריאה בלבד מול Expected State
```

תחומי הכתיבה הקיימים:

```text
writeV2/
├── edits/
├── favorites/
├── league/
├── receipt/
├── roster/
└── stats/
```

תחומי הבקרה הקיימים:

```text
auditV2/
├── league/
├── roster/
└── stats/
```

אין כרגע שכבת `reconcileV2` כללית. תיקון נכתב רק עבור פער מוגדר ומוכח.

## 3. מקורות האמת

אין מסמך אמת יחיד לכל המערכת. מקור האמת נקבע לפי תחום הבעלות.

### League

מסמך League מחזיק את זהות הליגה, העונות, טבלת הליגה והמידע שבבעלות הליגה.

### Team Root ו־Team Season

מסמכי הקבוצה מחזיקים את זהות מסמך הקבוצה, אינדקס העונות, הסגל ומצב הקבוצה
בעונה.

### Player Document

מסמך השחקן מחזיק lifecycle, היסטוריה ומידע מתמשך של השחקן. הוא אינו נוצר רק
משום ששחקן מופיע בסגל.

### Firestore Catalog

`catalog/firestoreDocuments` מגדיר מבנה מסמכים, מזהים, שדות ותחומי בעלות.

### Projections

SearchIndexes, מסמכי Club ומסמכי Master הם projections. מותר לקרוא אותם כדי
לבדוק מה קיים, אך הם אינם מקור האמת לקביעה מה צריך להיות.

## 4. כיוון התלות

```text
Catalogs + Canonical Sources
↓
Domain Builders
↓
Expected State
↓
Firestore Projection
```

אין לגזור Expected State מתוך projection קיים.

## 5. גבול הכתיבה

החלטות עסקיות מסתיימות לפני הכתיבה:

```text
Input
↓
Parsing
↓
Identity Resolution
↓
Validation
↓
Preview
↓
User Approval
══════════════════
WRITE BOUNDARY
══════════════════
Persistence
```

שירות כתיבה מקבל פעולה מאושרת ומבצע persistence בלבד. הוא אינו מחליט מחדש
החלטות שכבר הוצגו למשתמש.

## 6. חוזה פעולת כתיבה

כל פעולה עסקית צריכה להיות קטנה וברורה:

- פעולה אחת מטפלת באחריות עסקית אחת.
- פעולה אטומית משתמשת ב־Transaction אחת כאשר נדרשת עקביות בין כמה מסמכים.
- כותבים רק שדות שבבעלות הפעולה.
- לא שולחים payload כללי עם שדות שלא השתנו.
- אין orchestrator כללי כאשר רצף מפורש מספיק.
- פעולות בלתי תלויות נשארות פונקציות נפרדות.
- ה־UI רשאי להפעיל כמה פעולות נפרדות לפי dirty state.

## 7. עריכות עצמאיות

עריכות קטנות נמצאות תחת:

```text
writeV2/edits/<entity>/<action>.js
```

הכללים:

- מבנה לפי ישות ואז פעולה עסקית.
- שירות עצמאי ללא תלות בכותבים אחרים.
- קריאות ממוקדות בלבד לזיהוי מסמכי היעד.
- Transaction אחת לכל פעולה עסקית.
- `serverTimestamp()` אחיד לכל המסמכים באותה פעולה.
- אין עדכון projection שאינו שייך לחוזה הפעולה.
- no-op אינו מבצע כתיבה.

## 8. טעינות League, Roster ו־Stats

הזרימה התפעולית היא:

```text
Steps
↓
Preview
↓
Approval
↓
Final Sync מפורש
↓
Audit V2
↓
Close
```

כל שלב מתחיל בעקבות פעולה מפורשת של המשתמש. אין retry אוטומטי, מעבר אוטומטי
לשלב הבא או תיקון מוסתר ברקע.

## 9. Write Receipt

Receipt הוא תיעוד קטן של פעולה. הוא אינו עותק של הנתונים העסקיים ואינו
מנגנון recovery.

הוא רשאי לשמור:

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

`auditTarget` הוא locator קטן בלבד. הוא אינו payload עסקי.

`canonicalStatus` מתאר את מה שה־Receipt הצליח לדווח ואינו הוכחה מוחלטת למצב
Firestore.

## 10. Audit V2

Audit V2 הוא read only. הוא:

- קורא מקורות אמת קנוניים.
- בונה Expected State באמצעות Domain builders.
- קורא Actual State ישירות מ־Firestore.
- משווה רק שדות ויחסים שבבעלות התחום.
- מחזיר findings וכיסוי מפורש.

Audit V2 אינו כותב, מתקן, מפעיל retry או מנהל recovery.

### תוצאת Audit

Coverage ופערים הם שני ממדים נפרדים:

```text
coverage: partial | complete
findingsCount: 0 | n
```

מותר להציג `clean` רק כאשר:

```text
coverage === complete
&&
findingsCount === 0
```

Audit חלקי אינו מוצג כנקי, אך findings שנמצאו בו נשארים אמיתיים ומוצגים.

## 11. Ownership

בדיקה וכתיבה מתבצעות רק בשדות שבבעלות הפעולה.

בפרט, Player Document עשוי להכיל היסטוריה, מעקב ידני, מועדפים ומידע מכמה
תחומים. אין לבנות אותו מחדש או לדרוס שדות שאינם בבעלות הפעולה.

Roster אינו יוצר Player Document רק משום ששחקן נמצא בסגל.

## 12. Masters

Leagues Master נגזר ממסמכי League הקנוניים הרלוונטיים.

Clubs Master נגזר מ־Expected Club projections שחושבו מהמקורות הקנוניים:

```text
Canonical Sources
↓
Expected Club Documents
↓
Expected Clubs Master
```

מסמך Master קיים אינו מקור אמת לתיקון מסמך שמתחתיו.

## 13. תיקון פערים

תיקון מתווסף רק לאחר שקיימת בדיקת Audit יציבה לפער מוגדר.

```text
Finding
↓
User approval
↓
Read canonical sources again
↓
Build expected state again
↓
Read actual state again
↓
Write the owned-field difference only
↓
Audit again
```

אין תיקון אוטומטי ואין שחזור של payload היסטורי.

## 14. חוויית משתמש ונתונים חיים

המגירה מחזיקה draft מקומי ואינה כותבת תוך כדי הקלדה.

בלחיצה על אישור:

```text
dirty rows בלבד
↓
כתיבות סדרתיות ומפורשות
↓
listener מעדכן את מקור הנתונים של העמוד
↓
סגירת המגירה לאחר הצלחה
```

אין לבצע reload מלא לאחר כתיבה כאשר listener פעיל מספק את המסמך המעודכן.

## 15. כללי פשטות

1. משתמש יחיד ופעולה אחת אינם מצדיקים תשתית concurrency מורכבת.
2. אין abstraction לפני שקיימת חזרתיות מוכחת.
3. אין payload כללי כאשר ניתן להעביר זהויות והשדה שהשתנה בלבד.
4. אין fallback שמערבב זהות עסקית עם מזהה מסמך Firestore.
5. SearchIndex מחבר בין זהות עסקית למזהה המסמך כאשר הדבר נדרש.
6. Audit אינו Writer.
7. תיקון תמיד מפורש ומופעל על ידי המשתמש.
8. אותו Expected State משמש לבדיקה ולתיקון.
9. Projection אינו מקור אמת.
10. הצלחת קריאת שירות אינה תחליף ל־Audit של המצב שנכתב.

## 16. תנאי תקינות

פעולה נחשבת תקינה כאשר:

```text
ה־Canonical נכתב
+
כל projection שבבעלות הפעולה נכתב
+
Audit V2 החזיר coverage מלא ללא findings
```

כאשר הכיסוי חלקי, יש להציג זאת במפורש ולא להצהיר שהמערכת נקייה.
