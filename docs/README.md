# DevPlan Documentation Router

מסמך זה הוא נקודת הכניסה לתיעוד הפרויקט. אין לקרוא את כל תיקיית `docs`
בכל משימה; יש לבחור את המסמך לפי תחום העבודה.

## סדר סמכות

1. בקשת המשתמש וה־`AGENTS.md` החלים על נתיב העבודה.
2. חוזה תחומי פעיל הקרוב לקוד המשתנה.
3. מסמך ארכיטקטורה פעיל בתחום הרלוונטי.
4. הקוד הקנוני והבדיקות הקיימות.
5. מסמכי Draft, Legacy ו־Reference בלבד.

כאשר מסמך אינו תואם לקוד הקיים, אין להניח אוטומטית שהקוד או המסמך נכונים.
יש לזהות את הפער, לקבוע מהו המקור הקנוני ולדווח עליו לפני שינוי התנהגות.

## מצבי עבודה

- Codex עם repository חי: `AGENTS.md` והסקילים המקומיים מנתבים את העבודה.
- ChatGPT עם ZIP או snapshot: להשתמש ב־`onboarding/CHATGPT_ZIP_MODE.md`
  ולהגדיר את קטע ההפעלה פעם אחת ב־Project Instructions.

## נתב לפי תחום

| תחום | מסמך כניסה | מתי לקרוא |
|---|---|---|
| מבנה הפרויקט ומיקום קוד | `architecture/PROJECT_STRUCTURE.md` | קובץ חדש, מעבר שכבה, import או refactor מבני |
| Core Data | `architecture/CORE_DATA.md` | טעינה, enrichment, indexes, relations או `src/coreData` |
| סטטיסטיקה מתקדמת | `architecture/ADVANCED_STATS_PIPELINE.md` | יצירה, עדכון, מחיקה או צריכה של advanced stats |
| Live Tagging | `architecture/LIVE_TAGGING_STATS_PIPELINE.md` | אירועי Live, payload או חיבור למסלול הסטטיסטיקה |
| Scoring שחקן | `architecture/PLAYER_SCORING_MODEL.md` | מדדי וציון ביצוע של שחקן |
| Scoring קבוצה | `architecture/TEAM_SCORING_MODEL.md` | מדדי וציון ביצוע של קבוצה |
| Expectations | `architecture/TEAM_EXPECTATIONS_MODEL.md` | תרגום יעד עונתי לציפייה למשחק או רצף |
| Targets | `architecture/targets/README.md` | יעדים, benchmarks ונרמול |
| Scouting | `SCOUT_MODEL.md` | פילטרים, פרופילי חיפוש והתנהגות מוצר הסקאוט |
| Club Intelligence | `CLUB_INTELLIGENCE_ARCH.md` | read model, spotlights ותצוגות מועדון |
| Reports | `reports/reports-process.md` | יצירה, פרסום, גרסאות ו־Public URL של דוחות |
| Players Database | `../src/features/playersDatabase/md/README.md` | כל עבודה בפיצ'ר Players Database |

## מעמד המסמכים

- `ACTIVE`: מסמכי הארכיטקטורה והמודלים בטבלה, בכפוף לפערים המפורטים להלן.
- `DRAFT`: `SCOUT_MODEL.md`; המסמך מציין שהאפיון עדיין לא הושלם.
- `INCOMPLETE`: `reports/reports-process.md`; המסמך מסתיים באמצע דוגמה ואינו חוזה מלא.
- `LEGACY`: `onboarding/CHATGPT_CONTEXT.md`; נשמר כרקע, אך `AGENTS.md`, הסקילים והמסמך הנוכחי מחליפים את הוראות "לצרף לצ'אט".
- `LEGACY/ROLLBACK`: `architecture/targets/LEGACY_TARGETS_ROLLBACK.md`; לקרוא רק במשימת rollback או הסרת המנוע הישן.
- `REFERENCE ONLY`: `architecture/DEVPLAN_Architecture_Current_Detailed.docx`; אין להשתמש בו כמקור ראשון כשקיים Markdown פעיל.

## פערים ידועים

- `onboarding/CHATGPT_CONTEXT.md` מפנה למסמכים שאינם קיימים:
  `FIRESTORE_ROUTER.md`, `UI_PATTERNS.md` ו־`FUNCTIONS.md`.
- לפני הסתמכות על רשימות קבצים במסמך יש לוודא שהנתיבים עדיין קיימים.

## גבול מול Players Database

חוזי `src/features/playersDatabase/md` קובעים persistence, ownership,
lifecycle ו־Firestore של הפיצ'ר. מסמכי `docs` יכולים להגדיר מוצר, קריאה
ותצוגה, אך אינם עוקפים חוזה persistence תחומי פעיל.
