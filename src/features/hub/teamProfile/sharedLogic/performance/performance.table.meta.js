// teamProfile/sharedLogic/performance/performance.table.meta.js

import { iconUi } from '../../../../../ui/core/icons/iconUi'

export const PRESETS = [
  { id: 'general', label: 'בסיסי' },

  { id: 'offensive', label: 'התקפה' },
  { id: 'offensive_key', label: 'התפקה - מפתח' },

  { id: 'defensive', label: 'הגנה' },
  { id: 'defensive_key', label: 'הגנה - מפתח' },
]

export const TRIPLET_GROUP_LABELS = {
  passes: 'מסירות',
  keyPasses: 'מסירות מפתח',
  crosses: 'הגבהות',
  dribbles: 'דריבלים',
  shots: 'איומים',
  tackles: 'תיקולים',
  keyTackles: 'תיקולי מפתח',
  personalPressures: 'לחץ אישי',
  ballClearances: 'הרחקות כדור',
}

// width policy (אחיד ומצומצם)
export const COL_W = 96
export const COL_W_AVATAR = COL_W
export const COL_W_NAME = COL_W
export const COL_W_POS = COL_W
export const COL_W_STAT = COL_W

export const BASE_KEYS = new Set([
  'gamesCount',
  'timePlayed',
  'playTimeRate',
  'goals',
  'assists',
  'position',
  'isStarting',
  'timeVideoStats',
  'recordedMinutesTotal',
  'recordedCoveragePct',
])

export const presetMatch = (presetId, sp) => {
  const type = String(sp?.statsParmType || '').toLowerCase()
  const group = String(sp?.tripletGroup || '').toLowerCase()
  const isKey = group.startsWith('key')

  if (presetId === 'all') return true
  if (presetId === 'general') return type === 'general'

  if (presetId === 'offensive') {
    return type === 'offensive' && !isKey
  }

  if (presetId === 'offensive-key') {
    return type === 'offensive' && isKey
  }

  if (presetId === 'defensive') {
    return type === 'defensive' && !isKey
  }

  if (presetId === 'defensive-key') {
    return type === 'defensive' && isKey
  }

  return false
}

export const getIconIdForKey = (key) => {
  const k = String(key || '').toLowerCase()

  if (k === 'gamescount') return 'games'
  if (k === 'timeplayed') return 'time'
  if (k === 'playtimerate') return 'percent'
  if (k === 'goals') return 'goal'
  if (k === 'assists') return 'assist'

  // קרוסים
  if (k.startsWith('cross')) return 'cross'

  // אופציונלי
  if (k.includes('pass')) return 'pass'
  if (k.includes('tackle') || k.includes('interception') || k.includes('duel')) return 'defense'
  if (k === 'xg') return 'xg'

  return null
}

export const isPctKey = (key) => {
  const k = String(key || '').toLowerCase()
  return k.endsWith('rate') || k.includes('coveragepct') || k.includes('pct')
}

export const getBaseStatKeysByPreset = (preset) => {
  if (preset === 'general') {
    return ['gamesCount', 'timePlayed', 'playTimeRate', 'goals', 'assists']
  }
  return ['timePlayed', 'playTimeRate']
}

// Column factory: identity + base + dyn (אחיד)
export const buildTableCols = ({ preset, baseStatKeys, dynCols }) => {
  const cols = [
    { key: '__avatar', label: '', kind: 'avatar', w: COL_W_AVATAR, align: 'center', isMain: true },
    { key: '__name', label: 'שחקן', kind: 'name', w: COL_W_NAME, align: 'center', sortKey: 'name', isMain: true },
    { key: '__pos', label: 'עמדה', kind: 'pos', w: COL_W_POS, align: 'center', sortKey: 'positions', isMain: true },
  ]

  const pushStat = (key, label, sortKey) => {
    cols.push({
      key,
      label,
      kind: 'stat',
      w: COL_W_STAT,
      align: 'center',
      sortKey: sortKey || key,
      isPct: isPctKey(key),
      iconId: getIconIdForKey(key),
      group: '',      // base stats לא בקבוצה
      isMain: true,   // ✅ base stats נחשבים “ראשיים”
    })
  }

  if (baseStatKeys.includes('gamesCount')) pushStat('gamesCount', 'משחקים', 'games')
  if (baseStatKeys.includes('timePlayed')) pushStat('timePlayed', 'דקות', 'minutes')
  if (baseStatKeys.includes('playTimeRate')) pushStat('playTimeRate', 'אחוז', 'playRate')
  if (baseStatKeys.includes('goals')) pushStat('goals', 'שערים', 'goals')
  if (baseStatKeys.includes('assists')) pushStat('assists', 'בישולים', 'assists')

  ;(dynCols || []).forEach((c) => {
    cols.push({
      key: c.key,
      label: c.label,
      kind: 'stat',
      w: COL_W_STAT,
      align: 'center',
      sortKey: c.key,
      isPct: isPctKey(c.key),
      iconId: getIconIdForKey(c.key),
      group: c.group || '',
      isMain: false, // ✅ דינמיים = אזור משני
    })
  })

  // --- Flags להפרדות ויזואליות ---
  // 1) קו עבה אחרי ה-"Main" האחרון (כלומר לפני הדינמיים הראשונים)
  const firstDynIdx = cols.findIndex((c) => c.kind === 'stat' && !c.isMain)
  if (firstDynIdx > 0) cols[firstDynIdx].isAfterMainSplit = true

  // 2) קו עדין בתחילת כל group דינמי
  let prevGroup = ''
  cols.forEach((c) => {
    const g = c.kind === 'stat' ? String(c.group || '') : ''
    if (g && g !== prevGroup) c.isGroupStart = true
    if (g) prevGroup = g
  })

  return cols
}
