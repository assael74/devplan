# Clean Reset Runbook

## מטרה

לבנות מחדש את Players Database מקבצי Excel דרך זרימות המקור. Audit מאמת את
התוצאה ואינו יוצר את המצב הקנוני.

## סדר עבודה

1. להקפיא כתיבות.
2. לאמת קבצי League,‏ Roster ו־Stats.
3. למחוק רק את הנתונים שנבחרו לאיפוס.
4. לטעון League ולוודא שה־League Document נשמר.
5. להריץ את שלבי League V2 המפורשים ולאמת כל שלב.
6. לטעון Roster ולאמת Team Season,‏ Movement ו־SearchIndexes.
7. לטעון Stats ולאמת Balance,‏ Scouting ו־projections.
8. להמשיך לקבוצה הבאה רק לאחר שהשלב הקודם נקי.
9. להריץ Audit מערכתי מלא בסיום.

## כללים

- `transferCheck` הוא QA בלבד ואינו מקור Movement.
- `pendingPlayers` מכיל היעדרויות פתוחות בלבד.
- counterpart חסר אינו מצדיק יצירת Team Season.
- SearchIndex,‏ Club,‏ Balance ו־Scout summaries הם projections.
- ב־League V2 אין להסתמך על Job, worker, retry או background processing.
