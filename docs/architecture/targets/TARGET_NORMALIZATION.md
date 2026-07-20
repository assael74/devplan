# Target Normalization

מסמך זה מתאר את נירמול היעדים.

## למה צריך נירמול

בסיס הנתונים המקורי נבנה סביב:

```txt
30 משחקים
90 דקות למשחק
```

אבל בפועל קיימות ליגות עם:

```txt
15 / 16 / 17 קבוצות
28 / 30 / 32 משחקים
80 / 90 דקות למשחק
```

לכן אסור להשתמש במספרי עונה קשיחים בלי התאמה.

## מקורות אמת

ברמת קבוצה:

```txt
team.leagueNumGames
team.leagueGameTime
```

ברמת משחק:

```txt
game.gameDuration
```

לצורך benchmark עונתי משתמשים ב:

```txt
team.leagueNumGames
team.leagueGameTime
```

לצורך ניתוח משחק בפועל משתמשים ב:

```txt
game.gameDuration
```

## ברירות מחדל

```js
{
  baselineGames: 30,
  baselineGameTime: 90,
  playersOnPitch: 11,
  squadSize: 24
}
```

## נירמול יעד עונתי

אם יעד הבסיס הוא 65 שערים ב-30 משחקים, וליגה בפועל היא 28 משחקים:

```txt
65 * (28 / 30)
```

## נירמול רפי דקות

רפי הבסיס:

```txt
500
1000
1500
2000
```

אינם נשמרים כמספר קשיח בלבד. הם נשמרים גם כאחוז מתוך עונת בסיס:

```txt
500 / (30 * 90) = 18.5%
1000 / (30 * 90) = 37.0%
1500 / (30 * 90) = 55.6%
2000 / (30 * 90) = 74.1%
```

בליגה של 28 משחקים ו-80 דקות:

```txt
500 baseline -> 28 * 80 * 18.5% = 415
```

## פונקציות

```js
buildBenchmarkNormalizationContext(...)
normalizeSeasonTotal(...)
normalizeMinutesThreshold(...)
```

## סגל

גודל סגל benchmark:

```txt
squadSize: 24
```

הסיבה: במחלקות נוער הסגלים משתנים, ו-22 נחשב אופטימי מדי.

## שנתון צעיר

כרגע אין זיהוי אוטומטי של שחקן משנתון צעיר מחוץ לקבוצה.

לכן לא מקזזים אוטומטית דקות מהסגל.

פערים נשמרים כ:

```txt
unallocatedMinutesSharePct
```

בעתיד ניתן יהיה להסביר פערים אלה כדקות שניתנו לשנתון צעיר.

## League Goals Reference Point

Goal-environment normalization must not use a noisy league average directly.

Before calculating the goals normalization factor, the system may build a clean
league reference point from league-table rows.

Implementation source:

```txt
src/shared/teams/targets/teamTargets.referencePoint.js
```

The reference-point pipeline:

```txt
leagueTableRows
  ↓
sample gate
  ↓
threshold filters
  ↓
trimmed mean
  ↓
cleanLeagueGoalsPerMatch
  ↓
teamTargets.normalization
```

The raw table is never changed. Outlier rows are excluded only from the
reference-point calculation.

### Row Metrics

For each team row, the model derives:

```txt
games
points
goalsFor
goalsAgainst
pointsPerGame
goalsForPerGame
goalsAgainstPerGame
totalGoalsPerGame = goalsForPerGame + goalsAgainstPerGame
```

Supported input aliases include:

```txt
gamesPlayed / playedGames / matchesPlayed / games / played / p
goalsFor / leagueGoalsFor / gf / goals / for
goalsAgainst / leagueGoalsAgainst / ga / against
points / pts
```

### Sample Gate

Rows are excluded from the clean reference point when they do not have enough
played games.

Default rule:

```txt
minGames = max(5, ceil(leagueNumGames * 0.25))
```

If the usable sample is too small, the reference point returns:

```txt
status = low_sample
```

In that case, automatic goals normalization is not applied. A manual factor can
still be used by the user.

### Threshold Filters

Rows can be excluded before trimming when they cross hard safety thresholds.

Current defaults:

```txt
pointsPerGame < 0.15
goalsForPerGame > 7
goalsAgainstPerGame > 7
totalGoalsPerGame > 9
```

These filters are meant to prevent broken data or extreme collapse cases from
distorting the reference point.

### Trimmed Mean

