// src/features/videoHub/components/filters/filters.constants.js
export const MONTHS = [
  { v: '', l: 'כל החודשים' },
  { v: '1', l: 'ינואר' },
  { v: '2', l: 'פברואר' },
  { v: '3', l: 'מרץ' },
  { v: '4', l: 'אפריל' },
  { v: '5', l: 'מאי' },
  { v: '6', l: 'יוני' },
  { v: '7', l: 'יולי' },
  { v: '8', l: 'אוגוסט' },
  { v: '9', l: 'ספטמבר' },
  { v: '10', l: 'אוקטובר' },
  { v: '11', l: 'נובמבר' },
  { v: '12', l: 'דצמבר' },
]

export const SORT_OPTIONS = [
  { v: 'updatedAt', l: 'עודכן לאחרונה' },
  { v: 'createdAt', l: 'נוצר לאחרונה' },
  { v: 'meetingDate', l: 'תאריך פגישה' },
  { v: 'name', l: 'שם' },
]

export const SORT_DIR_OPTIONS = [
  { v: 'desc', l: 'יורד' },
  { v: 'asc', l: 'עולה' },
]

export const getSortLabel = (sortBy) => {
  if (sortBy === 'updatedAt') return 'עודכן לאחרונה'
  if (sortBy === 'createdAt') return 'נוצר לאחרונה'
  if (sortBy === 'meetingDate') return 'תאריך פגישה'
  return 'שם'
}
