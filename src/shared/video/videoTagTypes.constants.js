//  src/shared/videos/videoTagTypes.constants.js

export const VIDEO_TAG_TYPES = [
  {
    id: 'formation',
    label: 'מבנה / מערך',
    iconId: 'account_tree',
    order: 10,
  },
  {
    id: 'pitch_area',
    label: 'אזור במגרש',
    iconId: 'crop_free',
    order: 20,
  },
  {
    id: 'game_principle',
    label: 'עיקרון משחק',
    iconId: 'psychology',
    order: 30,
  },
  {
    id: 'action_technique',
    label: 'פעולה / טכניקה',
    iconId: 'sports_soccer',
    order: 40,
  },
  {
    id: 'situation',
    label: 'סיטואציה',
    iconId: 'schema',
    order: 50,
  },
  {
    id: 'position_role',
    label: 'עמדה / תפקיד',
    iconId: 'groups',
    order: 60,
  },
  {
    id: 'mental',
    label: 'מנטלי',
    iconId: 'self_improvement',
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
