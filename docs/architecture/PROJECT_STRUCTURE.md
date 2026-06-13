# Project Structure - מבנה שכבות בפרויקט

מסמך זה מסביר בקצרה איפה למקם קוד ותיעוד בפרויקט DevPlan.

---

## שורש הפרויקט

```txt
C:\projects\devplan
```

התיקיות המרכזיות:

```txt
src/
functions/
docs/
public/
build/
```

---

## src/app

מעטפת האפליקציה:

- providers
- routes
- auth wrapper
- layout shell
- חיבורי אפליקציה עליונים

דוגמאות:

- `src/app/App.js`
- `src/app/AuthProvider.js`
- `src/app/routes/AppRoutes.js`
- `src/app/providers.js`

כלל חשוב:

לוגיקה של פיצ'ר לא אמורה לגור כאן. כאן שמים חיבורים רוחביים בלבד.

סדר providers חשוב:

```txt
AuthProvider
-> CoreDataProvider
-> BrowserRouter
-> feature/global providers
-> AppRoutes
```

CoreData תלוי ב־Auth ולכן הוא צריך לשבת מתחת ל־`AuthProvider`.

---

## src/features

פיצ'רים ומסכים של המוצר.

דוגמאות:

- `src/features/home`
- `src/features/hub`
- `src/features/videoHub`
- `src/features/calendarHub`
- `src/features/squadSimulator`
- `src/features/coreData`

בתוך פיצ'ר מקובל להשתמש בחלוקה:

```txt
ui/
components/
sharedLogic/
sharedUi/
hooks/
logic/
```

השם המדויק תלוי בפיצ'ר הקיים. עדיף להמשיך דפוס קיים מאשר להמציא מבנה חדש.

---

## src/features/coreData

שכבת הרכבת הדאטה המרכזית של האפליקציה.

כאן מחברים Firestore shorts לאובייקטים עשירים:

- clubs
- teams
- players
- meetings
- payments
- games
- videos
- roles

לפרטים מלאים:

```txt
docs/architecture/CORE_DATA.md
```

כלל חשוב:

אובייקטים ראשיים מורכבים צריכים להיבנות כאן ולא בתוך מסך ספציפי.

---

## src/services

גישה נמוכה לנתונים ושירותים חיצוניים:

- Firebase
- Firestore refs
- Firestore update routers
- Storage
- API clients

דוגמאות:

- `src/services/firebase`
- `src/services/firestore`
- `src/services/auth`

כלל חשוב:

`services` לא אמור לדעת איך מסך מציג נתונים. הוא רק קורא, כותב או מעדכן.

---

## src/shared

לוגיקה גלובלית שאינה שייכת למסך אחד:

- scoring models
- target models
- utilities
- domain calculations
- access logic

אם חישוב נדרש ביותר מפיצ'ר אחד, הוא לרוב שייך ל־`src/shared`.

---

## src/ui

קומפוננטות UI ותבניות משותפות:

- layout components
- fields
- modals
- drawers
- cards
- shared sx
- icons/theme helpers

כלל חשוב:

`src/ui` לא אמור להרכיב דאטה עסקי גדול. הוא מקבל props מוכנים.

---

## functions

Cloud Functions וצד שרת.

כאן שייכים:

- triggers
- scheduled jobs
- repositories server-side
- backend workflows

---

## docs

תיקיית ידע ארכיטקטוני והמשכיות עבודה.

התפקיד שלה הוא לא תיעוד משתמש רגיל, אלא זיכרון הנדסי לפרויקט:

- איך השכבות מחולקות
- מה החוזים בין שכבות
- איזה מודלים קיימים
- איך להדריך צ'אט חדש לא לשכפל לוגיקה

מסמכים מרכזיים:

```txt
docs/onboarding/CHATGPT_CONTEXT.md
docs/architecture/CORE_DATA.md
docs/architecture/PROJECT_STRUCTURE.md
docs/architecture/ADVANCED_STATS_PIPELINE.md
docs/architecture/LIVE_TAGGING_STATS_PIPELINE.md
docs/architecture/PLAYER_SCORING_MODEL.md
docs/architecture/TEAM_SCORING_MODEL.md
docs/architecture/targets/
```

---

## כלל החלטה מהיר

כאשר מוסיפים קוד חדש:

1. קריאה/כתיבה ל־Firestore?  
   `src/services`

2. הרכבת אובייקטים ראשיים של האפליקציה?  
   `src/features/coreData`

3. חישוב גלובלי או מודל עסקי רוחבי?  
   `src/shared`

4. View model מקומי של מסך/פיצ'ר?  
   `src/features/<feature>/sharedLogic` או `logic`

5. UI משותף לכל האפליקציה?  
   `src/ui`

6. UI ייחודי לפיצ'ר?  
   `src/features/<feature>/components` או `sharedUi`

7. מעטפת, providers, routes?  
   `src/app`

8. תהליך צד שרת?  
   `functions`
