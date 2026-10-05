# Player Scout Engine Contract

## מטרת המסמך

זהו מסמך הכניסה למשימות Player Scout תחת `playersDatabase`. יש לקרוא אותו
לפני סריקה רחבה של המנוע. הוא מרכז את הקלט הנדרש, החישובים, החסמים, מקורות
המידע ופערי החיבור הידועים.

מקורות הקוד המרכזיים:

- [חוזה הקלט](../../../../shared/scouting/players/contracts/playerScoutInput.contract.js)
- [תזמור המנוע](../../../../shared/scouting/players/buildPlayerScoutState.js)
- [מדדים מחושבים](../../../../shared/scouting/players/metrics.js)
- [הגדרות הפרופילים](../../../../shared/scouting/players/profiles.js)
- [חסם הקבוצה](../../../../shared/scouting/players/context/playerTeamGate.js)
- [סיווג קו](../../../../shared/scouting/teams/lines/teamLineClassification.js)
- [שכבת Stats Load](../../domain/stats/statsLoad.builder.js)
- [חוזה Stats Load](STATS_LOAD_CONTRACT.md)

## זרימת החישוב

```text
Player + Team + Season
→ Calculation Contract
→ Normalization / Projection
→ Metrics
→ Profile Rules
→ Team Gate
→ Reclassification
→ Hierarchy / Strength / Output
```

## קלט בסיסי

### שחקן

- `games`
- `goals`
- `yellowCards`
- `minutes`
- `starts`
- `substituteIn` / `subIn`
- `substitutedOut` / `subOut`
- `birthYear`
- `playingUpMinutes`
- `primaryPosition`
- `positionLayer`
- `lineClassification`
- `rosterStatus`

### קבוצה ועונה

- `ageGroupId`
- `teamGamePlayed` / `teamGames`
- `goalsFor`
- `goalsAgainst`
- `leagueLevel`
- `clubLevel`
- `clubStrengthLevel`
- `birthYear` של הקבוצה
- `birthTeamSlot`
- `seasonKey`
- `seasonStatus`
- `leagueTotalRound`
- `offense` ו־`defense` מתוך Team Performance הרשמי

`ClubProfile` אינו קלט ישיר למנוע. המנוע צריך רק את הערכים המספריים
`clubLevel` ו־`clubStrengthLevel`. ב־Players Database הם אמורים להגיע מ־
`TeamSeason.competitionSnapshot`.

## חישובים מרכזיים

- `gameTime`:‏ U14–U16 הם 80 דקות; U17 ו־U19 הם 90 דקות.
- `seasonMinutes = teamGames × gameTime`.
- `minutesPct = minutes ÷ seasonMinutes`.
- `minutesPerGame = minutes ÷ games`.
- `goalsPerGameDuration = goals × gameTime ÷ minutes`.
- `goalsShareOfTeam = goals ÷ goalsFor`.
- `isYoungerAgeGroup` נגזר משנות הלידה או מ־`playingUpMinutes`.
- `topClubOpportunityEligible` דורש מועדון רמה 1, או רמה 2 בקבוצה הראשונה.

אין להעביר אחוז דקות כעובדה עצמאית. יש להעביר דקות שחקן, משחקי קבוצה
ו־`ageGroupId`, והמנוע מחשב את האחוז.

כאשר העונה פעילה ו־`teamGames < leagueTotalRound`, המנוע משליך את הנתונים
לעונה מלאה. לכן פרופיל בעונה פעילה עשוי להיקבע לפי ערך חזוי ולא לפי הערך
הגולמי המוצג בטבלה.

## תנאי הפרופילים

| פרופיל | תנאי עיקרי |
|---|---|
| `clear_scorer` | 15 שערים ומעלה |
| `killer_efficiency` | 600 דקות, 5 שערים ו־0.65 שערים לזמן משחק מלא |
| `preliminary_low_output` | 80% דקות ומעלה ועד 2 שערים |
| `last_station` | המרה של `preliminary_low_output` בקו הגנה או קישור |
| `attacking_support` | המרה של `preliminary_low_output` בקו התקפה או קשר התקפי |
| `back_threat` | 3–5 שערים ו־70% דקות ומעלה |
| `promoted_talent` | שחקן צעיר מהשנתון ולפחות 3 משחקים |
| `secondary_threat` | 6–9 שערים |
| `double_digit_threat` | 10–14 שערים |
| `underused_prospect` | הקשר מועדון מתאים, 5%–15% דקות, לא צעיר מהשנתון |
| `blocked_top_team` | 10 משחקים, עד 25 דקות למשחק, 6 כניסות כמחליף ועד 3 הרכבים |

## חסם הקבוצה

החסם נפתח ללא תלות בביצועי הקבוצה כאשר מתקיים אחד מהבאים:

- תנאי `openContext` של הפרופיל.
- U15 ומטה ורמת ליגה עד 3.
- רמת ליגה עד 2.
- `clubStrengthLevel` עד 1.5.

