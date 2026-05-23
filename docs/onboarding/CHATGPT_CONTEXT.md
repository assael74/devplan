# DevPlan — קובץ פתיחה לצ׳אט חדש

זה הקובץ הראשון שצריך לצרף בתחילת שיחה חדשה עם ChatGPT.

המטרה:
- להבין את שכבות הפרויקט
- לא לשכפל לוגיקה קיימת
- לדעת איזה קובץ הקשר נוסף לבקש
- לבקש רק קבצי קוד מינימליים
- לשמור על שמות קיימים של קבצים, פונקציות ותיקיות

שורש הפרויקט:

`C:\projects\devplan`

 01 — איך להשתמש בקובץ הזה

בתחילת צ׳אט חדש:

1. לצרף את הקובץ הזה.
2. להסביר בקצרה מה המשימה.
3. ChatGPT צריך לזהות את שכבת העבודה.
4. אם צריך, ChatGPT יבקש קובץ המשך מתוך `docs/context`.
5. רק אחרי קובץ ההמשך, לבקש קבצי קוד ספציפיים.

כלל חשוב:

לא מבקשים הרבה קבצי קוד לפני שמבינים את שכבת העבודה.


## 02 — מפת שכבות קצרה

 `src/services`

אזור עבודה ישירה מול Firestore, Storage, API clients וגישה חיצונית לדאטה.

רלוונטי כאשר המשימה קשורה ל:
- קריאה מ־Firestore
- כתיבה ל־Firestore
- Storage
- API/client wrappers
- שכבת גישה נמוכה לדאטה

אם המשימה קשורה לעדכון שדות, shorts, router maps או create/update/delete flows, לצרף:

`docs/context/FIRESTORE_ROUTER.md`


## `src/shared`

אזור החישובים והלוגיקה הגלובלית של הפרויקט.

כאן נמצאים חישובים, מודלים, utilities ומנועים שאינם שייכים למסך ספציפי.

רלוונטי כאשר המשימה קשורה ל:
- מנוע סקורינג שחקנים
- יעדי קבוצה
- יעדי שחקן
- חישובי משחקים גלובליים
- חישובי יכולות
- utilities משותפים
- domain logic כללי

אם המשימה קשורה ל־Efficiency Rating, TVA, TVA Delta, match score, season score או trend logic, לצרף:

`docs/context/PLAYER_SCORING_MODEL.md`

---

### `src/ui`

אזור קומפוננטות UI משותפות ותבניות UI כלליות.

זה אזור לתצוגה משותפת, לא להרכבת דאטה עסקי.

רלוונטי כאשר המשימה קשורה ל:
- קומפוננטות UI כלליות
- patterns
- filters
- sort controls
- drawers
- modals
- accordions
- print/report buttons
- sx משותף
- Joy UI conventions

אם המשימה קשורה ל־UI משותף או כללי עיצוב/סטיילינג, לצרף:

`docs/context/UI_PATTERNS.md`

---

### `src/app`

אזור מעטפת האפליקציה והחיבורים העליונים.

רלוונטי כאשר המשימה קשורה ל:
- layout ראשי
- routes
- providers
- auth/app wrappers
- חיבורי app כלליים

לא לשים כאן לוגיקה של פיצ׳ר ספציפי.

---

### `src/features`

אזור הפיצ׳רים והמסכים של המוצר.

רלוונטי כאשר המשימה קשורה ל:
- pages
- UI של פיצ׳ר
- sharedLogic של פיצ׳ר
- sharedUi של פיצ׳ר
- profile modules
- hubs
- view models מקומיים

הבחנה חשובה:

- `features/.../sharedLogic` = לוגיקה מקומית / view models של פיצ׳ר
- `features/.../sharedUi` = UI מקומי משותף לדסקטופ/מובייל
- חישובים גלובליים כבדים צריכים להיות ב־`src/shared`
- אובייקטים ראשיים מורכבים צריכים להגיע מ־`src/features/coreData`

אם המשימה קשורה לדאטה הגדול של האפליקציה, enriched players, teams, games, meetings, videos, payments, indexes או relations בין ישויות ראשיות, לצרף:

`docs/context/CORE_DATA.md`

אם המשימה קשורה למיקום קובץ, מבנה תיקיות, exports או import paths, לצרף:

`docs/context/PROJECT_STRUCTURE.md`

---

### `functions/src`

אזור Cloud Functions והלוגיקה בצד שרת.

רלוונטי כאשר המשימה קשורה ל:
- triggers
- backend services
- repositories
- server-side domain logic
- scheduled jobs
- Firestore backend workflows

אם המשימה קשורה ל־Cloud Functions או `functions/src`, לצרף:

`docs/context/FUNCTIONS.md`

