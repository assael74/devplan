import { iconUi } from '../../../../../../ui/core/icons/iconUi'

export const gameFilterGroups = [
  {
    key: 'result',
    title: 'תוצאה',
    options: [
      { value: 'all', label: 'כל התוצאות', startDecorator: iconUi({ id: 'result' }) },
      { value: 'win', label: 'ניצחון', startDecorator: iconUi({ id: 'win' }) },
      { value: 'draw', label: 'תיקו', startDecorator: iconUi({ id: 'draw' }) },
      { value: 'loss', label: 'הפסד', startDecorator: iconUi({ id: 'loss' }) },
    ],
  },
  {
    key: 'type',
    title: 'סוג משחק',
    options: [
      { value: 'all', label: 'כל הסוגים', startDecorator: iconUi({ id: 'league' }) },
      { value: 'league', label: 'ליגה', startDecorator: iconUi({ id: 'league' }) },
      { value: 'cup', label: 'גביע', startDecorator: iconUi({ id: 'cup' }) },
      { value: 'friendly', label: 'ידידות', startDecorator: iconUi({ id: 'friendly' }) },
    ],
  },
  {
    key: 'difficulty',
    title: 'רמת משחק',
    options: [
      { value: 'all', label: 'כל הסוגים', startDecorator: iconUi({ id: 'easy' }) },
      { value: 'easy', label: 'קלה', startDecorator: iconUi({ id: 'easy' }) },
      { value: 'equal', label: 'שווה', startDecorator: iconUi({ id: 'equal' }) },
      { value: 'hard', label: 'קשה', startDecorator: iconUi({ id: 'hard' }) },
    ],
  },
]
