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
- seasonUrl בבעלות עונת League. הקישור ב־LeaguesCenter וב־Player SearchIndex
  הוא Projection בלבד.
- teamUrl בבעלות שורת הקבוצה בעונת League, גם לפני יצירת Team Season.
  Team Season ואינדקסי הקבוצה והשחקנים הם עותקים; אין החזרת ערך מהם למקור.
- ClubProfile.clubUrl הוא שדה קנוני ידני בתוך מסמך שיתר תחומיו נשארים בבעלותם.
  שדה קיים נשמר גם כשהוא ריק. אקסל/קטלוג רשאים לאתחל רק שדה חסר.
  ClubsDirectory ו־ClubsCenter מקרינים אותו מ־ClubProfile. עריכת הקישור אינה
  משנה externalClubId.

כללי פעולות העריכה: `../contracts/STANDALONE_EDITS_CONTRACT.md`.

עריכת קישור עונת League מופרדת מעריכת competitionRules. הראשונה מסנכרנת
רק קישורים; השנייה מחשבת תחזיות באמצעות בוני התחום הקיימים ומשמרת manual.
חותמת זמן אחידה נכתבת בכל מסמך ורשומה מקוננת ששונו בפעולת עריכה.
