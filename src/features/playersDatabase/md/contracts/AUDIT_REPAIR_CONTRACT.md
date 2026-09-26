# Audit and Repair Contract

## שאלות Audit

Audit הוא בדיקת תקינות לקריאה בלבד. הוא עונה רק על:

1. האם חסר מסמך שה־lifecycle מחייב?
2. האם projection שונה ממקורו הקנוני?
3. האם relation מפורש שבור?
4. האם קיים מסמך שה־lifecycle אינו מאפשר?
5. איזה lifecycle חוקי מסביר את המצב?

Audit אינו validator של Catalog: הוא לא מדווח על שדות חסרים, שדות לא מוכרים,
legacy fields או mismatched types.

## מקורות השוואה

- Team Season ו־Team SearchIndex Performance ← League table.
- Team SearchIndex Balance ← Team Season Balance.
- League Master ← League Documents.
- Identity Index אינו מקור Audit.
- SearchIndex משמש לכל היותר להקשר בתצוגת Repair.

יש להשתמש ב־canonical builder קיים; אין לשכפל נוסחאות בתוך Audit.

## Repair

Repair מחייב אישור משתמש, קריאה טרייה ו־canonical writer. Repair של Player
Document יכול ליצור מסמך חסר ולרענן את Team Season וה־SearchIndexes הרלוונטיים.
Retry של Movement counterpart לעולם אינו יוצר Team Root או Team Season חסרים.

## Lifecycle בסיסי

| מצב | מסמכים נדרשים |
|---|---|
| League loaded | League Document ו־Team SearchIndex |
| Roster loaded | Team Root, Team Season ו־Player SearchIndexes |
| Stats loaded | Team Season ו־SearchIndexes מעודכנים |
| Player עם Scout/Favorite/Watchlist/Manual tracking | Player Document |

Team Root ללא עונה ו־Player Document ללא profile פעיל יכולים להיות מצבים
חוקיים, ולכן אינם `unexpected_document` כשלעצמם.
