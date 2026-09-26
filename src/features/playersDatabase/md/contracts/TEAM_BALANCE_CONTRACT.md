# Team Balance and Scouting Contract

## מקור ותחום

Team Balance נגזר מ־Player Stats ומכסה את הסגל הנוכחי (`rosterStatus:
regular`). הוא אינו מקור ל־Team Performance ואינו משתמש ב־SearchIndex כמקור.

לפני שמונה משחקי League רשמיים או לפני טעינת Stats, המצב הוא unavailable;
הסיבה היא `season_sample_insufficient` או `stats_not_loaded` בהתאמה.

## Line Classification

הבונה הקנוני מסווג לפי Stats של העונה הנוכחית בלבד:

- פחות מ־8 משחקים — ללא סיווג.
- 8+ משחקים ו־10+ שערים — `ATTACK`.
- אחרת נדרש שער דקות אישי של 70% ומטריצת הדקות/החלפות.
- refinements נתמכים רק `FULLBACK` ו־`ATTACKING_MIDFIELDER`.
- שוער מאומת אינו מסווג סטטיסטית כ־Defense.

`primaryPosition` ו־`positionLayer` הם שדות אימות חזותי ואינם input לסיווג.

## Benchmark ו־Interpretation

ה־benchmark הקנוני הוא: goalkeeper 1, defense 4, midfield core 3,
attacking midfielder 1, attack 2. הוא מחזיר רק `below_reference`,
`at_reference`, `above_reference` או `unavailable`.

Team Interest משתמש רק ב־Attack וב־Defense. `midfieldCore` ו־
`attackingMidfielder` הם diagnostics מבניים ואינם יוצרים finding. ‏
`teamNeed` ו־`marketOpportunity` הם runtime interpretation ואינם נשמרים
כפעולות ב־Team Season או ב־SearchIndex.

## Invalidation

שינוי תפקיד ידני מחייב בנייה מחדש של `lineClassification`,‏ Team Balance,
`lineStructure`,‏ `lineupBenchmark`, fingerprint ו־projections downstream.

Team Season SearchIndex מקבל רק את גרסת המודל, זמינות, findings ו־`teamInterest`;
הוא אינו משכפל את כל מבנה הקווים או את ה־benchmark.
