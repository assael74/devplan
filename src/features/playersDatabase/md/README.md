# Players Database Documentation

## מסמך כניסה

זהו האינדקס המרכזי לתיעוד של `playersDatabase`. יש להבחין בין מסמכי חובה,
חוזי זרימה, תוכנית המימוש ומסמכי רקע.

## סדר סמכות

1. `AGENTS.md` — כללי עבודה.
2. `architecture/DATA_ARCHITECTURE.md` — בעלות, משמעות ומקורות אמת.
3. `catalog/firestoreDocuments` — מבנה מסמכי Firestore.
4. `contracts/*` — חוזה הזרימה או התחום הרלוונטי.
5. `architecture/WRITE_V2_ARCHITECTURE.md` — עקרונות שכבת Write V2.
6. `plans/WRITE_V2_PLAN_UPDATED.md` — תוכנית העבודה הקנונית של Write V2, Audit V2 ו-Reconcile V2.
7. `runbooks/*` — הוראות הפעלה ובדיקות.

בסתירה בין מסמך יציב לבין תוכנית המיגרציה, תוכנית V2 גוברת רק עבור זרימת
V2 שהיא מגדירה במפורש. היא אינה מבטלת חוזים עסקיים של זרימות שטרם היגרו.

## מסמכים פעילים

- [ארכיטקטורת נתונים](./architecture/DATA_ARCHITECTURE.md)
- [ארכיטקטורת Write V2](./architecture/WRITE_V2_ARCHITECTURE.md)
- [מפת הדרך הקנונית של Write V2, Audit V2 ו-Reconcile V2](./plans/WRITE_V2_PLAN_UPDATED.md)
- [חוזה League](./contracts/LEAGUE_CONTRACT.md)
- [חוזה Roster ו־Movement](./contracts/ROSTER_MOVEMENT_CONTRACT.md)
- [חוזה Stats Load](./contracts/STATS_LOAD_CONTRACT.md)
- [חוזה Team Balance](./contracts/TEAM_BALANCE_CONTRACT.md)
- [חוזה Audit ו־Repair](./contracts/AUDIT_REPAIR_CONTRACT.md)
- [Runbook איפוס נקי](./runbooks/CLEAN_RESET_RUNBOOK.md)

## מסמכי Legacy

המסמכים הישנים נשמרים זמנית בתיקיית המקור לצורך תאימות והיסטוריה. אין להוסיף
בהם החלטות חדשות. מסמכי יעד ותקלות שאינם רלוונטיים נשמרים תחת `archive/`.
תוכנית העבודה הפעילה עבור Write V2, Audit V2 ו-Reconcile V2 היא
plans/WRITE_V2_PLAN_UPDATED.md.
