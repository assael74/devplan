// src/features/playersDatabase/ui/pages/DataOpsPage/dataOps.mock.js

export const DATA_OPS_TABS = [
  { id: 'overview', label: 'מצב כללי', iconId: 'dashboard' },
  { id: 'entity', label: 'סנכרון ישות', iconId: 'search' },
  { id: 'collection', label: 'קולקשיין', iconId: 'dataShow' },
  { id: 'receipts', label: 'תיקון קבלות', iconId: 'report' },
  { id: 'maintenance', label: 'ניקוי ותחזוקה', iconId: 'reset' },
]

export const DATA_OPS_SUMMARY = [
  { id: 'lastAudit', label: 'בדיקה אחרונה', value: 'לפני 12 דקות', tone: 'success' },
  { id: 'openFindings', label: 'פערים פתוחים', value: '7', tone: 'warning' },
  { id: 'openReceipts', label: 'קבלות פתוחות', value: '3', tone: 'neutral' },
  { id: 'approval', label: 'ממתינים לאישור', value: '2', tone: 'danger' },
]

export const ENTITY_FINDINGS = [
  {
    id: 'team-stats',
    source: 'מקור קנוני',
    title: 'נתוני Stats בעונת הקבוצה אינם מלאים',
    detail: 'Team Season · 2026/27 · הנתונים המסכמים אינם תואמים לשחקנים',
    severity: 'danger',
    severityLabel: 'דורש פעולה עסקית',
    action: 'בנייה מחדש של סיכום העונה',
    documents: ['teamSeason', 'teamSearchIndex', 'clubAgeGroupSeason'],
  },
  {
    id: 'search-index',
    source: 'תוצרים נגזרים',
    title: 'אינדקס החיפוש אינו מעודכן',
    detail: 'Player Search Index · שלושה שחקנים חסרים בתוצאת החיפוש',
    severity: 'warning',
    severityLabel: 'תיקון בטוח',
    action: 'רענון אינדקס החיפוש',
    documents: ['playerSearchIndex × 3'],
  },
]

export const DATABASE_AREAS = [
  { id: 'relations', label: 'קשרים בין ישויות', value: '2 פערים', tone: 'warning' },
  { id: 'projections', label: 'אינדקסים ותוצרים', value: '5 פערים', tone: 'danger' },
  { id: 'receipts', label: 'קבלות ביצוע', value: '3 פתוחות', tone: 'neutral' },
  { id: 'lifecycle', label: 'מחזור חיים', value: 'תקין', tone: 'success' },
]

export const COLLECTION_ROWS = [
  { label: 'מסמכים שנבדקו', value: '1,284' },
  { label: 'מסמכים חסרים', value: '3' },
  { label: 'מסמכים יתומים', value: '1' },
  { label: 'קשרים לא תקינים', value: '2' },
]

export const MAINTENANCE_ACTIONS = [
  {
    id: 'clubsBootstrap',
    title: 'יצירת מועדונים מחדש',
    description: 'בניית מסמכי המועדונים והספרייה מתוך הקטלוג הפנימי.',
    iconId: 'clubs',
    tone: 'info',
  },
  {
    id: 'indexes',
    title: 'בנייה מחדש של אינדקסים',
    description: 'יצירה מחודשת של תוצרי חיפוש מתוך המקורות הקנוניים.',
    iconId: 'dataShow',
    tone: 'info',
  },
  {
    id: 'orphans',
    title: 'איתור מסמכים יתומים',
    description: 'בדיקה לקריאה בלבד של מסמכים ללא קשר תקין לישות מקור.',
    iconId: 'search',
    tone: 'warning',
  },
  {
    id: 'cleanup',
    title: 'ניקוי נתונים',
    description: 'פעולת כתיבה מוגנת שתדרוש תצוגה מקדימה ואישור מפורש.',
    iconId: 'delete',
    tone: 'danger',
  },
]
