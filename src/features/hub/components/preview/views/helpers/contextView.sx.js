import { COLORS } from '../../../../../../ui/core/theme/Colors.js'

// --- ישות ---
function getEntity(type) {
  return COLORS.entity[type] || COLORS.entity.player
}

// --- sx בלבד לכפתור ניווט (מבוסס COLORS) ---
export function getEntityNavBtnSx(type) {
  const e = getEntity(type)

  return {
    bgcolor: e.bg,
    color: e.text,
    border: '1px solid',
    borderColor: 'divider',
    '&:hover': {
      bgcolor: e.surface,
    },
  }
}

// --- צבע ברירת מחדל לפי סוג ---
export function getAccentColor(type, entity) {
  const custom = entity?.color?.bg
  if (custom) return custom

  if (type === 'club') return 'warning.500'
  if (type === 'team') return 'success.400'
  return 'primary.500' // player
}

export const previewSx = {
  // --- עטיפת כותרת עם accent ---
  headerWrap: ({ type = 'player', entity }) => ({
    borderRadius: 12,
    p: 0.5,
    borderRight: '3px solid',
    borderColor: getAccentColor(type, entity),
    bgcolor: 'background.level1',
  }),

  // --- שורת צ׳יפים ---
  chipsRow: {
    mt: 1,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
    alignItems: 'center',
    minWidth: 0,
    overflow: 'visible',
    pl: 2
  },

  // --- צ׳יפ מינימלי קומפקטי ---
  chip: (type) => {
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.75,
      px: 1,
      py: 0.5,
      color: getEntity(type).text,
      bgcolor: getEntity(type).bg,
      border: '1px solid',
      borderColor: 'divider',
      fontSize: 13,
      borderRadius: 'sm'
    }
  },

  // --- פעולות ---
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    gap: 0.75,
    mt: 0.5,
  },
}

export const playerPreviewViewSx = {
  // --- שורת כותרת: כותרת מימין, פעולות בשמאל ---
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },

  // --- פעולת התאחדות (כפתור גלולה) ---
  ifaBtn: {
    flexShrink: 0,
    border: '1px solid',
    borderColor: 'neutral.300',
    color: 'neutral.600',
    '&:hover': {
      bgcolor: 'neutral.50',
      borderColor: 'neutral.300',
    },
    //borderRadius: 999,
  },

  // --- שורת צ׳יפים נגללת בלי שינוי גובה ---
  chipsRow: {
    display: 'flex',
    flexWrap: 'nowrap',
    gap: 1,
    pt: 1,
    alignItems: 'center',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  },

  // --- עטיפה לכוכבים ---
  starsWrap: { mt: -1.4, mx: 1 },

  // --- תווית כוכבים ---
  starsLabel: { opacity: 0.75, lineHeight: 1 },
}
