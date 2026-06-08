# Team Target Benchmarks

מסמך זה מתאר את מבנה הבנצ'מרק הקבוצתי.

## מיקום בקוד

```txt
src/shared/teams/targets/teamTargets.benchmark.js
```

## אחריות

הבנצ'מרק הקבוצתי מגדיר:

```txt
יעד נקודות
נקודות למשחק
אחוז הצלחה
שערי זכות
שערי חובה
הפרש שערים
בית / חוץ
רמת יריבה
פריסת כובשים
שימוש ואיזון סגל
```

## מקור הנתונים

הבסיס המקצועי נבנה מנתוני ליגה ארצית, כאשר בסיס ההשוואה הוא:

```txt
30 משחקים
90 דקות למשחק
11 שחקנים על המגרש
```

בפועל, החישובים מנורמלים לפי נתוני הקבוצה:

```txt
team.leagueNumGames
team.leagueGameTime
```

## בחירת יעד

יש שתי דרכים לבחור יעד:

```js
{
  targetPositionMode: 'exact',
  targetPosition: 5
}
```

או:

```js
{
  targetPositionMode: 'range',
  targetPositionProfile: 'midTop'
}
```

## פרופילי טבלה

```js
top: 1-4
midTop: 5-8
midLow: 9-13
bottom: 14+
```

## מבנה benchmark לפי מיקום

```js
{
  targetPosition: 5,
  targetPositionProfile: 'midTop',
  games: 30,
  points: 51,
  pointsPerGame: 1.71,
  successRate: 57,
  goalsFor: 65,
  goalsForPerGame: 2.17,
  goalsAgainst: 50,
  goalsAgainstPerGame: 1.66,
  goalDifference: 15,
  homeSuccessRate: 67,
  awaySuccessRate: 47,
  difficultySuccessRate: {
    lower: 77,
    equal: 54,
    higher: 11
  }
}
```

## פריסת כובשים

קטגוריות הכובשים הן קטגוריות נפרדות, לא מצטברות:

```txt
scorer = 16+
doubleDigitScorer = 11-15
supportScorer = 6-10
occasionalScorer = 1-5
```

מבנה:

```js
{
  scorer: { target: 0, range: [0, 1] },
  doubleDigitScorer: { target: 2, range: [1, 3] },
  supportScorer: { target: 4, range: [3, 5] },
  occasionalScorer: { target: 10, range: [8, 12] }
}
```

## שימוש בסגל

הבנצ'מרק הקבוצתי כולל מדדי סגל:

```txt
top14MinutesSharePct
playersOver500Minutes
playersOver1000Minutes
playersOver1500Minutes
playersOver2000Minutes
playersOver20Starts
unallocatedMinutesSharePct
```

בסיס הסגל:

```txt
squadSize: 24
```

## דקות לא מוסברות

בשלב זה אין זיהוי אוטומטי של שחקני שנתון צעיר.

לכן פערי דקות נשמרים כ:

```txt
unallocatedMinutesSharePct
```

בעתיד המשתמש יוכל להסביר אותם כדקות שניתנו לשנתון צעיר.

## פונקציות מרכזיות

```js
resolveTeamTargetBenchmark(...)
resolveTeamBenchmarkFromTeam(team)
buildTeamProfileBenchmark(profileId)
normalizeMinutesThreshold(...)
buildBenchmarkNormalizationContext(...)
```
