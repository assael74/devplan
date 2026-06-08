# Team Scoring Model

## Related Targets Model

Team scoring measures performance against expectations. The target-setting and benchmark process is documented separately:

```txt
docs/architecture/targets/TARGET_SETTING_PROCESS.md
docs/architecture/targets/TEAM_TARGET_BENCHMARKS.md
```

The current benchmark source is:

```txt
src/shared/teams/targets/teamTargets.benchmark.js
```

מסמך ארכיטקטורה למנוע ציון קבוצתי בפרויקט DevPlan.

## מיקום

```txt
src/shared/teams/scoring
```

## Source of Truth

הצנרת:

```txt
src/shared/teams/targets
  ↓
src/shared/teams/expectations
  ↓
src/shared/teams/scoring
```

## חלוקת אחריות

```txt
teams/targets
= מקור האמת לבנצ׳מרקים ויעדים עונתיים

teams/expectations
= ציפייה מותאמת למשחק / רצף משחקים

teams/scoring
= מדידה בפועל מול הציפייה
```

## מה scoring מחשב

```txt
Team Efficiency Rating
Team Cumulative Impact / TVA
pointsPaceDelta
goalsForDelta
goalsAgainstDelta
rating למשחק
rating לתקופה
reliability
```

## מה scoring לא מחשב יותר

`teams/scoring` לא מחשב לבד:

```txt
expectedPoints
expectedGoalsFor
expectedGoalsAgainst
targetPointsPerGame
targetGoalsForPerGame
targetGoalsAgainstPerGame
```

הנתונים האלה מגיעים מ:

```txt
src/shared/teams/expectations
```

## Team Efficiency Rating

```txt
6.0 = הקבוצה עמדה בציפייה
מעל 6.0 = מעל הציפייה
מתחת 6.0 = מתחת לציפייה
```

## TVA

```txt
TVA = Σ(rating - baseRating)
```

משמעות:

```txt
חיובי = ערך מצטבר מעל הציפייה
שלילי = ערך מצטבר מתחת לציפייה
```

## pointsPaceDelta

```txt
pointsPaceDelta = actualPoints - expectedPoints
```

ה־`expectedPoints` מגיע מ־`teams/expectations`.

## goals deltas

```txt
goalsForDelta = actualGoalsFor - expectedGoalsFor
goalsAgainstDelta = expectedGoalsAgainst - actualGoalsAgainst
```

## difficulty

השדה התקני הוא:

```js
difficulty
```

fallback ל־`equal` מתבצע בשכבת `teams/expectations`.

## sportingDirectorAssessment

המונח התקני:

```js
sportingDirectorAssessment
```

זהו רכיב scoring בלבד, לא benchmark.

## פלט עונתי / תקופתי

```js
{
  status,

  teamRating,
  teamRatingRaw,

  tva,
  pointsPaceDelta,

  actualPoints,
  expectedPoints,

  actualGoalsFor,
  expectedGoalsFor,
  goalsForDelta,

  actualGoalsAgainst,
  expectedGoalsAgainst,
  goalsAgainstDelta,

  ratedGames,
  reliability,

  scores,
}
```

## UI Integration

הסקורינג מוצג כ־section עצמאי:

```txt
מדד יעילות והשפעה
```

אין לערבב אותו ישירות בתוך forecast.

```txt
forecast = תחזית סוף עונה
teamScoring = ביצוע בפועל מול ציפייה מותאמת
```

## Source Routing

במודל המקומי צריך להפריד:

```txt
games
= המקור המעובד שהתובנות הוותיקות מצפות לו

rawGames
= מקור גולמי רק עבור teamScoring
```

## מה נשאר עתידית

```txt
לבנות games/insights/team/sections/performance
לייצר brief עצמאי שמפרש את הסקורינג
להוסיף tooltip / פירוט לקוביות הסקורינג
לשלב בדוחות ו־print
```