---

## 03 — כלל החלטה לפי שכבה

לפני כתיבת קוד חדש, צריך לזהות לאיזו שכבה המשימה שייכת.

### גישה ל־Firestore / Storage / API

שייך ל:

`src/services`

---

### בניית האובייקטים הראשיים של האפליקציה

שייך ל:

`src/features/coreData`

---

### חישובים גלובליים ושימוש חוזר

שייך ל:

`src/shared`

---

### View model מקומי של פיצ׳ר

שייך ל:

`src/features/**/sharedLogic`

---

### UI מקומי משותף של פיצ׳ר

שייך ל:

`src/features/**/sharedUi`

---

### UI גלובלי משותף

שייך ל:

`src/ui`


### מעטפת אפליקציה / providers / routes

שייך ל:

`src/app`


### Backend functions

שייך ל:

`functions/src`


## 04 — קבצי הקשר להמשך

### Core Data

לצרף:

`docs/context/CORE_DATA.md`

כאשר המשימה קשורה ל:
- האובייקטים הראשיים של האפליקציה
- enriched players
- enriched teams
- games
- meetings
- videos
- payments
- indexes/maps
- relations בין ישויות
- חיבור דאטה מפיירסטור לאובייקטים גדולים
- `src/features/coreData`

### Player Scoring Model

לצרף:

`docs/context/PLAYER_SCORING_MODEL.md`

כאשר המשימה קשורה ל:
- Efficiency Rating
- TVA
- TVA Delta
- match score
- ציון שחקן במשחק
- טרנד שחקן לאורך משחקים
- ציון עונתי
- scoring scope
- scoring engine תחת `src/shared/players/scoring`


### Project Structure

לצרף:

`docs/context/PROJECT_STRUCTURE.md`

כאשר המשימה קשורה ל:
- איפה למקם קובץ חדש
- ריפקטור תיקיות
- import paths
- index files
- shared מול local logic
- naming conventions
- העברת קוד בין שכבות


### UI Patterns

לצרף:

`docs/context/UI_PATTERNS.md`

כאשר המשימה קשורה ל:
- UI משותף
- Joy UI
- sx files
- drawers
- modals
- accordions
- filters
- sort menus
- print/report buttons
- patterns תחת `src/ui`


### Firestore Router

לצרף:

`docs/context/FIRESTORE_ROUTER.md`

כאשר המשימה קשורה ל:
- create/update/delete flows
- field patches
- shorts update
- router maps
- Firestore write paths
- entity lifecycle
- מחיקה/עדכון תמונות
- כתיבה מפוצלת למסמכי shorts


### Functions

לצרף:

`docs/context/FUNCTIONS.md`

כאשר המשימה קשורה ל:
- `functions/src`
- Cloud Functions
- Firestore triggers
- backend services
- repositories
- scheduled jobs
- server-side workflows

---

## 05 — פרוטוקול עבודה לצ׳אט חדש

בתחילת שיחה חדשה ChatGPT צריך:

1. לקרוא את הקובץ הזה קודם.
2. לזהות לאיזו שכבה בפרויקט המשימה שייכת.
3. לבקש את קובץ ההקשר המשלים המתאים.
4. רק לאחר מכן לבקש את קבצי הקוד המינימליים.
5. לא להמציא פונקציות או קבצים לפני בדיקה אם קיים קונספט דומה.
6. לשמור על שמות קיימים של קבצים, פונקציות ותיקיות.
7. להעדיף הרחבת לוגיקה קיימת על פני יצירת לוגיקה מקבילה.
8. לשמור הפרדה בין UI, view models, חישובים גלובליים, coreData, services ו־backend.

---

## 06 — כללים נגד כפילויות

לפני יצירת קובץ חדש, פונקציה חדשה או שכבת לוגיקה חדשה, לבדוק:

1. האם זה כבר קיים ב־`src/shared`?
2. האם זה כבר קיים ב־`src/features/coreData`?
3. האם זה כבר קיים ב־`features/**/sharedLogic`?
4. האם זה רק UI שצריך להיות ב־`sharedUi` או `src/ui`?
5. האם צריך להרחיב קובץ קיים במקום ליצור מקביל חדש?

לא ליצור שמות חדשים לקונספטים שכבר קיימים בפרויקט.

---

## 07 — מטרת העל

לייצר המשכיות בין צ׳אטים.

ChatGPT לא אמור להתחיל את הארכיטקטורה מאפס בכל שיחה חדשה.

הוא אמור:
- להבין את מבנה הפרויקט
- לבקש את קובץ ההקשר הנכון
- להימנע מכפילויות
- לשמור על שמות וקונספטים קיימים
- לבקש רק את קבצי הקוד שבאמת צריך
