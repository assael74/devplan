# DevPlan documentation router

זהו נתב למסמכי הפרויקט, לא רשימת קריאה קבועה. קוראים רק את המסמך שמשנה את
ההחלטות במשימה הנוכחית.

## סביבת עבודה

- קודקס עם מאגר חי: פועל לפי `AGENTS.md` והסקילים המקומיים.
- GPT עם קובץ ZIP: פועל לפי `onboarding/CHATGPT_ZIP_MODE.md` ואינו מניח גישה
  לקוד החי.

## סדר סמכות

1. בקשת המשתמש והוראות הסוכן המתאימות לסביבה.
2. חוזה התחום הקרוב לקוד המשתנה.
3. מסמך הארכיטקטורה הרלוונטי.
4. הקוד הקנוני והבדיקות הקיימות.

כאשר מסמך וקוד אינם תואמים, יש לזהות את הפער ולקבוע את מקור האמת לפני שינוי
התנהגות.

## נתב לפי תחום

| תחום | מסמך כניסה |
|---|---|
| מבנה הפרויקט ומיקום קוד | `architecture/PROJECT_STRUCTURE.md` |
| Core Data | `architecture/CORE_DATA.md` |
| ממשק, עיצוב ו־SX | `architecture/UI_PATTERNS.md` |
| שכבת Firestore הכללית | `architecture/FIRESTORE_ROUTER.md` |
| ציון שחקן | `architecture/PLAYER_SCORING_MODEL.md` |
| ציון קבוצה | `architecture/TEAM_SCORING_MODEL.md` |
| ציפיות קבוצה | `architecture/TEAM_EXPECTATIONS_MODEL.md` |
| יעדים | `architecture/targets/README.md` |
| סקאוט | `SCOUT_MODEL.md` |
| Club Intelligence | `CLUB_INTELLIGENCE_ARCH.md` |
| Players Database | `../src/features/playersDatabase/md/README.md` |

מסמך הסקאוט פעיל, אך סיווג הקווים ואיזון הקבוצה עדיין מתפתחים. מסמך החזרה
למנוע היעדים הישן נקרא רק במשימת החזרה או הסרת המנוע הישן.

חוזי `playersDatabase` קובעים את כללי השמירה והבעלות של הפיצ'ר ואינם נעקפים
על ידי מסמך כללי תחת `docs`.
