// src/shared/videos/videoCategories.constants.js

export const VIDEO_PRIMARY_CATEGORIES = [
  {
    id: 'possession',
    label: 'משחק עם כדור',
    iconId: 'possession',
    tone: 'green',
    order: 10,
  },
  {
    id: 'attacking_without_ball',
    label: 'התקפה ללא כדור',
    iconId: 'attack',
    tone: 'orange',
    order: 20,
  },
  {
    id: 'defending',
    label: 'משחק הגנה',
    iconId: 'defending',
    tone: 'blue',
    order: 30,
  },
  {
    id: 'transitions',
    label: 'מעברים',
    iconId: 'transitions',
    tone: 'purple',
    order: 40,
  },
  {
    id: 'set_pieces',
    label: 'מצבים נייחים',
    iconId: 'setPieces',
    tone: 'yellow',
    order: 50,
  },
  {
    id: 'training',
    label: 'אימונים',
    iconId: 'training',
    tone: 'cyan',
    order: 60,
  },
  {
    id: 'mental_off_pitch',
    label: 'מנטלי מחוץ למגרש',
    iconId: 'mental',
    tone: 'teal',
    order: 70,
  },
  {
    id: 'general',
    label: 'אחר',
    iconId: 'tag',
    tone: 'neutral',
    order: 80,
  },
]

export const VIDEO_PRIMARY_CATEGORY_BY_ID = VIDEO_PRIMARY_CATEGORIES.reduce(
  (acc, item) => {
    acc[item.id] = item
    return acc
  },
  {}
)

export function getVideoPrimaryCategory(categoryId) {
  return VIDEO_PRIMARY_CATEGORY_BY_ID[String(categoryId || '')] || null
}