After filtering, rows are sorted by:

```txt
totalGoalsPerGame
```

Then the model trims the edges:

```txt
trimPct = 0.1
```

For a reliable sample, this removes roughly 10% from the low edge and 10% from
the high edge. For smaller samples, trimming is conservative.

The clean reference point is calculated as a weighted team-game average:

```txt
cleanLeagueGoalsPerMatch =
  sum(goalsFor + goalsAgainst for clean rows) / sum(games for clean rows)
```

The raw reference is calculated in the same unit before exclusions:

```txt
rawLeagueGoalsPerMatch =
  sum(goalsFor + goalsAgainst for all parsed rows) / sum(games for all parsed rows)
```

### Debug Flags

The reference point also returns diagnostic flags. These flags do not delete
table rows and do not necessarily block normalization by themselves.

```txt
trimmed_edges
stddev_outlier_detected
high_gap_detected
low_sample
```

### Output Shape

```js
{
  status: 'ready' | 'low_sample' | 'blocked',
  method: 'trimmed_mean',

  rawLeagueGoalsPerMatch,
  cleanLeagueGoalsPerMatch,

  rowsCount,
  usableRowsCount,
  cleanRowsCount,
  excludedRowsCount,

  minGames,
  trimPct,
  trimmedLowCount,
  trimmedHighCount,

  excludedRows,
  flags,
  debug,
}
```

## Goals Environment Normalization

Implementation source:

```txt
src/shared/teams/targets/teamTargets.normalization.js
```

The goals factor is:

```txt
rawFactor = leagueGoalsPerMatch / benchmarkBaseGoalsPerMatch
deviationPct = abs(rawFactor - 1) * 100
```

When a reference point is available, `leagueGoalsPerMatch` should be:

```txt
referencePoint.cleanLeagueGoalsPerMatch
```

The active rules:

```txt
mode auto:
  deviation above 5% -> apply normalization
  deviation up to 5% -> skip normalization
  low_sample reference point -> apply projected pace normalization when deviation is above 5%, with low sample metadata

mode off:
  appliedFactor = 1

mode manual:
  appliedFactor = user factor
```

### Early Sample Pace Normalization

The engine follows the user's requested calculation even when the league sample
is early.

If the table contains 3 played rounds out of a 30-game season, the environment
is calculated from the current per-game pace:

```txt
league goals pace = sum(goalsFor + goalsAgainst) / sum(games)
season projection = per-game pace * leagueNumGames
normalization factor = league goals pace / benchmarkBaseGoalsPerMatch
```

Small samples are not blocked automatically. Instead, the result keeps sample
metadata:

```txt
sampleStatus = low_sample
reason = early_sample_projected_pace
```

This means the user can see that the data is early, but the engine still returns
an applied normalization result when the deviation crosses the configured
threshold.

Every target state keeps both versions for comparison:

```txt
values = normalized active values
rawValues = original unnormalized benchmark values
groups = normalized active groups
rawGroups = original unnormalized groups
normalization = factor, sample status, reference point, reason
```

The normalization result should expose both the raw environment and the active
normalized environment, so consumers can compare the calculation instead of
losing the original benchmark context.

```txt
referencePoint = raw and clean league goals per match
normalization = applied / raw factor and reason
comparison.rawLeagueGoalsPerMatch
comparison.cleanLeagueGoalsPerMatch
comparison.rawFactor
comparison.appliedFactor
comparison.projectedRawSeasonGoals
comparison.projectedCleanSeasonGoals
```

Projection fields are calculated from current pace:

```txt
projected season goals = goals per match * leagueNumGames
```

Supported input fields:

```txt
targetNormalizationMode / goalsNormalizationMode / normalizationMode
targetNormalizationFactor / goalsNormalizationFactor / normalizationFactor
leagueGoalsPerMatch
leagueReferencePoint / goalsReferencePoint
leagueTableRows
benchmarkBaseGoalsPerMatch
```

The goals factor is applied only to goal-related target values:

```txt
goalsFor
goalsAgainst
goalDifference
goal-related group values
```

It is not applied to:

```txt
points
successRate
homeAway success rates
difficulty success rates
rank / position
leagueNumGames
minutes / squad usage
```

The target state keeps both versions:

```txt
targets.values = active values, normalized when applied
targets.rawValues = original benchmark values
targets.groups = active groups
targets.rawGroups = original groups
targets.normalization = normalization metadata
```
