# תהליך הצבת יעדים לקבוצה ושחקן

מסמך זה מתאר את תהליך הצבת היעדים החדש ב-DevPlan.

## מטרה

לבנות שכבת benchmark אחידה שממנה נגזרים:

```txt
יעדי קבוצה
יעדי שחקנים
פערים מול החלטת מאמן
בסיס לשכבת תובנות ו-scoring
```

המערכת מפרידה בין:

```txt
assigned targets
= היעדים שהמאמן או המשתמש הציב בפועל

benchmark targets
= היעדים המקצועיים שהמערכת ממליצה עליהם לפי מיקום, מעמד ועמדה
```

## זרימת יעד קבוצה

המשתמש יכול להציב יעד קבוצה בשתי דרכים:

```txt
targetPositionMode: 'exact'
targetPosition: 5
```

או:

```txt
targetPositionMode: 'range'
targetPositionProfile: 'midTop'
```

כאשר המשתמש בוחר מיקום מדויק, המערכת מוצאת benchmark לפי מיקום.

כאשר המשתמש בוחר אזור טבלה, המערכת מחשבת benchmark לפי פרופיל אזור.

## פרופילי יעד טבלה

```js
{
  top: { rankRange: [1, 4] },
  midTop: { rankRange: [5, 8] },
  midLow: { rankRange: [9, 13] },
  bottom: { rankRange: [14, null] },
}
```

`bottom` הוא מקום 14 ומטה. בפועל הוא נחתך לפי מספר הקבוצות בליגה.

## זרימת יעד שחקן

יעד שחקן מחושב לפי:

```txt
targetPositionProfile
squadRole
primary position
position group
leagueNumGames
leagueGameTime
```

הקלט המקצועי:

```txt
פרופיל יעד קבוצה
מעמד שחקן בסגל
עמדה ראשית
```

הפלט:

```txt
יעד שערים
יעד בישולים
יעד מעורבות שערים
יעד דקות
יעד פתיחות
יעד ספיגה / אחריות הגנתית
```

## עמדה ראשית וחוליה

החישוב מתבסס על עמדה ראשית.

בקוד עדיין משתמשים במונח:

```txt
layerKey
```

בתצוגות ובשפה מקצועית יש להשתמש במונח:

```txt
חוליה
```

מיפוי לדוגמה:

```txt
S -> התקפה
AC / WING -> קישור התקפי
CM -> קישור
DM -> קישור אחורי
DEF -> הגנה
GK -> שוער
```

## קטגוריות כובשים

קטגוריות כובשים אינן מצטברות. כל שחקן שייך לקטגוריה אחת בלבד.

```txt
occasionalScorer: 1-5
supportScorer: 6-10
doubleDigitScorer: 11-15
scorer: 16+
none: 0
```

לדוגמה: שחקן עם 16 שערים הוא `scorer`, ולא נספר גם ככובש דו ספרתי או כובש משלים.

## טווח ומספר יעד

כל יעד צריך לכלול:

```js
{
  target: 12,
  range: [11, 15]
}
```

כאשר הטווח פתוח:

```js
{
  target: 18,
  range: [16, null]
}
```

המספר `target` הוא נקודת האמצע/המלצת benchmark. הטווח משמש להצגת סבירות ולשיפוט חריגות.

## חיבור בפועל

החיבור הפעיל מתבצע ב:

```txt
src/shared/players/targets/playerDerivedTargets.js
```

ברירת המחדל היא המודל החדש:

```txt
targetSource: 'benchmark'
```

אם חסרים נתונים לבנצ'מרק:

```txt
targetSource: 'benchmarkUnavailable'
```

אין fallback אוטומטי למנוע הישן.

## Rollback

המנוע הישן נשמר בזיכרון תחת:

```txt
legacyExplicitTargets
```

כדי להפעיל אותו במפורש:

```js
{
  useLegacyTargets: true
}
```

או:

```js
{
  targetEngine: 'legacy'
}
```

## קשר לשכבות אחרות

```txt
teams/targets
  -> teams/expectations
  -> teams/scoring
```

```txt
teams/targets
  -> players/targets
  -> players/scoring
```

שכבת הצבת היעדים קובעת benchmark. שכבות scoring מודדות ביצוע מול אותו benchmark או מול ציפיות שנגזרו ממנו.
