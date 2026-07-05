// docs/CODEX_RULES.md
# כללי עבודה ל-Codex

מסמך זה מרכז את כללי העבודה, הכתיבה והארכיטקטורה שיש לשמור עליהם בפרויקט DevPlan.

ניתן להפנות למסמך זה לפני שינויי קוד, דוקומנטציה, UI או ארכיטקטורה.

## כללי עבודה

* לא לבקש אישור על כל שינוי.
* לאחר שהכיוון אושר, לבצע את השינוי בפועל ולא להישאר בשלב התכנון.
* לא לעצור את העבודה בגלל `build` ולא להתעכב על תקלות build שאינן קשורות ישירות למשימה.
* כאשר משתנים מודל, מבנה נתונים או לוגיקה מרכזית, לעדכן גם את הדוקומנטציה הרלוונטית.
* אין לשנות לוגיקה קיימת במסגרת סידור קוד, אלא אם התבקש תיקון לוגי מפורש.
* יש לשמור על שמות, חתימות ופלטים קיימים כאשר מבצעים רק ריפקטור או שינוי סגנון כתיבה.

## שמות ומבנה קבצים

* שמות קבצים יהיו קצרים ככל האפשר, אך עדיין ברורים ומייצגים את האחריות של הקובץ.
* בכל קובץ חדש יש לכתוב בשורה הראשונה הערה עם הנתיב המלא של הקובץ בפרויקט.

דוגמה:

```js
// src/features/playersDatabase/components/scan/ScanCenterPage.js
```

* אין ליצור קבצים קטנים ללא הצדקה.
* יש לפצל קובץ רק כאשר קיימת הפרדת אחריות ברורה.
* אין ליצור קובץ מגשר או קובץ `index` רק לצורך קיצור import, אלא אם יש לכך ערך ארכיטקטוני ברור.

## סגנון כתיבה רב־שורי מאוזן

יש לכתוב קוד בצורה רב־שורתית כאשר הדבר משפר קריאות, אך לא לפרק כל ביטוי או כל prop לשורה נפרדת.

המטרה היא לשמור על איזון בין:

* קריאות.
* קומפקטיות.
* יכולת סריקה מהירה של הקוד.
* קיפול תקין של פונקציות ובלוקים באדיטור.
* מניעת שורות ארוכות וצפופות מדי.

### העיקרון המרכזי

שורה קצרה וברורה נשארת בשורה אחת.

מבנה ארוך, מורכב או בעל מספר אחריויות מתפצל למספר שורות.

אין לבצע ירידות שורה אוטומטיות רק משום שמדובר באובייקט, פונקציה או JSX.

### אובייקטים קצרים

אובייקט קצר עם מעט שדות פשוטים יישאר בשורה אחת.

```js
const meta = { loading: false, error: '', rows: [] }
```

```js
title: { fontWeight: 700, mb: 0.5 },
```

אין צורך לכתוב כך:

```js
const meta = {
  loading: false,
  error: '',
  rows: [],
}
```

אלא אם האובייקט הוא חלק מבלוק שבו הפיצול משפר משמעותית את הקריאות.

### אובייקטים ארוכים

אובייקט עם מספר רב של שדות, ערכים מורכבים או אובייקטים פנימיים יתפצל.

```js
const patch = {
  positionLayer: clean(selectedLayer),
  primaryPosition: clean(selectedPosition),
  positions: clean(selectedPosition) ? [clean(selectedPosition)] : [],
}
```

באובייקטי `sx`, אובייקט קצר יכול להישאר בשורה אחת:

```js
meta: { color: palette.muted, mt: 0.25 },
```

אובייקט ארוך יתפצל:

```js
root: {
  minHeight: 0,
  overflow: 'auto',
  bgcolor: palette.panel,
  border: `1px solid ${palette.line}`,
  borderRadius: '8px',
  p: 1,
},
```

### פונקציות וקריאות פונקציה

קריאת פונקציה קצרה וברורה תישאר בשורה אחת.

```js
return createPlayerShorts({ draft: playerDraft })
```

```js
const profile = getPlayerProfileInfo(player)
```

