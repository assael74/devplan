# Roster and Movement Contract

## אחריות Roster Load

Roster Load כותב את Team Season snapshot, את הסגל, את מצב התנועה ואת
מטא־דאטת הסגל. הוא משמר Team Performance קנוני ואינו יוצר Player Documents,
Stats או Scout Profiles רק בגלל שחקן בסגל.

## סדר הכתיבה והקבלה

טעינת סגל מפעילה בלחיצה אחת את השלבים הבאים לפי הסדר:

```text
canonical → counterparts → playerSeasons → playerSearchIndexes
→ leagueProjection → leaguesCenter → clubsCenter → audit
```

כל שלב שהושלם מתועד מיד באותה קבלת `dbWriteActions`. הממשק מציג את מצב
השלבים מן הקבלה ואינו מציג כפתור כתיבה נפרד לכל collection.

אם `canonical` טרם אושר, ניסיון חוזר רשאי לקרוא מקורות טריים, לבנות מצב
מאושר חדש ולהמשיך עם אותה קבלה. אם `canonicalOutcome === 'confirmed'`, אין
לפתוח מחדש את הקבלה ואין לכתוב שוב את מקור האמת; הפעולה הבאה היא תיקון
תוצרים בלבד באמצעות `repairWriteActionReceipt`.

בתיקון `rosterLoad`, עדכוני `counterparts` נבנים מחדש רק מעובדות Movement
קנוניות שב־Team Season וממסמכי Team Season מקבילים שקיימים בפועל. אין ליצור
מסמך קבוצה חסר ואין להסיק תנועה לפי שם או לפי תוצר חיפוש.

## Snapshot

כל import נושא:

- `mode`:‏ `AUTHORITATIVE_SNAPSHOT` או `PATCH`.
- `sourceSnapshotKey`: מזהה snapshot מהמקור, או fallback דטרמיניסטי.
- `contentHash`: לזיהוי reload זהה בלבד.
- `effectiveAt`: רק כאשר המקור מספק זמן אמין.

שינוי מפתח לבדו אינו מוכיח תנועה. ללא סדר מקור או זמן אמין, התזמון נשאר
`UNKNOWN`.

## Movement

- `transfersIn` ו־`transfersOut` הם עובדות קנוניות של Team Season.
- `pendingPlayers` מכיל היעדרויות פתוחות ולא פתורות בלבד.
- counterpart נכתב אוטומטית רק כאשר Team Season המקביל כבר קיים.
- אין ליצור Team Root או Team Season כדי להשלים counterpart.
- `unknown` הוא החלטה ידנית שהושלמה והופכת את השחקן ל־`pendingPlayers`, בלי
  להמציא תנועה.
- `joined` בלבד יוצר `transfersIn`;‏ `priorAgeException` ו־`confirmedInRoster`
  אינם יוצרים תנועה.

`teamPlayers` כולל גם משתתף שעזב אחרי שצבר Stats. `rosterStatus` הוא מצב
חברות בלבד: `regular`,‏ `left` או `youngerAgeGroup`.

## תחומי ספירה

Current Roster,‏ `playersCount`,‏ Team Balance, מבנה הקווים ו־scout summary
כוללים `regular` בלבד. SearchIndex הוא projection ואינו מקור Movement.
