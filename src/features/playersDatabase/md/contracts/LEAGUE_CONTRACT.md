# League Load Contract

## מקור אמת

ה־League Document הוא המקור הקנוני לטבלת הליגה, לנתוני העונה ול־Team
Performance. כל projection של ביצועי קבוצה חייב להיבנות מאותו League context.

## אחריות

טעינת League רשאית לכתוב:

- League Document.
- Club Season Identity Index.
- Team Performance ל־Team Seasons קיימים בלבד.
- Team SearchIndex תואם.
- Club Documents ו־Clubs Master דרך שלב ה־Club המפורש.

היא אינה יוצרת Team Root או Team Season רק משום שקבוצה הופיעה בטבלה.

## שלבי League V2

```text
1. writeLeague       → League Document
2. syncLeagueIdentity → Club Season Identity Index
3. syncLeagueTeams   → Existing Team Seasons + Team SearchIndexes
4. syncLeagueClubs   → Club Documents + Clubs Master
```

כל שלב מופעל במפורש, ניתן להרצה חוזרת ומאמת את התוצאה לפני החזרה ל־UI.

## כללי זהות

זהות קבוצה היא `teamId` יחד עם `teamSlot` או `birthTeamSlot`. אין להסיק slot
משם קבוצה, סדר מערך, רמת ליגה, שנתון או parsing של `teamId`.

## ביצועים ו־Projection

`goalsForPerGame` ו־`goalsAgainstPerGame` מחושבים מנתוני League ונשמרים עם
לכל היותר ספרה אחת אחרי הנקודה. Team SearchIndex ו־Team Season משתמשים באותו
builder. League Load אינו מחשב ביצועים מ־Player Stats.

## V2 לעומת Legacy

ב־League V2 אין Job, Queue, lease, retry אוטומטי או background worker. הוראות
Legacy במסמכי runbook ישנים אינן חלות על ה־Pilot אלא אם תוכנית V2 תשנה זאת
במפורש.
