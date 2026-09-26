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
| Player Document | היסטוריית שחקן ומצב מעקב/Scouting קומפקטי | Player/Stats domain |
| SearchIndex | חיפוש ותצוגה בלבד | Projection מהמקורות הקנוניים |
| Club / Clubs Master | Projection מ־League ומקבוצות העונה | League ו־Team identity |

`Team Season` הוא מקור האמת לעונת קבוצה אחת. `Team Root` אינו מחזיק payload
עונתי נוסף; `seasons[]` שלו הוא אינדקס ניווט בלבד.

## ביצועי קבוצה

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

- Roster Load כותב סגל, מצב תנועה ומטא־דאטה של הסגל; הוא אינו יוצר Player
  Document רק מפני ששחקן הופיע בסגל.
- Stats Load כותב `playerStats`,‏ Team Balance, scouting ו־Player projections.
- SearchIndex לעולם אינו מקור לתיקון, Migration או חישוב Expected.
- Audit בודק lifecycle, relations ו־projection mismatch; הוא אינו validator
  של סכמת Firestore.
- Repair מחייב אישור משתמש ומשתמש ב־canonical writers בלבד.

## כלל שינוי

לפני שינוי persistence יש לבדוק לפי הסדר:

```text
Architecture → Firestore Catalog → Domain builder → Writer → Projection → Audit/Repair
```

אין להוסיף שדה לכותב בלי חוזה Catalog תואם, ואין לשכפל נוסחה עסקית בכותבים
שונים.
