# Player Target Benchmarks

מסמך זה מתאר את בנצ'מרק יעדי השחקן.

## מיקום בקוד

```txt
src/shared/players/targets/playerTargets.benchmark.js
```

החיבור הפעיל למערכת מתבצע דרך:

```txt
src/shared/players/targets/playerDerivedTargets.js
src/shared/players/targets/playerTargets.builder.js
```

## מטרת המודל

לתת יעד שחקן ברור לפי:

```txt
יעד קבוצה
מעמד בסגל
עמדה ראשית
חוליה / קבוצת עמדה
```

## קלט

```js
{
  targetPositionProfile: 'midTop',
  squadRole: 'key',
  positionCode: 'S',
  leagueNumGames: 30,
  leagueGameTime: 90
}
```

## פלט

```js
{
  goals: {
    tier: 'doubleDigitScorer',
    target: 12,
    range: [11, 15],
    perGameTarget: 0.4
  },
  assists: {
    target: 3,
    range: [1, 5],
    perGameTarget: 0.1
  },
  goalContributions: {
    target: 15,
    range: [12, 20]
  },
  minutes: {
    minutesPct: { target: 82, range: [70, 95] },
    startsPct: { target: 78, range: [65, 95] }
  }
}
```

## מעמד שחקן

```txt
key
core
rotation
fringe
```

מעמד משפיע בעיקר על:

```txt
דקות
פתיחות
רף שערים לפי עמדה ויעד קבוצה
```

## קבוצות עמדה

```txt
S
AC
WING
CM
DM
DEF
GK
```

החישוב מתבסס על עמדה ראשית.

בקוד עדיין קיימת שכבת `layerKey`, אך בתצוגה יש לדבר על "חוליה".

## מדרגות שערים

```js
{
  scorer: {
    target: 18,
    range: [16, null]
  },
  doubleDigitScorer: {
    target: 12,
    range: [11, 15]
  },
  supportScorer: {
    target: 8,
    range: [6, 10]
  },
  occasionalScorer: {
    target: 3,
    range: [1, 5]
  },
  none: {
    target: 0,
    range: [0, 0]
  }
}
```

## כלל חישוב

המודל לא מחשב יעד שערים כאחוז משערי הקבוצה.

הוא משתמש בכלל:

```txt
targetPositionProfile + squadRole + positionGroup -> goal tier
```

לדוגמה:

```txt
midTop + key + S -> doubleDigitScorer -> target 12, range 11-15
```

## בישולים ומעורבות

יעד הבישולים נגזר לפי קבוצת עמדה ומדרגת שערים.

מעורבות שערים:

```txt
goals target + assists target
```

## הגנה וספיגה

לשחקני הגנה, קשר אחורי ושוער יש יעד אחריות הגנתית:

```txt
goalsAgainstResponsibilityPct
cleanSheetPct
```

המדידה בפועל מתבצעת בשכבות scoring/insights.

## יעד מאמן מול benchmark

המערכת לא חוסמת יעד מאמן.

אפשר להשוות:

```txt
assignedTargets
benchmarkTargets
```

באמצעות:

```js
compareAssignedPlayerTargetsToBenchmark(...)
```

## מצב חסר

אם חסר:

```txt
targetPositionProfile
squadRole
primary position
```

אז אין יעד benchmark:

```txt
targetSource: 'benchmarkUnavailable'
```

אין fallback אוטומטי למנוע הישן.