אחרת נבדקים `offense` ו־`defense`. צד חיובי הוא `priorityLevel` חיובי או
ציון 60 ומעלה. לפרופילים מסוימים נדרשת התקפה חיובית, הגנה חיובית או צד
חיובי כלשהו. בפרופיל התקפי עם 10 שערים ומעלה קיים מעקף של ביצועי ההתקפה.

העמדה אינה חסם מספרי לפרופיל. חוסר עמדה או אי־התאמה מייצרים הקשר, אזהרה או
צורך באימות. `lineClassification` כן משמש להמרת `preliminary_low_output`
ל־`last_station` או `attacking_support`.

## `rosterStatus` — התנהגות נוכחית

`rosterStatus` מועבר למנוע כהקשר, אך אינו חוסם זכאות לפרופיל אישי.
`left`,‏ `joined` ו־`youngerAgeGroup` מקבלים חישוב כאשר קיימים להם Stats
טעונים. Team Balance ממשיך לכלול רק `regular`, מפני שהוא מייצג את הסגל
התפעולי ולא את ההיסטוריה האישית של השחקן.

## קלט מתקדם

הקלט הבא אינו נדרש לרוב הפרופילים הבסיסיים, אך נדרש לתוצאה מלאה:

- `goalGames` — פיזור שערים.
- `verificationAnswers` — אימות עמדה, סוכן, מעבר, פיזור שערים וצפייה.
- `manualReview` — בדיקה מקצועית ידנית.
- `manualImmediacyDecision` — `watch`,‏ `priority`,‏ `immediate` או `remove`.
- `playerSeasonStints` — מגמה והתמדה לאורך עונות.
- `previousProfileDistances` — שינוי המרחק מפרופיל.
- `futureCompetitionPath` או `clubBirthTeams` — מסלול תחרות עתידי.
- `expectedLevelDelta` — חלופה למסלול עתידי מפורט.

## מצב החיבור של Stats Load

Stats Load מעביר כיום את נתוני הסטטיסטיקה, הקשר הליגה, משחקי הקבוצה, שערי
הקבוצה, רמות התחרות, ביצועי הקבוצה, העמדה וסיווג הקו.

הוא אינו מעביר כיום באופן מלא את הקלט המתקדם: היסטוריית עונות, תשובות
אימות, החלטות ידניות, מרחקים קודמים ומסלול תחרות עתידי.

Stats Load שומר את עומק כל הפרופילים תחת `profileDepthsById`, את מזהי
השילובים מתוך `scoutCombinations` ואת מערך ה־evidence תחת
`evidence.indicators`. עמדה ידועה מקבלת עדיפות בעת המרת
`preliminary_low_output`, ולכן שחקן התקפי ידוע יכול לקבל
`attacking_support` גם אם הסיווג הסטטיסטי האוטומטי הצביע על קו אחר.

## חסמי תצוגה במודאל Stats Load

המודאל יכול לקבל פרופיל מהמנוע ועדיין לא להציג אותו. יש לבדוק את החסמים
הבאים בנפרד מחוקי הזכאות של המנוע:

1. `previewCalculationContext` אינו נבנה כאשר חסר
   `competitionSnapshot.officialTable.teamGamePlayed` או כאשר ערכו אינו חיובי.
2. `buildStatsPlayerPreviewState` אינו מחשב preview ללא `teamId`,‏ `seasonId`,
   `gameDurationMinutes` ו־`teamMinutes` חיובי.
3. לאחר יצירת `approvedStatsPlan`, המודאל מחליף את החישוב המקומי בפלט התוכנית.
   שחקן שלא נמצא ב־approved lookup או שאין עבורו `scouting` חוזר לשורה ללא
   פרופיל מוצג.
4. פרופיל עם `depthPct === 0` מוצג כהתאמה חוקית לסף; רק עומק חסר לחלוטין
   נשאר חסם תצוגה.
5. עומקי `primary`,‏ `secondary`,‏ `professional` ו־`preliminary` נשמרים
   ומועברים ל־preview דרך `profileDepthsById`.
6. מזהי שילובים נשמרים קומפקטית ונפתרים להגדרה הקנונית בשכבת התצוגה.

חוסר עמדה ידנית, חוסר היסטוריית עונות או חוסר תשובות אימות אינם אמורים
למנוע פרופיל מספרי בסיסי. הם משפיעים על הקשר, ביטחון, מגמה ודחיפות.

## רשימת בדיקה לסוכן

לפני שינוי או אבחון יש לוודא:

1. שלשחקן יש Stats טעונים; `rosterStatus` אינו חסם לפרופיל אישי.
2. שקיימים `ageGroupId`,‏ `teamGamePlayed`,‏ `gameTime` ו־`leagueTotalRound`.
3. ש־`leagueLevel`,‏ `clubLevel` ו־`clubStrengthLevel` אינם חסרים.
4. ש־`goalsFor`,‏ `offense` ו־`defense` מגיעים מהליגה הקנונית.
5. ש־`seasonStatus` נכון, מפני שהוא משנה השלכה לעונה מלאה.
6. ש־`lineClassification` חושב לפני המרת הפרופיל.
7. שהפלט נקרא לפי שמות השדות שהמנוע מחזיר בפועל.
8. שאין נוסחה מקבילה ב־UI, ב־Audit או ב־projection.
