// shared/roles/roles.constants.js
import { useMemo } from 'react'

export const STAFF_ROLE_OPTIONS = [
  { id: 'coach', labelH: 'מאמן ראשי', idIcon: 'coach' },
  { id: 'assistant', labelH: 'עוזר מאמן', idIcon: 'assistant' },
  { id: 'analyst', labelH: 'אנליסט', idIcon: 'analyst' },
  { id: 'fitness', labelH: 'מאמן כושר', idIcon: 'fitness' },
  { id: 'scout', labelH: 'סקאוט', idIcon: 'scout' },
  { id: 'contactPerson', labelH: 'איש קשר', idIcon: 'contactPerson' },
  { id: 'teamAdministrator', labelH: 'מנהל קבוצה', idIcon: 'teamAdministrator' },
  { id: 'administrator', labelH: 'מנהל כללי', idIcon: 'administrator' },
  { id: 'psychologist', labelH: 'פסיכולוג ספורט', idIcon: 'psychologist' },
  { id: 'sportingDirector', labelH: 'מנהל מקצועי', idIcon: 'sportingDirector' },
]

// --- מחזיר רשימת תפקידים ש"פנויים" (לא חובה) ---
// הנחה: currentList כולל אובייקטי staff עם type
export function useAvailableStaffRoles(currentList = []) {
  return useMemo(() => {
    const used = new Set((Array.isArray(currentList) ? currentList : []).map((s) => s?.type).filter(Boolean))
    return STAFF_ROLE_OPTIONS.filter((opt) => !used.has(opt.id))
  }, [currentList])
}
