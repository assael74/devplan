<!-- src/features/hub/teamProfile/sharedLogic/players/insightsLogic/README.md -->

# מפת אחריות — Team Players Insights Logic

התיקייה הזו אחראית על בניית מודל תובנות שחקני הקבוצה עבור מגירת תובנות שחקנים בפרופיל קבוצה.

המטרה המרכזית היא לקחת את הדאטה המקומי של שחקני הקבוצה, להפעיל עליו לוגיקה מקצועית, לחבר מנועים גלובליים כשצריך, ולהחזיר מודל תצוגה נקי ל־UI.

---

# כלל שכבות

```txt
Domain      = חישובים מקצועיים ומצב גולמי
ViewModel   = הכנת דאטה להצגה
UI          = React, layout ואינטראקציה
````

בתיקייה הזו נמצאות שתי שכבות:

```txt
Domain
ViewModel
```

ה־UI עצמו נמצא כאן:

```txt
src/features/hub/teamProfile/sharedUi/insights/teamPlayers
```

---

# מבנה כללי

```txt
insightsLogic/
  alignment/
  common/
  performance/
  production/
  structure/
  targets/
  usage/
  viewModel/
    cards/
    common/
    takeaways/
    tooltips/
  data.js
  insights.logic.js
  model.js
```

---

# קבצים ראשיים בשורש

## model.js

אחריות:

* נקודת orchestration ראשית של מודל תובנות שחקני הקבוצה.
* מקבל `rows`, `summary`, `team`, `performanceScope`.
* מפעיל את בניית הדאטה המקצועי.
* מפעיל את בניית ביצועי השחקנים.
* מפעיל את שכבת ה־ViewModel.
* מחזיר מודל מלא אחד ל־hook של ה־UI.

מסלול עבודה:

```txt
rows + summary + team + scope
↓
domain data
↓
performance data
↓
view model
↓
final model for UI
```

תוצרים מרכזיים:

```txt
insights
structure
usage
production
alignment
flags
meta
playerPerformance
scopedPlayerPerformance
playerPerformanceRows
cards
summaryChips
takeaways
build
productionView
actions
```

---

## data.js

אחריות:

* בניית מודל הדאטה המקצועי המרכזי.
* מפעיל את מודלי הדומיין:

  * `structure`
  * `usage`
  * `production`
  * `alignment`
* מרכז את התוצרים למודל domain אחד.
* בונה `flags` מקצועיים לבדיקה.
* בונה `meta` בסיסי על מצב הדאטה.

תוצרים מרכזיים:

```txt
structure
usage
production
alignment
flags
meta
```

---

## insights.logic.js

אחריות:

* API קצר וברור לבניית תובנות שחקני קבוצה.
* משמש wrapper קריא מעל `data.js`.
* נותן שם מקצועי לפעולת הבנייה המרכזית.

פונקציה מרכזית:

```js
buildTeamPlayersInsights()
```

---

## index.js

אחריות:

* יצוא מסודר של שכבת `insightsLogic`.
* מאפשר imports קצרים ונקיים.
* מרכז exports של תיקיות המשנה והקבצים הראשיים.

---

# Domain Layer

שכבה זו אחראית על חישוב המצב המקצועי של הסגל.

---

## alignment/

אחריות:

* בדיקת פערים מקצועיים בין התכנון לבין המציאות.
* חיבור בין מבנה הסגל לבין שימוש בפועל.
* בדיקת התאמה בין מעמד שחקן לבין דקות / פתיחות.
* איתור שחקנים שמקבלים פחות מדי שימוש ביחס למעמד.
* איתור שחקנים שמקבלים יותר מדי שימוש ביחס למעמד.
* בדיקת הזדמנות לשחקני פרויקט.
* ניתוח עומס / חוסר בעמדות.
* ניתוח ריבוי שחקני מפתח באותה עמדה.
* בניית רשימות חריגה מקצועיות.

קבצים אפשריים:

```txt
alignment.model.js
index.js
```

תוצרים מרכזיים:

```txt
alignment.roleUsage
alignment.underUsedByRole
alignment.overUsedByRole
alignment.projectOpportunity
alignment.positionStructure
alignment.positionStructure.primary
alignment.positionStructure.coverage
```

שימושים עיקריים:

* זיהוי חריגות שדורשות בדיקה.
* הזנת `flags`.
* הזנת `takeaways`.
* הזנת כרטיסי סטטוס מקצועיים.

---

## common/

אחריות:

* helpers נמוכי־רמה שמשמשים את מודלי הדומיין.
* המרת ערכים למספרים.
* ניקוי טקסטים.
* עבודה בטוחה עם מערכים.
* חישוב אחוזים.
* פורמט טווחים.
* בניית reference אחיד לשחקן.
* שמירה על צורה אחידה של שחקן בתוך מודלי התובנות.

קבצים אפשריים:

```txt
insights.common.js
index.js
```

פונקציות מרכזיות:

```txt
safeArr
toNum
pct
pctText
clean
formatRange
buildPlayerRef
```

תוצר חשוב:

```js
{
  id,
  playerId,
  playerFullName,
  label,
  photo,
  squadRole,
  positionLabel,
  minutes,
  minutesPct,
  goals,
  assists,
  involvement
}
```

שימושים עיקריים:

* כל מודלי הדומיין.
* יצירת שחקנים אחידים ל־roles, positions, production, alignment.
* הפחתת כפילויות בין מודלים.

---

## performance/

אחריות:

* התאמה מקומית של מנוע ביצועי שחקנים גלובלי לתובנות שחקני קבוצה.
* סינון משחקי עונה.
* סינון משחקים לפי טווח נבחר.
* בחירת scope ביצועים.
* קריאה ל־`shared/players/insights`.
* בניית ביצועי שחקנים לעונה מלאה.
* בניית ביצועי שחקנים לטווח נבחר.
* מיזוג פרופיל עונתי עם מדדי טווח.
* בניית rows להצגת ביצועי שחקנים לפי scope.

קבצים אפשריים:

```txt
performanceScope.logic.js
perf.js
index.js
```

פונקציות מרכזיות:

```txt
getOrderedSeasonGames
getScopedGames
buildPlayerPerformance
mergeSeasonProfileWithScopedMetrics
buildPerf
```

תוצרים מרכזיים:

```txt
playerPerformance
scopedPlayerPerformance
playerPerformanceRows
```

שימושים עיקריים:

* אזור “שימוש ותפוקת הסגל”.
* בדיקת שינוי ביצועים בין עונה מלאה לבין טווח משחקים.
* הצגת פרופיל ביצוע אישי בתוך הקשר קבוצתי.

---

## production/

אחריות:

* ניתוח תפוקה מקצועית של שחקני הסגל.
* חישוב תרומה התקפית.
* חישוב שערים.
* חישוב בישולים.
* חישוב מעורבות בשערים.
* חישוב תרומה פר משחק.
* זיהוי שחקנים עם דקות גבוהות וללא תפוקה.
* זיהוי שחקנים עם דקות נמוכות ותפוקה גבוהה.
* הפרדת התייחסות בין שחקני התקפה לבין שחקני הגנה.
* בניית בסיס עתידי לניתוח תפוקה הגנתית.

קבצים אפשריים:

```txt
production.model.js
index.js
```

תוצרים מרכזיים:

```txt
production.players
production.attack
production.attack.contributors
production.attack.highMinutesNoProduction
production.attack.lowMinutesHighProduction
production.attack.goalsTotal
production.attack.assistsTotal
production.attack.involvementTotal
production.defense
production.defense.ready
production.defense.reason
```

שימושים עיקריים:

* כרטיסי תפוקה.
* תובנות על ריכוזיות התקפית.
* דגלים על שחקנים עם הרבה דקות וללא תרומה ישירה.
* בסיס עתידי להצלבת תפוקה עם מעמד ועמדה.

---

## structure/

אחריות:

* בניית תמונת מבנה הסגל.
* ספירת כלל השחקנים.
* ספירת שחקנים פעילים.
* ספירת שחקנים לא פעילים.
* בדיקת כיסוי מעמד.
* בדיקת כיסוי עמדה.
* בדיקת כיסוי עמדה ראשית.
* בדיקת כמות שחקנים עם נתוני משחקים.
* בניית התפלגות מעמדות.
* בניית התפלגות עמדות.
* בניית כיסוי עמדות לפי עמדה ראשית.
* בניית כיסוי עמדות לפי כל העמדות האפשריות.
* בניית שכבות עמדה.
* ניתוח שחקני פרויקט / מועמדים / סירוב / כלליים.
* חיבור ליעדי מבנה סגל.

קבצים אפשריים:

```txt
structure.model.js
index.js
```

תוצרים מרכזיים:

```txt
structure.squad
structure.roles
structure.positions
structure.positions.layers
structure.positions.primary
structure.positions.coverage
structure.positions.exact
structure.project
structure.targets
```

שימושים עיקריים:

* אזור “תהליך בניית הסגל”.
* כרטיסי מעמד.
* כרטיסי עמדה.
* תובנות על עומס / חוסר.
* בסיס ל־alignment.

---

## targets/

אחריות:

* בניית יעדי מבנה לשחקני הקבוצה.
* הגדרת טווחי יעד למעמדות.
* הגדרת טווחי יעד לעמדות.
* הערכת כמות בפועל מול טווח יעד.
* יצירת target model שמתאים ל־structure ול־alignment.
* חיבור בין גודל הסגל לבין יעדי כמות.

קבצים אפשריים:

```txt
targets.model.js
index.js
```

פונקציות מרכזיות:

```txt
buildTeamPlayersTargetsModel
evaluateCountTarget
evaluateRoleUsageTarget
```

תוצרים מרכזיים:

```txt
targets.roleStructure
targets.exactPositions
target.min
target.max
target.maxKey
evaluation.status
evaluation.tone
```

שימושים עיקריים:

* בדיקת מעמד מול יעד.
* בדיקת עמדה מול יעד.
* קביעת under / ok / over.
* בניית סטטוס לכרטיסים.

---

## usage/

אחריות:

* ניתוח שימוש בפועל בשחקני הסגל.
* חישוב דקות משחק.
* חישוב אחוז דקות.
* חישוב פתיחות בהרכב.
* חישוב אחוז פתיחות.
* בדיקת שימוש בפועל מול טווח מצופה לפי מעמד.
* בניית buckets לפי מעמד.
* זיהוי שחקנים בטווח תקין.
* זיהוי שחקנים מתחת לטווח.
* זיהוי שחקנים מעל הטווח.
* זיהוי שחקנים ללא דאטה.
* זיהוי שחקנים ללא מעמד.
* זיהוי שחקני סגל שלא שותפו.
* בניית רשימת action players לפי גודל הפער.

קבצים אפשריים:

```txt
usageAlignment.model.js
index.js
```

תוצרים מרכזיים:

```txt
usage.summary
usage.byRole
usage.players
usage.actionPlayers
usage.actualLineup
usage.underUsed
usage.overUsed
usage.squadButNotPlayed
usage.takeaway
```

שימושים עיקריים:

* אזור שימוש בפועל.
* תובנות על פער בין מעמד לדקות.
* כרטיסי שימוש.
* דגלים מקצועיים.

---

# ViewModel Layer

שכבה זו אחראית על תרגום מודלים מקצועיים למבנים שה־UI יודע להציג.

---

## viewModel/

אחריות:

* שכבת הכנה להצגה.
* איסוף תוצרים מ־domain.
* בניית cards.
* בניית takeaways.
* בניית details / tooltips.
* בניית מודלים ייעודיים לאזורי UI.
* שמירה על API נקי ל־`sharedUi`.

קבצים אפשריים:

```txt
teamPlayers.viewModel.js
axis.vm.js
index.js
```

פונקציות מרכזיות:

```txt
buildTeamPlayersViewModel
buildAxisTakeaway
```

תוצרים מרכזיים:

```txt
cards
summaryChips
takeaways
build
productionView
actions
```

---

## viewModel/cards/

אחריות:

* המרת domain models לכרטיסי UI.
* בניית כרטיסי תקציר.
* בניית כרטיסי מעמד.
* בניית כרטיסי עמדה.
* בניית כרטיסי פרויקט.
* בניית כרטיסי שימוש.
* בניית כרטיסי תפוקה.
* הוספת metadata להצגה:

  * label
  * value
  * sub
  * icon
  * color
  * status
  * rangeStatus
* העברת `players` לכרטיסים כאשר יש צורך ב־drilldown.
* העברת `tooltip` / details model לכרטיסים כאשר יש צורך בפירוט.

קבצים אפשריים:

```txt
structure.cards.js
role.cards.js
position.cards.js
project.cards.js
usage.cards.js
production.cards.js
index.js
```

מבנה card מומלץ:

```js
{
  id,
  label,
  value,
  valueRaw,
  count,
  pct,
  sub,
  icon,
  color,
  status,
  rangeStatus,
  minTarget,
  maxTarget,
  players,
  tooltip
}
```

שימושים עיקריים:

* `BuildLayout`
* `ProductionLayout`
* `SummarySection`
* `RolesSection`
* `PositionsSection`
* `UsageSection`
* `ProjectSection`

---

## viewModel/common/

אחריות:

* helpers של שכבת ViewModel.
* formatting להצגה.
* בניית טקסטים קצרים.
* נרמול צבעים.
* נרמול סטטוסים.
* עזרי תצוגה משותפים לכרטיסים, תובנות ופירוטים.
* מניעת כפילות בין card builders לבין takeaway builders.

קבצים אפשריים:

```txt
index.js
view.common.js
```

דוגמאות שימוש:

```txt
formatCardValue
resolveTone
resolveRangeStatus
formatTargetText
formatActualText
```

---

## viewModel/takeaways/

אחריות:

* בניית תובנות מילוליות.
* בניית מסקנות קצרות למשתמש.
* בניית action items.
* זיהוי הנקודה החשובה ביותר להצגה.
* ניסוח טקסטים מקצועיים להצגה.
* בניית תובנות לפי:

  * מבנה
  * פרויקט
  * שימוש
  * תפוקה
  * חריגים

קבצים אפשריים:

```txt
takeaways.model.js
index.js
```

תוצרים מרכזיים:

```txt
takeaways.structure
takeaways.project
takeaways.usage
takeaways.production
takeaways.flags
```

מבנה takeaway:

```js
{
  id,
  title,
  text,
  color,
  icon
}
```

שימושים עיקריים:

* אזורי המלצות.
* סיכום מצב.
* תובנות מהירות למנהל / מאמן / אנליסט.

---

## viewModel/tooltips/

אחריות:

* בניית מודל פירוט הסברתי לכרטיסים.
* בניית פירוט של בפועל מול יעד.
* בניית סטטוס מילולי.
* בניית בסיס חישוב.
* בניית רשימת שחקנים לפירוט.
* יצירת מודל שיכול להיות מוצג כ־tooltip, accordion details או אזור drilldown.

קבצים אפשריים:

```txt
tooltip.model.js
index.js
```

תוצרים מרכזיים:

```txt
tooltip.title
tooltip.actual
tooltip.target
tooltip.status
tooltip.basis
tooltip.listTitle
tooltip.players
tooltip.rows
```

שימושים עיקריים:

* פירוט מתחת לכרטיס נבחר.
* Takeaway details.
* הסבר מקצועי על מדדי כרטיס.
* הצגת שחקנים רלוונטיים לכרטיס.

---

## viewModel/axis.vm.js

אחריות:

* בניית ViewModel ייעודי לצירי הבנייה.
* קבלת card נבחר.
* זיהוי סוג הציר:

  * role
  * position
* בניית `Takeaway` לכרטיס הנבחר.
* ניסוח כותרת:

  * עומס
  * חוסר
  * תקין
* ניסוח summary קצר.
* בניית details:

  * בפועל
  * יעד
  * סטטוס
  * בסיס חישוב
  * משמעות מקצועית
  * פעולה מומלצת
* שמירה על תוכן מקצועי מחוץ ל־UI.

פונקציה מומלצת:

```js
buildAxisTakeaway({
  card,
  type,
})
```

תוצר מומלץ:

```js
{
  item: {
    id,
    actionLabel,
    text,
    tone
  },
  details: [
    {
      id,
      label,
      text
    }
  ]
}
```

שימושים עיקריים:

* `BuildLayout`
* פירוט כרטיס מעמד.
* פירוט כרטיס עמדה.
* drilldown לפי כרטיס נבחר.

---

# מסלול דאטה עיקרי

```txt
TeamPlayersInsightsContent
↓
useTeamPlayersInsightsModel
↓
model.js
↓
data.js
↓
structure / usage / production / alignment
↓
performance
↓
viewModel/cards
↓
viewModel/takeaways
↓
viewModel/tooltips
↓
sharedUi/insights/teamPlayers
```

---

# כלל החלטה מהיר

אם הקוד שואל:

```txt
מה המצב המקצועי?
כמה שחקנים?
מי השחקנים?
מה הפער?
מה הסטטוס?
```

המקום הוא:

```txt
Domain Layer
```

אם הקוד שואל:

```txt
איך להפוך את המצב לכרטיס?
איך לנסח תובנה?
איך להכין פירוט להצגה?
איזה icon / label / value להחזיר?
```

המקום הוא:

```txt
ViewModel Layer
```

אם הקוד שואל:

```txt
מה נבחר?
מה נפתח?
איזה קומפוננטה מוצגת?
איך מסדרים את זה במסך?
```

המקום הוא:

```txt
sharedUi
```

---

# עקרון תחזוקה

כל קובץ צריך לענות על שאלה אחת:

```txt
Domain:
מה המצב?

ViewModel:
איך מתארים את המצב?

UI:
איך מציגים ומאפשרים אינטראקציה?
```

---

# שמות קבצים מומלצים

שמות קצרים וברורים:

```txt
data.js
model.js
perf.js
axis.vm.js
role.cards.js
position.cards.js
takeaways.model.js
tooltip.model.js
```

---

# הערת עבודה

כאשר מתווסף אזור חדש למגירה:

1. קודם בונים domain model.
2. אחר כך בונים card / takeaway / details ב־ViewModel.
3. בסוף מחברים ל־UI.

הסדר הנכון:

```txt
Data first
ViewModel second
UI last
```

```
```
