import { statsParm } from './statsParmList.js'

export const statsParmOptions = [
  { id: 'all', label: 'כולם', labelH: 'כל הפרמטרים', idIcon: 'statsParm', disabled: false },
  { id: 'offensive', label: 'התקפה', labelH: 'פרמטר התקפי', idIcon: 'offensive', disabled: false },
  { id: 'defensive', label: 'הגנה', labelH: 'פרמטר הגנתי', idIcon: 'defensive', disabled: false },
  { id: 'mental', label: 'מנטלי', labelH: 'פרמטר מנטלי', idIcon: 'mental', disabled: false },
  { id: 'goalkeeping', label: 'שוערות', labelH: 'פרמטר שוערות', idIcon: 'goalkeeping', disabled: false },
  { id: 'general', label: 'כללי', labelH: 'פרמטר כללי', idIcon: 'generalParm', disabled: false },
]

export const statsParmTypeFieldOptions = [
  { id: 'number', label: '', labelH: 'מספר', idIcon: 'number', disabled: false },
  { id: 'text', label: '', labelH: 'טקסט', idIcon: 'text', disabled: false },
  { id: 'boolean', label: '', labelH: 'כן/לא', idIcon: 'boolean', disabled: false },
  { id: 'select', label: '', labelH: 'בחירה', idIcon: 'boolean', disabled: false },
]

export const statsViewTypeOptions = [
  { id: 'team', label: '', labelH: 'קבוצה', idIcon: 'teams', disabled: false },
  { id: 'players', label: '', labelH: 'שחקנים', idIcon: 'players', disabled: false },
]

export const statsMobileGroupViewOptions = [
  {
    id: 'timeGroup',
    labelH: 'זמני משחק',
    idIcon: 'time',
    disabled: false,
    fields: ['totalGameTime', 'timePlayed', 'playTimeRate'],
  },
  {
    id: 'qualityGroup',
    labelH: 'תרומה התקפית',
    idIcon: 'star',
    disabled: false,
    fields: ['goals', 'assists', 'xG'],
  },
  ...Array.from(
    statsParm
      .filter((p) => p.statsParmFieldType === 'triplet' && p.tripletGroup)
      .reduce((acc, curr) => {
        const group = curr.tripletGroup
        if (!acc.has(group)) acc.set(group, [])
        acc.get(group).push(curr.id)
        return acc
      }, new Map())
  ).map(([group, fields]) => ({
    id: `${group}Group`,
    labelH:
      statsParm.find((p) => p.tripletGroup === group && p.id.endsWith('Total'))?.statsParmShortName ||
      group,
    idIcon: group,
    disabled: false,
    fields,
  })),
]
