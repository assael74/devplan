// features/insightsHub/overview/data/overview.blocks.js

export const OVERVIEW_BLOCKS = [
  {
    id: 'facts',
    title: 'עובדות',
    subtitle: 'דאטה יבש שנאסף מהמערכת',
    text: 'לדוגמה: כמות משחקים, שערי זכות, דקות משחק, ניצחונות, שחקנים ששולבו.',
    iconId: 'data',
    color: 'neutral',
  },
  {
    id: 'metrics',
    title: 'מדדים',
    subtitle: 'חישוב על בסיס העובדות',
    text: 'לדוגמה: אחוז הצלחה, נקודות למשחק, אחוז דקות, ממוצע שערים.',
    iconId: 'performance',
    color: 'primary',
  },
  {
    id: 'insights',
    title: 'תובנות',
    subtitle: 'משמעות מקצועית מתוך המדדים',
    text: 'לדוגמה: מומנטום חיובי, קושי במשחקי חוץ, נפח דקות גבוה, ירידה בתרומה.',
    iconId: 'insights',
    color: 'success',
  },
  {
    id: 'reliability',
    title: 'מהימנות',
    subtitle: 'בדיקה האם אפשר לסמוך על התובנה',
    text: 'לדוגמה: האם יש מספיק משחקים, האם חסרים נתונים, האם המדגם קטן מדי.',
    iconId: 'shield',
    color: 'warning',
  },
]
