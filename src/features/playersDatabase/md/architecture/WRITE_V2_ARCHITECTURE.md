# Players Database — Write V2 Architecture

## מעמד

זהו חוזה העקרונות היציבים של Write V2. מצב המימוש והחלטות שעדיין פתוחות
מנוהלים ב־`../plans/WRITE_V2_PLAN_UPDATED.md`.

## גבול ותלות

`services/writeV2` היא שכבת Greenfield עצמאית, ולא Wrapper או Refactor של
`services/write`. היא רשאית להשתמש ב־`domain`,‏ `catalog`, מודולים יציבים,
קבועים ותשתיות Firebase.

אסור לה להסתמך, ישירות או בעקיפין, על Legacy writers,‏ jobs,‏ audit,
dataRepair,‏ retry/recovery orchestration או lease infrastructure.

המבחן: אם Legacy נמחק, Write V2 עדיין עובדת.

## מבנה פעולה

כל פעולה שואפת למבנה הבא:

```text
INPUT → VALIDATE → BUILD → WRITE → VERIFY RESULT → RETURN
```

ה־payload המאומת הקיים הוא נקודת הכניסה. אין ליצור abstraction חדש סביבו
בלי צורך עסקי מוכח.

## עקרונות ביצוע

- מודל השימוש הוא משתמש יחיד שמבצע פעולה מרכזית אחת בכל רגע. אין תרחיש
  נתמך של שתי פעולות כתיבה מקבילות.
- כל שלב הוא פעולה מפורשת עם אחריות אחת.
- אין Cross-Flow orchestration אוטומטי בשלב הראשון.
- כל פעולה צריכה להיות בטוחה להרצה חוזרת.
- אין auto-next, background processing, automatic retry או hidden recovery.
- נתוני עבודה של ה־Session יכולים להישאר ב־client state; מקור האמת נשאר
  Firestore.
- אין להוסיף Jobs או distributed orchestration לפני שנמדד צורך אמיתי.

Approved State הוא חוזה הפעולה לאחר Approval. הוא מכיל את כל ההחלטות
העסקיות וה־patches הנדרשים ל־Final Sync. לאחר Approval אין לבצע חישוב עסקי
מחדש או לקבל החלטה עסקית חדשה.

ב־V2 אין stale או concurrency guards,‏ revisions,‏ fingerprints,‏ operation
markers,‏ optimistic concurrency,‏ leases,‏ claims או superseded state. מותר
לקרוא מסמך קנוני בזמן כתיבה כאשר הקריאה נדרשת כדי לוודא קיום או להחיל patch
בבעלות ה־Flow בלי לדרוס שדות אחרים; קריאה זו אינה משווה את המסמך ל־Preview.

## UX

ה־Modal הוא orchestrator של ממשק בלבד. המשתמש מתקדם בין sub-steps באופן
מפורש, וכל sub-step מפעיל פעולה עצמאית. הצלחה מאפשרת מעבר; כשל מאפשר ניסיון
נוסף רק אם חוזה ה־Flow מגדיר זאת במפורש.

Retry,‏ Resume ו־Recovery אינם התנהגות משתמעת של Write V2. כל Flow חייב
להגדיר אותם בנפרד לפני מימושם. כאשר הם אינם מוגדרים, כשל עוצר את ה־Final
Sync ומוצג למשתמש בלבד.

## עצמאות לפני הסרת Legacy

יש להוכיח אפס תלות ב־`services/write`,‏ `services/audit` ו־
`services/dataRepair`, וכן להעביר בהצלחה Build, lint, tests וכל פעולות League,
Roster ו־Stats הרלוונטיות ל־Wave.

## פעולות עריכה עצמאיות

פעולות `services/writeV2/edits` מופעלות בשמירה מפורשת מהממשק בלבד.
אין להפעילן מתוך טעינות, מחיקות, Audit, Repair, סנכרון או פעולה אחרת.
ארבע פעולות URL ופעולת חוקי תחרות נפרדת. קישור וחוקים מופיעים במגירה אחת,
אך נשמרים באמצעות שני כפתורים עצמאיים עם dirty, saving ושגיאה נפרדים.
מותר לשתף עזרי איתור ממוקדים ופונקציות טהורות. זרימות אחרות כותבות בעצמן.
כל פעולה אחראית למקור ולהקרנותיה המחויבות ב־Transaction אחת.

בפעולות אלה Commit מוצלח הוא גבול ההצלחה: אין VERIFY נוסף לאחריו.
מוחזר `{ completed: true, changedCount }`; כשל כתיבה מוצג ומלווה ברענון
מהשרת ובפינוי מטמון, ללא ניסיון חוזר אוטומטי. כשל רענון אחרי הצלחה אינו
כשל שמירה. אין Receipt, Jobs, תקרת מסמכים משותפת או אומדן נפח מקומי.
בדיקות עומק רוחביות שייכות ל־Audit יזום, ולא לכל שמירת URL.
החוזה המפורט: `../contracts/STANDALONE_EDITS_CONTRACT.md`.
