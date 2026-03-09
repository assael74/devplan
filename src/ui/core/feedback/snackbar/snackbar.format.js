// src/ui/snackbar/snackbar.format.js
import { SNACK_ACTION, SNACK_STATUS } from './snackbar.model.js'
import { getEntityColors } from '../../theme/Colors.js'

const ENTITY_LABELS = {
  player: 'שחקן',
  team: 'קבוצה',
  club: 'מועדון',
  meeting: 'פגישה',
  payment: 'תשלום',
  video: 'וידאו',
}

const ACTION_LABELS = {
  create: 'הוספה',
  update: 'עדכון',
  delete: 'מחיקה',
}

const ACTION_IDICON = {
  create: 'add',
  update: 'update',
  delete: 'delete',
}

const ACTION_COLOR = {
  create: 'primary',
  update: 'warning',
  delete: 'danger',
}

export const getEntityLabel = (entityType) => ENTITY_LABELS[entityType] || 'אובייקט'
export const getActionLabel = (action) => ACTION_LABELS[action] || 'פעולה'
export const getActionIdIcon = (action) => ACTION_IDICON[action] || 'פעולה'
export const getActionColor = (action) => ACTION_COLOR[action] || 'neutral'
export const getEntityColor = (entityType) => getEntityColors(entityType).bg  || 'neutral'

export const buildTitle = (status) =>
  status === SNACK_STATUS.SUCCESS ? 'בוצע בהצלחה' : status === SNACK_STATUS.ERROR ? 'שגיאה' : ''

export const buildMainLine = ({ status, action, entityType, entityName }) => {
  const e = getEntityLabel(entityType)
  const name = entityName ? ` "${entityName}"` : ''

  if (status === SNACK_STATUS.SUCCESS) {
    if (action === SNACK_ACTION.CREATE) return `${e}${name} נוסף בהצלחה`
    if (action === SNACK_ACTION.UPDATE) return `${e}${name} עודכן בהצלחה`
    if (action === SNACK_ACTION.DELETE) return `${e}${name} נמחק בהצלחה`
    return `הפעולה בוצעה בהצלחה`
  }

  if (status === SNACK_STATUS.ERROR) {
    if (action === SNACK_ACTION.CREATE) return `שגיאה בהוספת ${e}${name}`
    if (action === SNACK_ACTION.UPDATE) return `שגיאה בעדכון ${e}${name}`
    if (action === SNACK_ACTION.DELETE) return `שגיאה במחיקת ${e}${name}`
    return `שגיאה בביצוע הפעולה`
  }

  return ''
}

export const mapFirestoreErrorToDetails = (err) => {
  const code = err?.code || err?.name || ''
  if (!code) return 'משהו השתבש. נסה שוב'

  if (String(code).includes('permission-denied')) return 'אין הרשאה לביצוע הפעולה'
  if (String(code).includes('unavailable')) return 'בעיית תקשורת זמנית. נסה שוב'
  if (String(code).includes('not-found')) return 'המסמך לא נמצא'
  if (String(code).includes('already-exists')) return 'הפריט כבר קיים'
  if (String(code).includes('failed-precondition')) return 'תנאי מקדים לא מתקיים'
  if (String(code).includes('invalid-argument')) return 'נתונים לא תקינים'

  return err?.message ? String(err.message) : 'משהו השתבש. נסה שוב'
}

export const buildDedupeKey = ({ status, action, entityType, entityName, message, details }) => {
  // מפתח יציב כדי למנוע כפילויות קצרות
  return [
    status || '',
    action || '',
    entityType || '',
    entityName || '',
    message || '',
    details || '',
  ].join('|')
}
