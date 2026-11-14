# Legacy Targets Rollback

> **הנחת עבודה מחייבת:** DevPlan היא מערכת למשתמש אחד, המבצע בכל רגע תהליך כתיבה עיקרי אחד.
> כל הסוכנים חייבים להתבסס על כך בתכנון, במימוש ובביקורת, תוך שמירה על אימות נתונים, כתיבות אטומיות והגנה מפני כתיבה חלקית.

מסמך זה מתאר את מדיניות rollback למנוע היעדים הישן.

## רקע

לפני מודל הבנצ'מרק החדש, יעדי שחקן חושבו במנוע:

```txt
src/shared/players/targets/playerExplicitTargets.js
```

המנוע הישן חישב יעדים בעיקר כאחוז משערי הקבוצה לפי:

```txt
role
position layer
team profile
```

## המצב החדש

ברירת המחדל היא:

```txt
src/shared/players/targets/playerTargets.benchmark.js
```

החיבור הפעיל:

```txt
src/shared/players/targets/playerDerivedTargets.js
```

## אין fallback אוטומטי

כשאי אפשר לבנות יעדי benchmark, בחירת המנוע הראשי נשארת במסלול הבנצ'מרק.

הסטטוס יהיה:

```txt
targetSource: 'benchmarkUnavailable'
```

כאשר הבנצ'מרק זמין, `playerDerivedTargets.js` עדיין יכול להשלים שדות
עזר ממודל היעדים הישן, למשל טווח ספיגות חסר. בחירה מפורשת במנוע הישן
מכריעה איזה מודל מספק את היעדים הראשיים.

## שמירת זיכרון

המנוע הישן עדיין מחושב ונשמר תחת:

```txt
legacyExplicitTargets
```

מטרות:

```txt
השוואה
בדיקות
rollback
איתור פערים
```

## הפעלת legacy במפורש

אפשר להפעיל את המנוע הישן באמצעות:

```js
{
  useLegacyTargets: true
}
```

או:

```js
{
  targetEngine: 'legacy'
}
```

או:

```js
{
  targetsEngine: 'legacy'
}
```

אפשר להגדיר זאת על:

```txt
player
team
```

## בדיקות צפויות

מצב benchmark תקין:

```js
{
  targetSource: 'benchmark',
  hasTargets: true
}
```

מצב חסר:

```js
{
  targetSource: 'benchmarkUnavailable',
  hasTargets: false,
  legacyExplicitTargets: {}
}
```

מצב rollback מפורש:

```js
{
  targetSource: 'legacy',
  hasTargets: true
}
```

## מתי למחוק את המנוע הישן

לא למחוק עד שיתקיימו כל התנאים:

```txt
כל מסכי שחקן מציגים יעדים תקינים
כל שורות שחקני קבוצה מציגות יעדים תקינים
scoring צורך את מבנה היעדים החדש
insights drawer ו-tooltips אינם תלויים בשדות legacy בלבד
קיימת בדיקת regression בסיסית
```

לאחר מכן ניתן למחוק או להעביר לארכיון את:

```txt
playerExplicitTargets.js
```