```js
setSelectedId(profile.id)
```

קריאה עם אובייקט ארוך או מספר רב של פרמטרים תתפצל.

```js
const nextOpportunities = findPlayersDatabaseYearGroupOpportunities({
  leagues,
  snapshots: nextSnapshots,
})
```

פונקציות עם עד ארבעה props או פרמטרים פשוטים יישארו בשורה אחת ככל שהן קריאות.

```js
export function useScanPrintSelection(rowId, rows = []) {
```

```js
function Fact({ label, value }) {
```

כאשר רשימת הפרמטרים ארוכה או קשה לסריקה, יש לפצל:

```js
export default function ScanProfileRow({
  row,
  selected,
  expanded,
  selectedProfileIds = [],
  result,
  onSelect,
  onToggle,
  onToggleProfile,
  onLoadDocuments,
  onEditLink,
  onRemoveProfile,
}) {
```

### תנאים ו־ternary

תנאי קצר וברור יכול להישאר בשורה אחת.

```js
if (!profile) return null
```

```js
const color = selected ? 'primary' : 'neutral'
```

אין להשאיר ternary מקונן ארוך בשורה אחת.

במקום:

```js
const label = mode === 'league' ? 'ליגות' : mode === 'year' ? 'שנתונים' : 'סוג חיפוש'
```

עדיף:

```js
const getPrimaryLabel = mode => {
  if (mode === 'league') return 'ליגות'
  if (mode === 'year') return 'שנתונים'
  return 'סוג חיפוש'
}
```

או, כאשר הביטוי עדיין קצר וקריא:

```js
const label =
  mode === 'league'
    ? 'ליגות'
    : mode === 'year'
      ? 'שנתונים'
      : 'סוג חיפוש'
```

יש להעדיף פונקציה ברורה על פני ternary מקונן כאשר הלוגיקה חוזרת או מתרחבת.

### מערכים ושרשראות פעולות

מערך קצר יכול להישאר בשורה אחת.

```js
const MIDFIELD_LAYERS = ['atMidfield', 'midfield', 'dmMid']
```

שרשרת פעולות קצרה וברורה יכולה להישאר בשורה אחת.

```js
const ids = rows.map(row => row.id).filter(Boolean)
```

שרשרת ארוכה תתפצל לפי שלבים.

```js
const rows = Object.entries(profileCounts || {})
  .map(([profileId, count]) => ({
    profileId,
    label: getProfileLabel(profileId),
    count: Number(count) || 0,
  }))
  .filter(row => row.count > 0)
  .sort((a, b) => b.count - a.count)
```

### JSX

תגית JSX קצרה עם מעט props יכולה להישאר בשורה אחת.

```jsx
<Chip size="sm" color="neutral">{row.count}</Chip>
```

```jsx
<ScanCenterToolbar model={model} />
```

תגית עם מספר רב של props, callbacks או ערכים מורכבים תתפצל.

```jsx
<Button
  size="sm"
  variant="soft"
  color="neutral"
  disabled={saving}
  onClick={onClose}
>
  ביטול
</Button>
```

אין להשאיר JSX ארוך וצפוף בשורה אחת.

במקום:

```jsx
<ScanProfileRow key={row.id} row={row} selected={selected} expanded={expanded} onSelect={onSelect} onToggle={onToggle} />
```

יש לכתוב:

```jsx
<ScanProfileRow
  key={row.id}
  row={row}
  selected={selected}
  expanded={expanded}
  onSelect={onSelect}
  onToggle={onToggle}
/>
```

תוכן טקסט קצר בתוך קומפוננטה יכול להישאר באותה שורה:

```jsx
<Typography level="body-sm">{label}</Typography>
```

תוכן ארוך או ביטוי מורכב יתפצל:

```jsx
<Typography level="body-sm" sx={sx.meta}>
  בחירת פרופילים לפי שנתון, לפי ליגה, או הצגת כל החיתוכים הזמינים.
</Typography>
```

### callbacks

callback קצר יכול להישאר בשורה אחת.

```js
onClick={() => onSelect(row.id)}
```

callback עם יותר מפעולה אחת יתפצל לבלוק.

