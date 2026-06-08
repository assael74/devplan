# Targets Architecture

תיקייה זו מתארת את שכבת הצבת היעדים ב-DevPlan.

השכבה הזו אחראית על הגדרת benchmark מקצועי ויעדים עונתיים לקבוצה ולשחקנים. היא אינה שכבת scoring, ואינה שכבת expectations.

## אחריות

```txt
targets
= מקור אמת להצבת יעדים ובנצ'מרקים עונתיים

expectations
= תרגום יעד עונתי לציפייה למשחק או רצף משחקים

scoring
= מדידת ביצוע בפועל מול יעד/ציפייה
```

## קבצים

```txt
TARGET_SETTING_PROCESS.md
= התהליך המלא של הצבת יעד קבוצה ושחקן

TEAM_TARGET_BENCHMARKS.md
= מבנה הבנצ'מרק הקבוצתי

PLAYER_TARGET_BENCHMARKS.md
= מבנה הבנצ'מרק לשחקן

TARGET_NORMALIZATION.md
= נירמול לפי משחקים, זמן משחק וסגל

LEGACY_TARGETS_ROLLBACK.md
= מדיניות rollback למנוע הישן
```

## קוד רלוונטי

```txt
src/shared/teams/targets/teamTargets.benchmark.js
src/shared/players/targets/playerTargets.benchmark.js
src/shared/players/targets/playerDerivedTargets.js
src/shared/players/targets/playerTargets.builder.js
```

## כלל חשוב

המאמן יכול להציב יעד גם אם הוא לא תואם את הבנצ'מרק.

הבנצ'מרק לא נועד לחסום את המאמן. הוא נועד לתת בסיס אחיד לשיפוט, תובנות, זיהוי חריגות ופערים.
