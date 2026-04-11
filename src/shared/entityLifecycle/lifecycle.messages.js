// shared/entityLifecycle/lifecycle.messages.js
const ENTITY_LABEL = {
  player: 'שחקן',
  team: 'קבוצה',
  club: 'מועדון',
  role: 'איש צוות',
  scouting: 'שחקן במעקב',
  tag: 'וידאו תג',
  game: 'משחק',
  videoAnalysis: 'ניתוח וידאו',
  videoGeneral: 'וידאו כללי',
  task: 'משימה'
}

const ACTION_LABEL = {
  archive: 'ארכוב',
  delete: 'מחיקה',
  restore: 'שחזור',
}

export function buildLifecycleMessage({ status, action, entityType, entityName }) {
  const e = ENTITY_LABEL[entityType] || 'אובייקט'
  const a = ACTION_LABEL[action] || 'פעולה'
  const name = entityName ? `: ${entityName}` : ''

  if (status === 'success') {
    if (action === 'archive') return `${e} הועבר לארכיון${name}`
    if (action === 'restore') return `${e} שוחזר מהארכיון${name}`
    if (action === 'delete') return `${e} נמחק${name}`
    return `בוצע בהצלחה${name}`
  }

  // error
  if (action === 'archive') return `שגיאה בארכוב ${e}${name}`
  if (action === 'restore') return `שגיאה בשחזור ${e}${name}`
  if (action === 'delete') return `שגיאה במחיקת ${e}${name}`
  return `שגיאה בביצוע ${a}${name}`
}
