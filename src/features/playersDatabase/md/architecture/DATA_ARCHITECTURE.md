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

## בעלות קישורים ועריכה ידנית

- playerUrl של שחקן בקבוצה ובעונה בבעלות רשומת Team Season; Player ואינדקס
  השחקן מכילים עותקים מסונכרנים. במסלול עריכה מעמוד Player שלושתם מחויבים.
- seasonUrl בבעלות עונת League. leagueUrl העונתי ב־LeaguesMaster וקישור
  העונה באינדקסים הם הקרנות; leagueUrl הכללי במאסטר אינו יעד של עריכה זו.
- teamUrl בבעלות שורת הקבוצה בעונת League, גם לפני יצירת Team Season.
  Team Season ואינדקסי הקבוצה והשחקנים הם עותקים; אין החזרת ערך מהם למקור.
- Club.clubUrl הוא שדה קנוני ידני בתוך מסמך שיתר תחומיו נשארים בבעלותם.
  שדה קיים נשמר גם כשהוא ריק. אקסל/קטלוג רשאים לאתחל רק שדה חסר.
  ClubsMaster מקרין אותו מ־Club. עריכת הקישור אינה משנה externalClubId.

כללי פעולות העריכה: `../contracts/STANDALONE_EDITS_CONTRACT.md`.

עריכת קישור עונת League מופרדת מעריכת competitionRules. הראשונה מסנכרנת
רק קישורים; השנייה מחשבת תחזיות באמצעות בוני התחום הקיימים ומשמרת manual.
חותמת זמן אחידה נכתבת בכל מסמך ורשומה מקוננת ששונו בפעולת עריכה.
