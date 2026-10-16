# Team Balance and Scouting Contract

## מקור ותחום

Team Balance נגזר מ־Player Stats ומכסה את הסגל הנוכחי (`rosterStatus:
regular`). הוא אינו מקור ל־Team Performance ואינו משתמש ב־SearchIndex כמקור.

לפני שמונה משחקי League רשמיים או לפני טעינת Stats, המצב הוא unavailable;
הסיבה היא `season_sample_insufficient` או `stats_not_loaded` בהתאמה.

## Line Classification

הבונה הקנוני מסווג לפי Stats של העונה הנוכחית בלבד:

- פחות מ־8 הופעות בפועל של השחקן — ללא סיווג.
- לאחר 8 הופעות, ספי השערים משתמשים באותו צפי עונתי של מנוע פרופילי הסקאוט. בעונה שהסתיימה משתמשים בשערים בפועל.
- 10+ שערים לפי בסיס זה — `ATTACK`; 5+ שערים עשויים לסווג כ־`ATTACKING_MIDFIELDER` לאחר בדיקת דקות.
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

כאשר אין שחקנים מסווגים בקו התקפה או הגנה, ה־finding הוא בקשת בדיקת סיווג.
המצב אינו קובע חוסר איכות ואינו מפיק `teamNeed` או `marketOpportunity` לקו.

## Invalidation

שינוי תפקיד ידני מחייב בנייה מחדש של `lineClassification`,‏ Team Balance,
`lineStructure`,‏ `lineupBenchmark`, fingerprint ו־projections downstream.

Team Season SearchIndex מקבל רק את גרסת המודל, זמינות, findings ו־`teamInterest`;
הוא אינו משכפל את כל מבנה הקווים או את ה־benchmark.

## עקביות תצוגת עמוד קבוצה

כשנתוני השחקנים זמינים, עמוד הקבוצה גוזר את Team Balance לתצוגה דרך הבונה
הקנוני, מאותם סיווגים עונתיים שמזינים את הטבלה והפילטרים. כך סיכום שנשמר
לפני שינוי במודל הסיווג אינו גובר על הסיווג המוצג לשחקן. הדבר חל גם על
העונה הקודמת, עם נתוניה והקשר העונה שלה בלבד. פילטר פרופילים בטבלה אינו
משנה את אוכלוסיית חישוב איזון הסגל. החישוב לתצוגה אינו כותב למסמכי המקור.
