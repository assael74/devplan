//  src/shared/videos/videoTagTypes.constants.js

export const VIDEO_TAG_TYPES = [
  {
    id: 'formation',
    label: 'מבנה / מערך',
    iconId: 'formation',
    order: 10,
  },
  {
    id: 'pitch_area',
    label: 'אזור במגרש',
    iconId: 'pitchArea',
    order: 20,
  },
  {
    id: 'game_principle',
    label: 'עיקרון משחק',
    iconId: 'gamePrinciple',
    order: 30,
  },
  {
    id: 'action_technique',
    label: 'פעולה / טכניקה',
    iconId: 'technique',
    order: 40,
  },
  {
    id: 'situation',
    label: 'סיטואציה',
    iconId: 'situation',
    order: 50,
  },
  {
    id: 'position_role',
    label: 'עמדה / תפקיד',
    iconId: 'positionRole',
    order: 60,
  },
  {
    id: 'mental',
    label: 'מנטלי',
    iconId: 'mental',
    order: 70,
  },
]

export const VIDEO_TAG_TYPE_BY_ID = VIDEO_TAG_TYPES.reduce((acc, item) => {
  acc[item.id] = item
  return acc
}, {})

export function getVideoTagType(typeId) {
  return VIDEO_TAG_TYPE_BY_ID[String(typeId || '')] || null
}
