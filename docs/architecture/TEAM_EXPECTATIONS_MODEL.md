# Team Expectations Model

## Related Targets Model

Team expectations translates season targets into game expectations. The target-setting and benchmark process is documented separately:

```txt
docs/architecture/targets/TARGET_SETTING_PROCESS.md
docs/architecture/targets/TEAM_TARGET_BENCHMARKS.md
docs/architecture/targets/TARGET_NORMALIZATION.md
```

The current benchmark source is:

```txt
src/shared/teams/targets/teamTargets.benchmark.js
```

מסמך ארכיטקטורה לשכבת הציפיות הקבוצתיות בפרויקט DevPlan.

## מטרת השכבה

`teams/expectations` היא שכבת תרגום, לא שכבת benchmark.

```txt
src/shared/teams/targets/teamTargetProfiles.js
= מקור האמת המקצועי לבנצ׳מרקים

src/shared/teams/expectations
= תרגום benchmark עונתי לציפייה למשחק / רצף משחקים
```

כל ריענון benchmark מתבצע רק ב:

```txt
src/shared/teams/targets/teamTargetProfiles.js
```

## מיקום

```txt
src/shared/teams/expectations
```

## הצנרת

```txt
teams/targets
  ↓
teams/expectations
  ↓
teams/scoring
```

וגם:

```txt
teams/expectations
  ↓
players/scoring
```

## אחריות

השכבה מחשבת:

```txt
expectedPoints
expectedGoalsFor
expectedGoalsAgainst
```

למשחק אחד או לרצף משחקים.

היא מתחשבת ב:

```txt
target profile
home / away
difficulty
leagueNumGames
```

## מה אסור לשים כאן

אסור להגדיר כאן benchmarks מקצועיים חדשים:

```txt
לא easy.attack = 1.15
לא hard.defense = 1.18
לא יעד נקודות חדש
לא יעד שערים חדש
```

כל אלה שייכים רק ל:

```txt
src/shared/teams/targets/teamTargetProfiles.js
```

## קבצים

```txt
src/shared/teams/expectations/
  index.js
  expectations.config.js
  expectations.status.js
  expectations.utils.js
  expectations.context.js
  expectations.game.js
  expectations.scope.js
```

## פלט למשחק

```js
{
  status: 'ready' | 'partial' | 'blocked',

  gameId,
  teamId,

  targetProfileId,
  targetLabel,

  homeAway,
  difficulty,

  expectedPoints,
  expectedGoalsFor,
  expectedGoalsAgainst,

  base: {
    pointsPerGame,
    goalsForPerGame,
    goalsAgainstPerGame,
  },

  rates: {
    seasonRate,
    homeAwayRate,
    difficultyRate,
    finalRate,
  },

  missing: [],
  fallback: [],

  context,
}
```

## פלט לרצף משחקים

```js
{
  status,

  gamesCount,
  usableGamesCount,
  blockedGamesCount,

  expectedPoints,
  expectedGoalsFor,
  expectedGoalsAgainst,

  actualPoints,
  actualGoalsFor,
  actualGoalsAgainst,

  deltas: {
    points,
    goalsFor,
    goalsAgainst,
  },

  rows,
}
```

## Gate Rules

### חוסם

```txt
חסר team
חסר game
חסר targets / target profile
חסר target points
חסר leagueNumGames ואין fallback
```

### fallback

```txt
חסר difficulty → equal
חסר home/away → neutral
חסר homeAway target → successRate עונתי
חסר difficulty target → successRate עונתי
חסר leagueNumGames → defaultLeagueGames
```

### partial

```txt
חסר goalsFor target → expectedGoalsFor = null
חסר goalsAgainst target → expectedGoalsAgainst = null
```

## כלל סופי

```txt
expectedPoints / expectedGoalsFor / expectedGoalsAgainst
מחושבים רק ב־src/shared/teams/expectations.
```

## Benchmark Normalization Layer

Team benchmark normalization is a `teams/targets` responsibility, not an
`teams/expectations` responsibility.

The normalization source is:

```txt
src/shared/teams/targets/teamTargets.normalization.js
```

The clean league reference-point source is:

```txt
src/shared/teams/targets/teamTargets.referencePoint.js
```

The active pipeline is:

```txt
teams/targets
  raw benchmark
  clean league goals reference point
  normalization decision
  normalized target values
  ↓
teams/expectations
  game / scope expectations
  ↓
teams/scoring
```

`teams/expectations` consumes the active target values it receives:

```txt
targets.values
targets.groups
```

When normalization is applied, those values are already normalized. The original
benchmark values remain available for audit and UI:

```txt
targets.rawValues
targets.rawGroups
targets.normalization
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

The goals factor is applied only to goal-related benchmark values:

```txt
goalsFor
goalsAgainst
goalDifference
goal-related group values
```

The goals factor is not applied to:

```txt
points
successRate
homeAway success rates
difficulty success rates
rank / position
leagueNumGames
minutes / squad usage
```

Missing normalization input does not block expectations. If
`leagueGoalsPerMatch` is missing, `teams/targets` returns raw target values and
marks:

```txt
targets.normalization.available = false
targets.normalization.applied = false
```

If `leagueTableRows` are available, `teams/targets` can calculate:

```txt
targets.normalization.referencePoint.cleanLeagueGoalsPerMatch
```

`teams/expectations` still does not clean outliers or calculate the factor. It
only consumes the active targets produced by `teams/targets`.
