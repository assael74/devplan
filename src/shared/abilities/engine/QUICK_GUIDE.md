# Abilities Engine — Quick Guide

מנוע היכולות מחולק לשכבות ברורות כדי להפריד בין חישוב, היסטוריה וכתיבה למסד.

## קבצים בתיקיית `engine`

- `abilitiesHistory.constants.js`  
  כל הקבועים העסקיים: משקלים, ספים, תיקוני `growthStage`, גודל חלון הערכה.

- `abilitiesHistory.utils.js`  
  פונקציות עזר כלליות: המרות, עיגולים, בדיקות ערכים, ותאריכים בסיסיים.

- `abilitiesHistory.dates.js`  
  קובע לאיזה `windowKey` כל טופס שייך לפי `evalDate`.

- `abilitiesHistory.forms.js`  
  מנרמל טפסים חדשים וישנים לצורה אחידה.

- `abilitiesHistory.windows.js`  
  מאחד טפסים בתוך אותו חלון, וממזג בין חלונות לפי 30% ישן ו־70% חדש.

- `abilitiesHistory.scoring.js`  
  מחשב דומיינים, יכולת, פוטנציאל, כיסוי ומהימנות.

## שכבת Firestore

- `abilitiesUpsertHistory.js`  
  שולף טפסים מ־`abilitiesShorts`, מריץ חישוב מחדש, ושומר:
  - raw forms + windows ב־`abilitiesShorts`
  - תוצאה סופית ב־`playersShorts.playersAbilities`

## עיקרון חשוב

- `abilitiesShorts.formsAbilities` = מקור האמת
- `playersShorts.playersAbilities` = פלט מחושב

החישוב לא נשען על `playersAbilities`, אלא תמיד על כלל הטפסים.

## זרימה מלאה

1. טופס חדש נכנס
2. הטופס מנורמל
3. נקבע חלון הערכה
4. הטפסים מקובצים לפי חלונות
5. באותו חלון מתבצע ממוצע בין מעריכים
6. בין חלונות מתבצע מיזוג היסטורי
7. מחושבים יכולת, פוטנציאל ומהימנות
8. התוצאה נשמרת למסד

## מתי לעדכן כל קובץ

- שינוי משקלים / ספים → `constants`
- שינוי חלונות הערכה → `dates`
- שינוי shape של טופס → `forms`
- שינוי מיזוג היסטורי → `windows`
- שינוי נוסחאות ציון / פוטנציאל / מהימנות → `scoring`
- שינוי write flow למסד → `abilitiesUpsertHistory`
