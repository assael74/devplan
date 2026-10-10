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

## כיסוי System Audit

System Audit קורא את כל הקולקשיינים הפעילים של PlayersDatabase למעט
`dbWriteActions`, שמטופל במסלול תחזוקת הקבלות. הכיסוי כולל את המסמכים
הקנוניים ואת `dbLeaguesCenter`,‏ `dbClubsCenter` ו־`dbClubsDirectory` ומשווה
את ה־projections למקורות הקנוניים שלהם. `coverage.complete` מותר רק כאשר כל
היעדים האלה נכללו בריצה.

המשתמש בוחר סוג בדיקה ולא קולקשיינים. כל סוג בדיקה מגדיר את יעדי הקריאה
הנדרשים לו, ותוכנית הריצה מאחדת את היעדים וקוראת כל קולקשיין פעם אחת. בחירה
חלקית מחזירה רק ממצאים השייכים לבדיקות שנבחרו ומסמנת את הכיסוי כחלקי ביחס
לכלל יעדי ה־System Audit. בדיקה ללא מימוש מלא אינה חלק מתוכנית הריצה.

## מקורות השוואה

- Team Season ו־Team SearchIndex Performance ← League table.
- Team SearchIndex Balance ← Team Season Balance.
- League Master ← League Documents.
- Identity Index אינו מקור Audit.
- SearchIndex משמש לכל היותר להקשר בתצוגת Repair.

יש להשתמש ב־canonical builder קיים; אין לשכפל נוסחאות בתוך Audit.
אם אותו `teamId` מופיע ביותר ממסמך League אחד באותה עונה, Audit מדווח על
בעלות קנונית כפולה ואינו מציג עבור אותה קבוצה mismatch עמום של ClubsCenter.

## Repair

Repair מחייב אישור משתמש, קריאה טרייה ו־canonical writer. Repair של Player
Document יכול ליצור מסמך חסר ולרענן את Team Season וה־SearchIndexes הרלוונטיים.
Retry של Movement counterpart לעולם אינו יוצר Team Root או Team Season חסרים.

## Cleanup

מחיקת ניקיון אינה נגזרת מספירת קולקשיינים. היא מותרת רק לאחר Audit טרי,
אישור משתמש ורשימת ממצאים מפורשת. מחיקה ישירה מותרת עבור `Player SearchIndex`
שסווג `orphan_projection`; זהו תוצר הניתן לבנייה מחדש. קשר קבוצה בתוך
`Player Season` ניתן לניקוי רק כאשר Audit טרי מצא שה־Team Season הקנוני אינו
קיים או שהשחקן אינו קיים עוד בנתוני אותו Team Season, וקריאה טרייה מאשרת זאת
שוב. הניקוי מסיר רק את `teamsById[teamId]`; מסמך ה־Player Season כולו נמחק
רק אם לא נשאר בו קשר קבוצה נוסף. לאחר הניקוי יש להריץ System Audit חוזר.
מסמך קנוני אחר אינו נמחק אוטומטית.

System Audit בודק תמיד את הקשר בשני הכיוונים: כל שחקן בעל הקשר עונתי
ב־Team Season חייב לקבל Player Season, וכל `teamsById[teamId]` ב־Player Season
חייב להיות בבעלות Team Season קיים שמכיל את אותו `playerId`.

## Lifecycle בסיסי

| מצב | מסמכים נדרשים |
|---|---|
| League loaded | League Document ו־Team SearchIndex |
| Roster loaded | Team Root, Team Season ו־Player SearchIndexes |
| Stats loaded | Team Season ו־SearchIndexes מעודכנים |
| Player עם Scout/Favorite/Watchlist/Manual tracking | Player Document |

Team Root ללא עונה ו־Player Document ללא profile פעיל יכולים להיות מצבים
חוקיים, ולכן אינם `unexpected_document` כשלעצמם.
