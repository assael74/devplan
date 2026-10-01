# Players Database documentation router

זהו נתב בלבד. אין לקרוא את כל המסמכים בכל משימה.

## סדר סמכות

1. `../AGENTS.md`
2. `architecture/DATA_ARCHITECTURE.md`
3. קטלוג המסמך הרלוונטי
4. חוזה הזרימה הרלוונטי
5. מסמכי Write V2, רק כאשר השינוי חוצה מספר זרימות

## בחירת מסמך

| משימה | מסמך |
|---|---|
| בעלות, מקור אמת או מבנה שמירה | `architecture/DATA_ARCHITECTURE.md` והקטלוג המתאים |
| League וביצועי קבוצה | `contracts/LEAGUE_CONTRACT.md` |
| Roster או Movement | `contracts/ROSTER_MOVEMENT_CONTRACT.md` |
| Stats Load | `contracts/STATS_LOAD_CONTRACT.md` |
| Team Balance או שמירת סקאוט | `contracts/TEAM_BALANCE_CONTRACT.md` |
| Audit או Repair | `contracts/AUDIT_REPAIR_CONTRACT.md` וחוזה הזרימה |
| ניקוי סגל או ליגה | ה־`README.md` הצמוד למסלול תחת `services/writeV2` |
| עריכת כתובת או חוקי תחרות | `contracts/STANDALONE_EDITS_CONTRACT.md` |
| עקרונות Write V2 חוצי זרימות | `architecture/WRITE_V2_ARCHITECTURE.md` |
| חוזה תפעולי Write V2 או Audit V2 | הסעיף המתאים ב־`plans/WRITE_V2_PLAN_UPDATED.md` |
| איפוס נקי | `runbooks/CLEAN_RESET_RUNBOOK.md` |
| יישור מידע ישן | `plans/LEGACY_DATA_ALIGNMENT_CHECKLIST.md` |

מסמכים שאינם פעילים אינם נשמרים בתיקיית ארכיון. היסטוריה נשמרת בגיט.
