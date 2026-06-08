# Player Scoring Model

## Related Targets Model

Player scoring consumes player targets. The target-setting process itself is documented separately:

```txt
docs/architecture/targets/TARGET_SETTING_PROCESS.md
docs/architecture/targets/PLAYER_TARGET_BENCHMARKS.md
```

The current benchmark source is:

```txt
src/shared/players/targets/playerTargets.benchmark.js
```

מסמך ארכיטקטורה למנוע ציון שחקנים בפרויקט DevPlan.

## מיקום

```txt
src/shared/players/scoring
```

## אחריות

מנוע scoring של שחקנים מחשב:

```txt
rating למשחק
rating לתקופה
TVA
personal delta
teamImpact delta
targetPace delta
coach delta
reliability
flags
```

המנוע בודק:

```txt
איך השחקן סיפק את הסחורה ביחס למה שנדרש ממנו?
```

לא:

```txt
מי השחקן הכי מוכשר?
```

## שכבות קשורות

```txt
src/shared/players/targets
= יעד אישי לשחקן לפי יעד קבוצה + מעמד + עמדה

src/shared/teams/expectations
= ציפייה קבוצתית למשחק הספציפי

src/shared/players/scoring
= ציון שחקן מול יעד אישי + ציפיית המשחק הקבוצתית
```

## Source of Truth

```txt
teams/targets
  ↓
teams/expectations
  ↓
players/scoring
```

וגם:

```txt
teams/targets
  ↓
players/targets
  ↓
players/scoring
```

## מה players/scoring לא מחשב יותר

`players/scoring` לא מחשב לבד:

```txt
targetGoalsForPerGame
targetGoalsAgainstPerGame
```

ולא מבצע:

```txt
seasonTargets.goalsFor / leagueNumGames
seasonTargets.goalsAgainst / leagueNumGames
```

במקום זה הוא צורך:

```js
teamGameExpectations.expectedGoalsFor
teamGameExpectations.expectedGoalsAgainst
```

מ־:

```txt
src/shared/teams/expectations
```

## teamImpactDelta

`teamImpactDelta` מבוסס על:

```txt
teamGoalsFor מול expectedGoalsFor
teamGoalsAgainst מול expectedGoalsAgainst
```

ה־expected values מגיעים מ־`teams/expectations`.

## לא להכפיל teamImpact ב־difficulty

אין להכפיל את `teamImpactDelta` בעוד opponent / difficulty modifier.

הסיבה:

```txt
difficulty כבר מגולם בתוך teamGameExpectations.
```

אפשר להשאיר difficulty modifier על:
- personal delta
- targetPace delta

אבל לא על:
- teamImpact delta

## Match Flow

```txt
player
team
game
playerGame
  ↓
resolveScoringReadiness
  ↓
buildScoringContext
  ↓
buildTeamGameExpectations
  ↓
buildPlayerMatchScore
```

## Context

```js
{
  playerId,
  gameId,

  roleId,
  roleLabel,

  positionLayer,
  positionLabel,

  teamProfileId,
  opponentLevel,

  gameMinutes,
  timePlayed,

  goals,
  assists,
  involvement,

  teamGoalsFor,
  teamGoalsAgainst,

  teamGameExpectations,

  attackTargets,
  defenseTargets,

  hasLowMinutesSample,
}
```

## Deltas

```txt
personal
teamImpact
targetPace
coach
```

## פלט משחק

```js
{
  status,
  isReady,

  rating,
  baseRating,

  weightedDelta,
  deltas,

  flags,

  context,
  teamGameExpectations,

  targets,
  reliability,
}
```

## Flags

```js
{
  missingTeamGameExpectations,
  missingExpectedGoalsFor,
  missingExpectedGoalsAgainst,
  hasExpectationFallbacks,
  hasExpectationMissing,
  missing,
  fallback,
}
```

## Readiness

חוסם:
- player
- team
- playerGame
- timePlayed
- calculationMode
- role
- position
- team target

לא בהכרח חוסם:
- teamGameExpectations חלקי

במקרה כזה `teamImpactDelta` מתבטל או חלקי, אבל personal / targetPace עדיין יכולים לעבוד.

## כלל ארכיטקטוני

```txt
players/scoring לא מייצר benchmark קבוצתי חדש.
players/scoring צורך:
- player targets
- team expectations
```

Benchmark מקצועי נקבע רק ב:

```txt
src/shared/teams/targets/teamTargetProfiles.js
```