```js
onClick={event => {
  event.stopPropagation()
  onToggle(row)
}}
```

אין לכתוב מספר פקודות באותה שורה עם נקודה־פסיק.

לא תקין:

```js
onChange={() => { setOpen(false); setError('') }}
```

תקין:

```js
onChange={() => {
  setOpen(false)
  setError('')
}}
```

### return

אובייקט return קצר יכול להישאר בשורה אחת.

```js
return { loading, error, rows }
```

כאשר מוחזרים שדות רבים, יש לכתוב כל שדה בשורה נפרדת.

```js
return {
  loading,
  error,
  rows,
  selectedIds,
  loadDocuments,
  clearSelection,
  toggleSelection,
}
```

### קיפול באדיטור

יש לכתוב פונקציות, callbacks ובלוקים בצורה שמאפשרת קיפול תקין באדיטור Atom.

יש להימנע מפונקציות ארוכות שנכתבות כולן כביטוי אחד.

במקום:

```js
export const getRows = rows => rows.map(row => ({ ...row, active: true })).filter(row => row.id)
```

כאשר הלוגיקה מורכבת, יש להשתמש בבלוק:

```js
export const getRows = rows => {
  return rows
    .map(row => ({ ...row, active: true }))
    .filter(row => row.id)
}
```

פונקציה צריכה להיות יחידה ברורה שניתן לקפל ולזהות במהירות.

## שמירה על קריאות

* אין ליצור שורות ארוכות שקשה לסרוק.
* אין לבצע ירידות שורה מוגזמות שיוצרות קובץ ארוך ללא צורך.
* אין לשים כל prop בשורה חדשה כאשר התגית עדיין קצרה וברורה.
* אין לשים כל שדה של אובייקט בשורה חדשה כאשר מדובר באובייקט קטן.
* יש להוסיף שורה ריקה בין בלוקים לוגיים שונים.
* אין להוסיף שורה ריקה בין כל שתי שורות קוד.
* יש לשמור על סדר עקבי של imports, state, memo, effects, handlers ו־return.
* יש לתת עדיפות לקריאות על פני קיצור אגרסיבי.

## הפרדה ארכיטקטונית

יש לשמור על הפרדה בין `shared` לבין `features`.

### `shared`

מיועד ללוגיקה כללית, מודלים, מנועים, חישובים וחוקים שאינם שייכים למסך מסוים.

דוגמאות:

* מנועי סקאוט.
* חישובי ביצוע התקפי והגנתי.
* נרמול נתונים.
* חוקים ופרופילים.
* פונקציות עזר כלליות.
* מודלים שניתנים לשימוש חוזר.
* constants שאינם תלויים בפיצ'ר מסוים.

### `features`

מיועד למימוש של פיצ'ר או מסך מסוים.

דוגמאות:

* קומפוננטות UI.
* hooks של מסך.
* state מקומי.
* adapters המחברים בין מנועים לבין UI.
* עיצובי `sx`.
* אינטראקציות משתמש.
* לוגיקה התלויה ב־route או בתצוגה מסוימת.

## כלל מנחה

אם הלוגיקה יכולה לשמש יותר ממסך אחד, היא צריכה להיות ב־`shared`.

אם הקוד תלוי במסך, ב־UI, ב־route, ב־state מקומי או בחוויית משתמש נקודתית, הוא צריך להיות בתוך `features`.

כאשר יש ספק:

* לוגיקה עסקית כללית עוברת ל־`shared`.
* לוגיקת תצוגה נשארת בתוך `features`.
* אין להעביר קוד ל־`shared` רק כדי להקטין קובץ.
* אין להשאיר לוגיקה כללית בתוך קומפוננטת UI רק משום שהיא משמשת כרגע מסך אחד.

## כלל מסכם

הקוד צריך להיות:

* קריא.
* קומפקטי.
* רב־שורי במידה.
* מתקפל באדיטור.
* מחולק לפי אחריות.
* ללא ירידות שורה מיותרות.
* ללא שורות צפופות וארוכות מדי.
* ללא שינוי לוגיקה כאשר המשימה היא סידור קוד בלבד.
