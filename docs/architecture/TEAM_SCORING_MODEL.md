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

## Benchmark Normalization Layer

Team scoring does not calculate benchmark normalization.

Normalization belongs to:

```txt
src/shared/teams/targets/teamTargets.normalization.js
```

Clean league reference-point calculation belongs to:

```txt
src/shared/teams/targets/teamTargets.referencePoint.js
```

The scoring pipeline is:

```txt
teams/targets
  raw benchmark
  clean league goals reference point
  normalization decision
  normalized target values
  ↓
teams/expectations
  expectedPoints
  expectedGoalsFor
  expectedGoalsAgainst
  ↓
teams/scoring
  actual performance vs expectation
```

`teams/scoring` receives expectations from:

```txt
src/shared/teams/expectations
```

Those expectations are based on the active target values:

```txt
targets.values
targets.groups
```

If normalization was applied, scoring measures the team against the normalized
expectation. It does not compare actual performance directly against the raw
benchmark.

For audit, explanation, and UI toggles, scoring can expose the normalization
metadata through the score context:

```txt
score.context.targets.normalization
score.context.targets.normalization.referencePoint
score.context.targets.rawValues
score.context.targets.rawGroups
score.expectations.context.targets.normalization
```

Normalization rules:

```txt
mode auto:
  deviation above 5% -> apply normalization
  deviation up to 5% -> skip normalization

mode off:
  appliedFactor = 1

mode manual:
  appliedFactor = user factor
```

The goals factor affects scoring only indirectly, through the expected values
created by `teams/expectations`:

```txt
expectedGoalsFor
expectedGoalsAgainst
goalsForDelta
goalsAgainstDelta
rating attack / defense deltas
```

The goals factor does not change:

```txt
actualPoints
actualGoalsFor
actualGoalsAgainst
sportingDirectorAssessment
baseRating
scoring weights
```

Final rule:

```txt
teams/scoring measures against active expectations.
teams/targets decides whether those expectations are raw or normalized.
teams/targets also decides whether the league goals reference point is ready.
```
